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

  // central single-sheet control
  const [activeSheet, setActiveSheet] = useState(null);
  // values: null | "deposit" | "withdraw" | "otp" | "savedAccounts"

  const [pendingDeposit, setPendingDeposit] = useState(null);
  const [pendingWithdraw, setPendingWithdraw] = useState(null);

  const [showCreatePin, setShowCreatePin] = useState(false);

  const showToast = (message, type = "success") =>
    setToast({ message, type });

  // ---- Load transactions ----
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
      showToast(
        err?.response?.data?.message || "Failed to load transactions",
        "error"
      );
    } finally {
      setTxLoading(false);
    }
  };

  // ---- Load pending deposit from backend ----
  const fetchPendingDeposit = async () => {
    try {
      const res = await api.get("/wallet/deposit/pending");
      if (res.data?.status && res.data.data) {
        setPendingDeposit(res.data.data);
      } else {
        setPendingDeposit(null);
      }
    } catch (err) {
      console.warn("Failed to load pending deposit", err);
    }
  };

  // ---- Initial load: wallet + tx + PIN check + pending deposit ----
  useEffect(() => {
    refreshWallet();
    fetchTransactions();
    fetchPendingDeposit();

    // PIN modal logic
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

    if (localFlag === "yes") return;
    if (hasPinFromProfile === true) {
      localStorage.setItem("trebetta_has_pin", "yes");
      return;
    }

    setShowCreatePin(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    refreshWallet();
    fetchTransactions();
    fetchPendingDeposit();
  };

  // ensure only one sheet is open at a time
  const openOnly = (sheet) => {
    setActiveSheet(sheet);
  };

  // callbacks used by sheets
  const handleDepositCreated = (depositData) => {
    setActiveSheet(null);
    setPendingDeposit(depositData);

    try {
      sessionStorage.setItem("trebetta_pending_deposit", JSON.stringify(depositData));
    } catch (_) {}

    // navigate to existing pending deposit page (keeps your current flow)
    navigate("/wallet/deposit/pending", { state: { deposit: depositData } });
  };

  const handleWithdrawInitiated = (withdrawData) => {
    setPendingWithdraw(withdrawData);
    // close withdraw sheet, open OTP sheet
    setActiveSheet("otp");
  };

  const handleWithdrawConfirmed = () => {
    setActiveSheet(null);
    setPendingWithdraw(null);
    showToast("Withdrawal is now processing", "success");
    refreshWallet();
    fetchTransactions();
  };

  const handlePinCreated = () => {
    localStorage.setItem("trebetta_has_pin", "yes");
    setShowCreatePin(false);
  };

  const currentBalance = wallet?.balance || 0;

  return (
    <div className="wallet-page container oxblood-theme">
      {/* HEADER */}
      <div className="wallet-header">
        <div className="wallet-header-left">
          <h1 className="wallet-title">Wallet</h1>
          <p className="wallet-subtitle small muted">
             manage deposits, withdrawals and activity.
          </p>
        </div>

        <div className="wallet-header-actions">
          <button className="btn ghost wallet-refresh-btn" type="button" onClick={handleRefresh}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="wallet-grid">
        {/* LEFT: Balance card + actions */}
        <div className="wallet-left">
          {/* PENDING DEPOSIT BANNER */}
          {pendingDeposit && (
            <PendingDepositBanner
              deposit={pendingDeposit}
              onViewDetails={() =>
                navigate("/wallet/deposit/pending", { state: { deposit: pendingDeposit } })
              }
            />
          )}

          <div className="oxblood-card">
            <div className="card-top">
              <div className="card-brand">TREBETTA</div>
              <div className="card-currency">NGN</div>
            </div>

            <div className="card-balance">
              <div className="balance-label">Available balance</div>
              <div className="balance-value">
                ₦{Number(currentBalance).toLocaleString("en-NG", { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="card-meta">
              <div className="card-note">Secure — powered by Sterling</div>
            </div>

            <div className="card-actions action-buttons">
              <button
                className={`btn primary ${activeSheet === "deposit" ? "active-action" : ""}`}
                onClick={() => openOnly(activeSheet === "deposit" ? null : "deposit")}
              >
                Deposit
              </button>

              <button
                className={`btn outline ${activeSheet === "withdraw" ? "active-action" : ""}`}
                onClick={() => openOnly(activeSheet === "withdraw" ? null : "withdraw")}
                disabled={walletLoading || Number(currentBalance) <= 0}
              >
                Withdraw
              </button>

              <button
                className={`btn ghost ${activeSheet === "saved" ? "active-action" : ""}`}
                onClick={() => openOnly(activeSheet === "saved" ? null : "saved")}
              >
                Saved Accounts
              </button>
            </div>
          </div>

          {/* small pro tips */}
          <div className="wallet-protips small muted">
             Use Deposits to fund pools. Withdrawals require PIN + OTP 
          </div>
        </div>

        {/* RIGHT: Activity / transactions */}
        <div className="wallet-right">
          <div className="wallet-activity-header">
            <h2 className="wallet-activity-title">Recent activity</h2>
          </div>

          {txLoading ? (
            <div className="wallet-tx-skeleton">
              <Loader />
            </div>
          ) : transactions.length === 0 ? (
            <div className="wallet-empty-state small muted">
              No wallet transactions yet. Once you deposit, withdraw or get admin credits, they will show here.
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>
      </div>

      {/* BOTTOM-SHEETS */}
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
        onClose={() => setActiveSheet(null)}
        withdrawData={pendingWithdraw}
        onConfirmed={handleWithdrawConfirmed}
        showToast={showToast}
      />

      <SavedAccountsSheet
        isOpen={activeSheet === "saved"}
        onClose={() => setActiveSheet(null)}
        onSelectAccount={(acc) => {
          // open withdraw sheet and preselect account via custom event (we'll use localStorage quick hack)
          try {
            localStorage.setItem("trebetta_selected_saved_account", JSON.stringify(acc));
          } catch (_) {}
          setActiveSheet("withdraw");
        }}
        showToast={showToast}
      />

      {showCreatePin && (
        <CreatePinModal onClose={() => setShowCreatePin(false)} onCreated={handlePinCreated} showToast={showToast} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
