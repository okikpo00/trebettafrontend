// src/pages/Wallet.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../css/wallet.css";

import TransactionList from "../components/TransactionList";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { WalletContext } from "../context/WalletContext";
import CreatePinModal from "../components/CreatePinModal";

import DepositSheet from "../components/DepositSheet";
import WithdrawSheet from "../components/WithdrawSheet";
import OtpSheet from "../components/OtpSheet";
import SavedAccountsSheet from "../components/SavedAccountsSheet";
import PendingDepositBanner from "../components/PendingDepositBanner";

export default function Wallet() {
  const navigate = useNavigate();
  const { wallet, walletLoading, refreshWallet } = useContext(WalletContext);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [activeSheet, setActiveSheet] = useState(null);
  const [pendingDeposit, setPendingDeposit] = useState(null);
  const [pendingWithdraw, setPendingWithdraw] = useState(null);

  const [showCreatePin, setShowCreatePin] = useState(false);

  // 🔁 polling refs (VERY IMPORTANT to avoid leaks)
  const pollRef = useRef(null);
  const lastBalanceRef = useRef(null);

  const showToast = (message, type = "success") =>
    setToast({ message, type });

  /* ----------------------------------
     FETCH TRANSACTIONS
  ---------------------------------- */
  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await api.get("/wallet/transactions", {
        params: { page: 1, limit: 10 },
      });
      setTransactions(res.data?.status ? res.data.data : []);
    } catch {
      showToast("Failed to load transactions", "error");
    } finally {
      setTxLoading(false);
    }
  };

  /* ----------------------------------
     FETCH PENDING DEPOSIT
  ---------------------------------- */
  const fetchPendingDeposit = async () => {
    try {
      const res = await api.get("/wallet/deposit/pending");
      setPendingDeposit(res.data?.status ? res.data.data : null);
    } catch {
      setPendingDeposit(null);
    }
  };

  /* ----------------------------------
     INITIAL LOAD + PIN CHECK
  ---------------------------------- */
  useEffect(() => {
    refreshWallet();
    fetchTransactions();
    fetchPendingDeposit();

    let hasPinFromProfile = null;

    try {
      const rawUser =
        localStorage.getItem("trebettaUser") ||
        localStorage.getItem("trebetta_user") ||
        localStorage.getItem("user");

      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        hasPinFromProfile = parsed?.has_pin;
      }
    } catch {}

    const localFlag = localStorage.getItem("trebetta_has_pin");

    if (localFlag === "yes") return;

    if (hasPinFromProfile === true) {
      localStorage.setItem("trebetta_has_pin", "yes");
      return;
    }

    setShowCreatePin(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------------
     🔁 AUTO WALLET POLLING (NEW)
     Triggers when deposit is pending
  ---------------------------------- */
  useEffect(() => {
    if (!pendingDeposit) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    // store balance before polling
    lastBalanceRef.current = wallet?.balance ?? 0;

    pollRef.current = setInterval(async () => {
      await refreshWallet();
      await fetchPendingDeposit();
      await fetchTransactions();

      const newBalance = wallet?.balance ?? 0;

      // ✅ STOP polling when balance increases
      if (newBalance > lastBalanceRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setPendingDeposit(null);
        showToast("Wallet updated", "success");
      }
    }, 4000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDeposit]);

  /* ----------------------------------
     SHEET CALLBACKS
  ---------------------------------- */
  const handleDepositCreated = (deposit) => {
    setActiveSheet(null);
    setPendingDeposit(deposit);
    fetchPendingDeposit();
  };

  const handleWithdrawInitiated = (withdraw) => {
    setPendingWithdraw(withdraw);
    setActiveSheet("otp");
  };

  const handleWithdrawConfirmed = () => {
    setActiveSheet(null);
    setPendingWithdraw(null);
    refreshWallet();
    fetchTransactions();
    showToast("Withdrawal processing", "success");
  };

  /* ----------------------------------
     PIN CREATED
  ---------------------------------- */
  const handlePinCreated = () => {
    localStorage.setItem("trebetta_has_pin", "yes");
    setShowCreatePin(false);
  };

  const balance = wallet?.balance || 0;

  /* ----------------------------------
     RENDER
  ---------------------------------- */
  return (
    <div className="wallet-page container">
      <header className="wallet-header">
        <h1 className="wallet-title">Wallet</h1>
        <button className="wallet-refresh" onClick={refreshWallet}>
          Refresh
        </button>
      </header>

      {pendingDeposit && (
        <PendingDepositBanner
          deposit={pendingDeposit}
          onViewDetails={() =>
            navigate("/wallet/deposit/pending", {
              state: { deposit: pendingDeposit },
            })
          }
        />
      )}

      <section className="wallet-balance-card">
        <div className="wallet-balance-label">Available balance</div>
        <div className="wallet-balance-value">
          ₦{Number(balance).toLocaleString("en-NG")}
        </div>

        <div className="wallet-actions">
          <button className="btn primary" onClick={() => setActiveSheet("deposit")}>
            Deposit
          </button>
          <button
            className="btn ghost"
            disabled={balance <= 0}
            onClick={() => setActiveSheet("withdraw")}
          >
            Withdraw
    
          </button>
        </div>
      </section>

      <section className="wallet-activity">
        <h2 className="wallet-section-title">Recent activity</h2>

        {txLoading ? (
          <Loader />
        ) : transactions.length === 0 ? (
          <p className="wallet-empty small muted">No transactions yet.</p>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </section>

      <DepositSheet
        isOpen={activeSheet === "deposit"}
        onClose={() => setActiveSheet(null)}
        onCreated={handleDepositCreated}
        showToast={showToast}
      />

      <WithdrawSheet
        isOpen={activeSheet === "withdraw"}
        onClose={() => setActiveSheet(null)}
        onInitiated={handleWithdrawInitiated}
        showToast={showToast}
      />

      <OtpSheet
        isOpen={activeSheet === "otp"}
        withdrawData={pendingWithdraw}
        onClose={() => setActiveSheet(null)}
        onConfirmed={handleWithdrawConfirmed}
        showToast={showToast}
      />

      <SavedAccountsSheet
        isOpen={activeSheet === "saved"}
        onClose={() => setActiveSheet(null)}
        onSelectAccount={(acc) => {
          localStorage.setItem(
            "trebetta_selected_saved_account",
            JSON.stringify(acc)
          );
          setActiveSheet("withdraw");
        }}
      />

      {showCreatePin && (
        <CreatePinModal
          onCreated={handlePinCreated}
          onClose={() => setShowCreatePin(false)}
          showToast={showToast}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
