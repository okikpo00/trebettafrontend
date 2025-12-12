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

  const amountRef = useRef(null);

  // Trebetta profile name
  const displayName =
    profile?.full_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "";

  // Load fee rules
  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      try {
        const res = await api.get("/wallet/fees");
        if (res.data?.status) setFeeRules(res.data.data);
      } catch (_) {}
    };
    load();
  }, [isOpen]);

  // calculate fee
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

  // resolve bank account
  useEffect(() => {
    if (!accountNumber || !bankId) {
      setAccountResolved(false);
      return;
    }

    if (accountNumber.length !== 10) {
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
          setAccountResolved(false);
          showToast("Could not resolve account name — enter manually", "error");
        }
      } catch (_) {
        setAccountResolved(false);
        showToast(
          "Account resolve service unavailable — enter name manually",
          "error"
        );
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [accountNumber, bankId]);

  const triggerShake = () => {
    if (!amountRef.current) return;
    amountRef.current.classList.remove("shake");
    amountRef.current.offsetWidth;
    amountRef.current.classList.add("shake");
  };

  const reset = () => {
    setAmount("");
    setBankId("");
    setAccountNumber("");
    setAccountName("");
    setAccountResolved(false);
    setPin("");
    setSaveAccount(true);
    setFeePreview(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanAmt = Number(amount);

    if (cleanAmt < MIN_WITHDRAW) {
      triggerShake();
      showToast(`Minimum withdrawal is ₦${MIN_WITHDRAW}`, "error");
      return;
    }

    // 10-digit validation
    if (String(accountNumber).length !== 10) {
      showToast("Account number must be exactly 10 digits", "error");
      return;
    }

    // Name mismatch validation
    if (
      accountName.trim().toLowerCase() !== displayName.trim().toLowerCase()
    ) {
      showToast(
        "Withdrawal rejected — bank account name does not match your Trebetta name.",
        "error"
      );
      return;
    }

    if (!bankId || !accountName || !pin || pin.length < 4) {
      showToast("Please fill all required fields correctly", "error");
      return;
    }

    setLoading(true);

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
        showToast(res.data?.message || "Withdrawal failed", "error");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Withdrawal initiation failed",
        "error"
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
              Withdraw to your bank. Confirm with OTP sent to your email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bottom-sheet-body">
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

            {/* FEES */}
            {amt >= MIN_WITHDRAW ? (
              <div className="tiny wallet-fee-preview">
                Fee: <strong>₦{feePreview}</strong> • You will receive:{" "}
                <strong>₦{payout}</strong>
              </div>
            ) : (
              <div className="tiny" style={{ color: "var(--danger)" }}>
                Minimum withdrawal is ₦{MIN_WITHDRAW}
              </div>
            )}

            {/* BANK SELECT */}
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
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
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
              <div className="tiny" style={{ opacity: 0.75, marginTop: 3 }}>
                Ensure this is your correct account number to avoid failed withdrawals.
              </div>
            </div>

            {/* ACCOUNT NAME */}
            <div className="form-group">
              <label>Account name</label>
              <input
                className="input"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={
                  accountResolved ? "Resolved name" : "Enter account name"
                }
                readOnly={accountResolved}
              />
            </div>

            {/* PIN */}
            <div className="form-group">
              <label>Transaction PIN</label>
              <input
                className="input"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN"
              />
            </div>

            {/* SAVE ACCOUNT */}
            <label className="checkbox-row tiny">
              <input
                type="checkbox"
                checked={saveAccount}
                onChange={(e) => setSaveAccount(e.target.checked)}
              />
              <span>Save this bank account</span>
            </label>

            {/* FOOTER */}
            <div className="bottom-sheet-footer">
              <button
                type="button"
                className="btn ghost"
                onClick={() => { reset(); onClose(); }}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn primary"
                disabled={loading || amt < MIN_WITHDRAW}
              >
                {loading ? "Sending OTP..." : "Request withdrawal"}
              </button>
            </div>

            <p className="bottom-sheet-hint tiny">
              If account name wasn’t resolved, double-check before confirming.
            </p>
          </form>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
