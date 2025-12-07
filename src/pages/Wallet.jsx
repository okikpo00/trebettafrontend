// src/pages/Wallet.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import "../css/wallet.css";

import BalanceCard from "../components/BalanceCard";
import TransactionList from "../components/TransactionList";
import DepositModal from "../components/DepositModal";
import WithdrawModal from "../components/WithdrawModal";
import CreatePinModal from "../components/CreatePinModal";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { WalletContext } from "../context/WalletContext";

export default function Wallet() {
  const { wallet, walletLoading, refreshWallet } = useContext(WalletContext);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showCreatePin, setShowCreatePin] = useState(false);

  const [toast, setToast] = useState(null);

  const [txPage] = useState(1);
  const [txLimit] = useState(30);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await api.get("/wallet/transactions", {
        params: { page: txPage, limit: txLimit },
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

  // Initial load: wallet + tx + PIN check
  useEffect(() => {
    refreshWallet();
    fetchTransactions();

    // Prefer backend-driven has_pin from stored user profile if available
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
    } catch (e) {
      // ignore parse errors
    }

    const localFlag = localStorage.getItem("trebetta_has_pin");

    if (localFlag === "yes") {
      // already knows user has PIN
      return;
    }

    if (hasPinFromProfile === true) {
      // backend says user already has PIN – never show modal
      localStorage.setItem("trebetta_has_pin", "yes");
      return;
    }

    // Either backend says no PIN, or we don't know yet → ask user to create
    setShowCreatePin(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    refreshWallet();
    fetchTransactions();
  };

  const handleDepositSuccess = () => {
    refreshWallet();
    fetchTransactions();
  };

  const handleWithdrawSuccess = () => {
    refreshWallet();
    fetchTransactions();
  };

  const handlePinCreated = () => {
    localStorage.setItem("trebetta_has_pin", "yes");
    setShowCreatePin(false);
  };

  return (
    <div className="wallet-page container">
      <div className="wallet-header space-between">
        <div className="wallet-title-block">
          <h1 className="wallet-title">Wallet</h1>
          <p className="wallet-subtitle small muted">
            Fund your Trebetta wallet and withdraw securely to your bank.
          </p>
        </div>
        <button
          className="btn ghost wallet-refresh-btn"
          type="button"
          onClick={handleRefresh}
        >
          ↻ Refresh
        </button>
      </div>

      <section className="wallet-top-section">
        <div className="wallet-balance-wrapper">
          {walletLoading ? (
            <div className="card wallet-balance-card skeleton">
              <div className="wallet-balance-label skeleton-bar" />
              <div className="wallet-balance-value skeleton-bar" />
              <div className="wallet-balance-actions skeleton-bar" />
            </div>
          ) : (
            <BalanceCard
              balance={wallet?.balance || 0}
              currency={wallet?.currency || "NGN"}
              onDeposit={() => setShowDeposit(true)}
              onWithdraw={() => setShowWithdraw(true)}
            />
          )}
        </div>
      </section>

      <section className="wallet-activity-section">
        <div className="wallet-activity-header space-between">
          <h2 className="wallet-activity-title">Recent Activity</h2>
          {/* Future filters: All / Deposits / Withdrawals / Pools / Payouts */}
        </div>

        {txLoading ? (
          <div className="wallet-tx-skeleton">
            <Loader />
          </div>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </section>

      {showDeposit && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          onCompleted={handleDepositSuccess}
          showToast={showToast}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          onClose={() => setShowWithdraw(false)}
          onCompleted={handleWithdrawSuccess}
          showToast={showToast}
        />
      )}

      {showCreatePin && (
        <CreatePinModal
          onClose={() => setShowCreatePin(false)}
          onCreated={handlePinCreated}
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