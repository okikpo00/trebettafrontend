// src/components/WithdrawSheet.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";
import BANKS from "../data/banks";

const MIN_WITHDRAW = 1000;

export default function WithdrawSheet({
  isOpen,
  onClose,
  onInitiated,
  showToast,
  profile
}) {
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountResolved, setAccountResolved] = useState(false);
  const [pin, setPin] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);

  const [loading, setLoading] = useState(false);
  const [feeRules, setFeeRules] = useState([]);
  const [feePreview, setFeePreview] = useState(0);

  // 🔴 LOCAL ERROR (THIS IS THE FIX)
  const [localError, setLocalError] = useState("");

  const amountRef = useRef(null);

  const displayName =
    profile?.full_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "";

  useEffect(() => {
    if (!isOpen) return;
    setLocalError("");

    const load = async () => {
      try {
        const res = await api.get("/wallet/fees");
        if (res.data?.status) setFeeRules(res.data.data);
      } catch (_) {}
    };
    load();
  }, [isOpen]);

  useEffect(() => {
    const amt = Number(amount);
    if (!amt || amt < MIN_WITHDRAW) {
      setFeePreview(0);
      return;
    }

    let fee = 0;
    for (const r of feeRules) {
      const min = Number(r.min || 0);
      const max = r.max == null ? Infinity : Number(r.max);
      if (amt >= min && amt <= max) {
        fee = Number(r.fee || 0);
        break;
      }
    }
    setFeePreview(fee);
  }, [amount, feeRules]);

  useEffect(() => {
    if (!accountNumber || !bankId || accountNumber.length !== 10) {
      setAccountResolved(false);
      return;
    }

    const handler = setTimeout(async () => {
      const bankObj = BANKS.find((b) => b.id === bankId);
      if (!bankObj) return;

      try {
        const res = await api.post("/bank/resolve", {
          account_number: accountNumber,
          bank_code: bankObj.code
        });

        if (res.data?.status && res.data.data?.account_name) {
          setAccountName(res.data.data.account_name);
          setAccountResolved(true);
        } else {
          setLocalError("Could not resolve account name. Enter manually.");
          setAccountResolved(false);
        }
      } catch {
        setLocalError("Account resolve service unavailable.");
        setAccountResolved(false);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [accountNumber, bankId]);

  const reset = () => {
    setAmount("");
    setBankId("");
    setAccountNumber("");
    setAccountName("");
    setAccountResolved(false);
    setPin("");
    setSaveAccount(true);
    setFeePreview(0);
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanAmt = Number(amount);

    if (cleanAmt < MIN_WITHDRAW) {
      setLocalError(`Minimum withdrawal is ₦${MIN_WITHDRAW}`);
      return;
    }

    if (String(accountNumber).length !== 10) {
      setLocalError("Account number must be exactly 10 digits");
      return;
    }

    <p className="tiny muted">
  Ensure this bank account belongs to you. Withdrawals to third-party accounts may be rejected.
</p>


    if (!bankId || !accountName || !pin || pin.length < 4) {
      setLocalError("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    setLocalError("");

    try {
      const bankObj = BANKS.find((b) => b.id === bankId);

      const res = await api.post("/wallet/withdraw/initiate", {
        amount: cleanAmt,
        bank_code: bankObj?.code,
        bank_name: bankObj?.name,
        account_number: accountNumber,
        account_name: accountName,
        pin,
        save_account: saveAccount
      });

      if (res.data?.status && res.data.data) {
        showToast("Withdrawal OTP sent", "success");
        onInitiated(res.data.data);
        reset();
      } else {
        setLocalError(res.data?.message || "Withdrawal failed");
      }
    } catch (err) {
      setLocalError(
        err?.response?.data?.message || "Withdrawal initiation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const amt = Number(amount) || 0;
  const payout = Math.max(0, amt - feePreview);

  return (
    <BottomSheetPortal>
      <div className="bottom-sheet-backdrop" onClick={() => { reset(); onClose(); }}>
        <div className="bottom-sheet luxe" onClick={(e) => e.stopPropagation()}>
          <div className="bottom-sheet-handle" />

          <div className="bottom-sheet-header">
            <h3 className="bottom-sheet-title">Withdraw</h3>
            <p className="bottom-sheet-subtitle small">
              Withdraw to your bank. Confirm with OTP sent to your email. NOTE make sure your bank name matches your Trebetta profile name to avoid rejection.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bottom-sheet-body">

            {/* 🔴 LOCAL ERROR BANNER */}
            {localError && (
              <div className="sheet-error">
                {localError}
              </div>
            )}

            {/* AMOUNT */}
            <div className="form-group">
              <label>Amount (₦)</label>
              <input
                ref={amountRef}
                className="input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>

            {amt >= MIN_WITHDRAW && (
              <div className="tiny wallet-fee-preview">
                Fee: <strong>₦{feePreview}</strong> • You receive:{" "}
                <strong>₦{payout}</strong>
              </div>
            )}

            {/* BANK */}
            <div className="form-group">
              <label>Bank</label>
              <select
                className="input"
                value={bankId}
                onChange={(e) => {
                  setBankId(e.target.value);
                  setAccountResolved(false);
                }}
              >
                <option value="">Choose bank</option>
                {BANKS.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* ACCOUNT NUMBER */}
            <div className="form-group">
              <label>Account number</label>
              <input
                className="input"
                value={accountNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v) && v.length <= 10) {
                    setAccountNumber(v);
                    setAccountResolved(false);
                  }
                }}
                placeholder="10-digit account number"
              />
            </div>

            {/* ACCOUNT NAME */}
            <div className="form-group">
              <label>Account name</label>
              <input
                className="input"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                readOnly={accountResolved}
                placeholder="Account name"
              />
            </div>

            {/* PIN */}
            <div className="form-group">
              <label>Transaction PIN</label>
          <input
  className="input"
  type="password"
  inputMode="numeric"
  maxLength={4}
  value={pin}
  onChange={(e) => {
    const v = e.target.value;
    if (/^\d*$/.test(v) && v.length <= 4) {
      setPin(v);
    }
  }}
  placeholder="4-digit PIN"
/>

            </div>


            <div className="bottom-sheet-footer">
              <button type="button" className="btn ghost" onClick={() => { reset(); onClose(); }}>
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? "Sending OTP..." : "Request withdrawal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
