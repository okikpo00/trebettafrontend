// src/pages/PendingDeposit.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import "../css/wallet.css";

import Toast from "../components/Toast";
import Loader from "../components/Loader";
import { Copy, CheckCircle2, Clock } from "lucide-react";

export default function PendingDeposit() {
  const location = useLocation();
  const navigate = useNavigate();

  const [deposit, setDeposit] = useState(
    location.state?.deposit || null
  );

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [expired, setExpired] = useState(false);

  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") =>
    setToast({ message, type });

  // Load from sessionStorage if state is empty (user refreshed page)
  useEffect(() => {
    if (!deposit) {
      try {
        const saved = sessionStorage.getItem("trebetta_pending_deposit");
        if (saved) {
          setDeposit(JSON.parse(saved));
        }
      } catch (_) {}
    }
  }, [deposit]);

  // Setup countdown
  useEffect(() => {
    if (!deposit?.expires_at) return;

    const expiresAt = new Date(deposit.expires_at).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setRemainingSeconds(diff);
      setExpired(diff <= 0);
    };

    tick();
    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [deposit?.expires_at]);

  if (!deposit) {
    return (
      <div className="pending-deposit-page container">
        <div className="pending-deposit-card card">
          <h2 className="pending-title">No active deposit</h2>
          <p className="small muted">
            We couldn&apos;t find any pending deposit instructions.
          </p>
          <button
            type="button"
            className="btn primary"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/wallet")}
          >
            Back to wallet
          </button>
        </div>
      </div>
    );
  }

  const { amount, reference, bank, sender_name, sender_bank } = deposit;

  const formattedAmount =
    "₦" + Number(amount || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(String(text));
      showToast(`${label} copied`, "success");
    } catch {
      showToast(`Could not copy ${label.toLowerCase()}`, "error");
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await api.get("/wallet/transactions", {
        params: { page: 1, limit: 20 },
      });

      const list = res.data?.data || res.data || [];
      const match = Array.isArray(list)
        ? list.find(
            (tx) =>
              (tx.reference && tx.reference === reference) &&
              (tx.status === "success" ||
                tx.status === "successful" ||
                tx.status === "completed")
          )
        : null;

      if (match) {
        showToast("Deposit confirmed. Your wallet should be updated.", "success");
        // Clear pending deposit & send user back
        try {
          sessionStorage.removeItem("trebetta_pending_deposit");
        } catch (_) {}
        setTimeout(() => navigate("/wallet"), 600);
      } else {
        showToast(
          "Still processing. If you already transferred, we’ll update once it is confirmed.",
          "info"
        );
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Unable to check status right now.",
        "error"
      );
    } finally {
      setChecking(false);
    }
  };

  const handleNewDeposit = () => {
    try {
      sessionStorage.removeItem("trebetta_pending_deposit");
    } catch (_) {}
    navigate("/wallet");
  };

  return (
    <div className="pending-deposit-page container">
      <div className="pending-deposit-card card">
        <div className="pending-header">
          <div>
            <h2 className="pending-title">Complete your deposit</h2>
            <p className="small muted">
              Transfer this exact amount to the Trebetta account below.
            </p>
          </div>
          <div className="pending-timer">
            <Clock size={18} />
            <span className="pending-timer-text">
              {expired ? "Expired" : formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* AMOUNT */}
        <div className="pending-amount-row">
          <div>
            <div className="small muted">Amount to transfer</div>
            <div className="pending-amount">{formattedAmount}</div>
          </div>
          <button
            type="button"
            className="btn ghost pending-copy-btn"
            onClick={() => handleCopy(formattedAmount.replace("₦", ""), "Amount")}
          >
            <Copy size={16} />
            <span className="small">Copy</span>
          </button>
        </div>

        {/* BANK CARD */}
        <div className="pending-bank-card">
          <div className="pending-bank-row">
            <div className="small muted">Bank name</div>
            <div className="pending-bank-value">
              {bank?.bank_name || "STERLING BANK"}
            </div>
          </div>

          <div className="pending-bank-row">
            <div className="small muted">Account number</div>
            <div className="pending-bank-value pending-mono">
              {bank?.account_number || "-"}
            </div>
            <button
              type="button"
              className="btn ghost pending-copy-btn"
              onClick={() =>
                handleCopy(bank?.account_number || "", "Account number")
              }
            >
              <Copy size={16} />
              <span className="small">Copy</span>
            </button>
          </div>

          <div className="pending-bank-row">
            <div className="small muted">Account name</div>
            <div className="pending-bank-value">
              {bank?.account_name || "-"}
            </div>
          </div>
        </div>

        {/* REFERENCE + SENDER INFO */}
        <div className="pending-extra-grid">
          <div className="pending-extra-card">
            <div className="small muted">Payment reference</div>
            <div className="pending-ref-row">
              <span className="pending-ref-text pending-mono">
                {reference}
              </span>
              <button
                type="button"
                className="btn ghost pending-copy-btn"
                onClick={() => handleCopy(reference, "Reference")}
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="small muted">
              Use this reference if your bank allows it. It helps us confirm
              your payment faster.
            </p>
          </div>

          <div className="pending-extra-card">
            <div className="small muted">You&apos;re sending from</div>
            <div className="pending-sender-line">
              <span>{sender_name || "Your bank account"}</span>
              <span className="small muted">
                {sender_bank || ""}{" "}
                {sender_bank && bank?.bank_name ? "→" : ""}
                {bank?.bank_name || ""}
              </span>
            </div>
          </div>
        </div>

        {/* INFO TEXT */}
        <div className="pending-info small muted">
          <CheckCircle2 size={16} />
          <span>
            Transfer only within this time window. If the timer expires, please
            start a new deposit. Do not transfer after the window has expired.
          </span>
        </div>

        {/* ACTIONS */}
        <div className="pending-actions">
          <button
            type="button"
            className="btn"
            onClick={handleNewDeposit}
          >
            Start new deposit
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={checking || expired}
            onClick={handleCheckStatus}
          >
            {checking ? <Loader small /> : "Check status"}
          </button>
        </div>
      </div>

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
