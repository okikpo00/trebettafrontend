// src/pages/Wallet.jsx
import React, { useContext, useEffect, useState } from "react";
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

  // sheet control
  const [activeSheet, setActiveSheet] = useState(null);
  const [pendingDeposit, setPendingDeposit] = useState(null);
  const [pendingWithdraw, setPendingWithdraw] = useState(null);

  // PIN modal
  const [showCreatePin, setShowCreatePin] = useState(false);

  const showToast = (message, type = "success") =>
    setToast({ message, type });

  // ---------------------------
  // Fetch wallet transactions
  // ---------------------------
  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await api.get("/wallet/transactions", {
        params: { page: 1, limit: 10 },
      });
      if (res.data?.status && Array.isArray(res.data.data)) {
        setTransactions(res.data.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      showToast("Failed to load transactions", "error");
    } finally {
      setTxLoading(false);
    }
  };

  // ---------------------------
  // Fetch pending deposit
  // ---------------------------
  const fetchPendingDeposit = async () => {
    try {
      const res = await api.get("/wallet/deposit/pending");
      if (res.data?.status && res.data.data) {
        setPendingDeposit(res.data.data);
      } else {
        setPendingDeposit(null);
      }
    } catch (_) {}
  };

  // ---------------------------
  // INITIAL LOAD + PIN CHECK
  // ---------------------------
  useEffect(() => {
    refreshWallet();
    fetchTransactions();
    fetchPendingDeposit();

    /**
     * 🔐 CORRECT PIN LOGIC (FINAL)
     *
     * Rule:
     * 1. If device already confirmed → never ask again
     * 2. Else if backend says has_pin=true → confirm & never ask
     * 3. Else → show create PIN
     */

    let hasPinFromProfile = null;

    try {
      const rawUser =
        localStorage.getItem("trebettaUser") ||
        localStorage.getItem("trebetta_user") ||
        localStorage.getItem("user");

      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && typeof parsed.has_pin === "boolean") {
          hasPinFromProfile = parsed.has_pin;
        }
      }
    } catch (_) {}

    const localFlag = localStorage.getItem("trebetta_has_pin");

    // already confirmed on this device
    if (localFlag === "yes") return;

    // backend confirms PIN exists
    if (hasPinFromProfile === true) {
      localStorage.setItem("trebetta_has_pin", "yes");
      return;
    }

    // first-time user
    setShowCreatePin(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Sheet callbacks
  // ---------------------------
  const handleDepositCreated = (deposit) => {
    setActiveSheet(null);
    setPendingDeposit(deposit);
    navigate("/wallet/deposit/pending", { state: { deposit } });
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

  // ---------------------------
  // PIN created
  // ---------------------------
  const handlePinCreated = () => {
    localStorage.setItem("trebetta_has_pin", "yes");
    setShowCreatePin(false);
  };

  const balance = wallet?.balance || 0;

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="wallet-page container">
      {/* HEADER */}
      <header className="wallet-header">
        <h1 className="wallet-title">Wallet</h1>
        <button className="wallet-refresh" onClick={refreshWallet}>
          Refresh
        </button>
      </header>

      {/* PENDING DEPOSIT */}
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

      {/* BALANCE CARD */}
      <section className="wallet-balance-card">
        <div className="wallet-balance-label">Available balance</div>
        <div className="wallet-balance-value">
          ₦{Number(balance).toLocaleString("en-NG")}
        </div>

        <div className="wallet-actions">
          <button
            className="btn primary"
            onClick={() => setActiveSheet("deposit")}
          >
            Deposit
          </button>

          <button
            className="btn ghost"
            disabled={balance <= 0}
            onClick={() => setActiveSheet("withdraw")}
          >
            Withdraw
          </button>

          <button
            className="btn ghost"
            onClick={() => setActiveSheet("saved")}
          >
            Saved accounts
          </button>
        </div>
      </section>

      {/* ACTIVITY */}
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

      {/* SHEETS */}
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

      {/* CREATE PIN (FIRST TIME ONLY) */}
      {showCreatePin && (
        <CreatePinModal
          onCreated={handlePinCreated}
          onClose={() => setShowCreatePin(false)}
          showToast={showToast}
        />
      )}

      {/* TOAST */}
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
