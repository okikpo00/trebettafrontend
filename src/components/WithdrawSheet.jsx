// src/components/WithdrawSheet.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";
import BANKS from "../data/banks";
import "../css/withdrawSheet.css";

const MIN_WITHDRAW = 1000;
// 🔹 ADDED: frontend-only withdraw fee config
const WITHDRAW_FEE_RATE = 0.01; // 1%
const WITHDRAW_FEE_CAP = 200;   // ₦200 max

export default function WithdrawSheet({
  isOpen,
  onClose,
  onInitiated,
  showToast
}) {
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
// 🔹 ADDED: frontend-only fee calculation
const numericAmount = Number(amount) || 0;
const calculatedFee = Math.min(
  Math.ceil(numericAmount * WITHDRAW_FEE_RATE),
  WITHDRAW_FEE_CAP
);
const receiveAmount = Math.max(numericAmount - calculatedFee, 0);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
  }, [isOpen]);

  const reset = () => {
    setAmount("");
    setBankId("");
    setAccountNumber("");
    setAccountName("");
    setPin("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    const cleanAmt = Number(amount);

    if (cleanAmt < MIN_WITHDRAW) {
      setError(`Minimum withdrawal is ₦${MIN_WITHDRAW}`);
      return;
    }

    if (!bankId) {
      setError("Please select a bank");
      return;
    }

    if (accountNumber.length !== 10) {
      setError("Account number must be exactly 10 digits");
      return;
    }

    if (!accountName || accountName.length < 3) {
      setError("Enter the correct account name");
      return;
    }

    if (pin.length !== 4) {
      setError("Transaction PIN must be 4 digits");
      return;
    }

    setLoading(true);

    try {
      const bank = BANKS.find(b => b.id === bankId);

      const res = await api.post("/wallet/withdraw/initiate", {
        amount: cleanAmt,
        bank_code: bank.code,
        bank_name: bank.name,
        account_number: accountNumber,
        account_name: accountName,
        pin
      });

      if (res.data?.status) {
        onInitiated(res.data.data);
        reset();
      } else {
        setError(res.data?.message || "Withdrawal failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheetPortal>
      <div className="sheet-backdrop" onClick={() => { reset(); onClose(); }}>
        <div className="sheet-card" onClick={(e) => e.stopPropagation()}>

          <div className="sheet-handle" />

          <h3 className="sheet-title">Withdraw Funds</h3>
          <p className="sheet-subtitle">
            Withdraw securely to your bank account. OTP will be sent to your email.
          </p>

          {error && <div className="sheet-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount (₦)</label>
              <input
                type="number"
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
            {/* 🔹 ADDED: Fee breakdown (frontend-only) */}
{numericAmount > 0 && (
  <div className="fee-breakdown">
    <div className="fee-row">
      <span className="small muted">Withdrawal fee</span>
      <span className="small">
        ₦{calculatedFee.toLocaleString("en-NG")}
      </span>
    </div>

    <div className="fee-row total">
      <span className="small">You’ll receive</span>
      <span className="small strong">
        ₦{receiveAmount.toLocaleString("en-NG")}
      </span>
    </div>
  </div>
)}


            <div className="form-group">
              <label>Bank</label>
              <select
                className="input"
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
              >
                <option value="">Select bank</option>
                {BANKS.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Account number</label>
              <input
                className="input"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v) && v.length <= 10) setAccountNumber(v);
                }}
                placeholder="10-digit account number"
              />
            </div>

            <div className="form-group">
              <label>Account name</label>
              <input
                className="input"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account holder name"
              />
              <p className="hint">
                Ensure this account belongs to you and matches your trebetta account name.  Trebetta rejects third-party accounts.
              </p>
            </div>

            <div className="form-group">
              <label>Transaction PIN</label>
              <div className="pin-input">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className={pin[i] ? "filled" : ""}>•</span>
                ))}
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v) && v.length <= 4) setPin(v);
                  }}
                />
              </div>

              <button
                type="button"
                className="link-btn"
                onClick={() => showToast("Reset PIN from settings", "info")}
              >
                Forgot PIN?
              </button>
            </div>

            <div className="sheet-footer">
              <button type="button" className="btn ghost" onClick={() => { reset(); onClose(); }}>
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
