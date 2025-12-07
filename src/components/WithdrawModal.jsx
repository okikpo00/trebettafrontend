// src/components/WithdrawModal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Modal from "./Modal";
import WithdrawOTPModal from "./WithdrawOTPModal";
import BankSelector from "./BankSelector";
import Loader from "./Loader";

export default function WithdrawModal({ onClose, onCompleted, showToast }) {
  const navigate = useNavigate();

  // UI State
  const [step, setStep] = useState("form");
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const [otpRef, setOtpRef] = useState(null);
  const [errors, setErrors] = useState({});

  // === DYNAMIC DATA ===
  const [withdrawFees, setWithdrawFees] = useState([]);
  const [minWithdrawal, setMinWithdrawal] = useState(1000);
  const [calculatedFee, setCalculatedFee] = useState(0);

  // FETCH WITHDRAWAL FEES + MINIMUM
  const fetchWithdrawFees = async () => {
    try {
      const res = await api.get("/wallet/fees");

      if (res.data?.status && Array.isArray(res.data.data)) {
        const list = res.data.data;
        setWithdrawFees(list);

        // derive minimum withdrawal from backend rules
        const minRule = list.reduce((acc, cur) =>
          cur.min < acc.min ? cur : acc
        );
        setMinWithdrawal(Number(minRule.min));
      }
    } catch {
      // fail silently
    }
  };

  // FETCH SAVED BANK ACCOUNTS
  const loadSavedAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await api.get("/wallet/accounts");
      if (res.data?.status && Array.isArray(res.data.data)) {
        setSavedAccounts(res.data.data);
      } else {
        setSavedAccounts([]);
      }
    } catch {}
    finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadSavedAccounts();
    fetchWithdrawFees();
  }, []);

  // FEE CALCULATION
  const computeFee = (amt) => {
    if (!withdrawFees.length) return 0;
    amt = Number(amt);

    for (const rule of withdrawFees) {
      if (amt >= rule.min && amt <= rule.max) {
        return Number(rule.fee);
      }
    }
    return 0;
  };

  const handleUseSaved = (accId) => {
    setSelectedAccountId(accId);
    const acc = savedAccounts.find((a) => a.id === accId);

    if (acc) {
      setBankCode(acc.bank_code || "");
      setErrors((prev) => ({ ...prev, bankCode: "", accountNumber: "" }));
    }
  };

  // VALIDATION
  const validate = () => {
    const errs = {};
    const numeric = Number(amount);

    if (!numeric || numeric <= 0) {
      errs.amount = "Enter a valid amount";
    } else if (numeric < minWithdrawal) {
      errs.amount = `Minimum withdrawal is ₦${minWithdrawal.toLocaleString("en-NG")}`;
    }

    if (!bankCode) errs.bankCode = "Select a bank";

    if (!accountNumber || accountNumber.length !== 10)
      errs.accountNumber = "Account number must be 10 digits";

    if (!pin || pin.length !== 4)
      errs.pin = "PIN must be 4 digits";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    const numeric = Number(amount);
    setLoading(true);

    try {
      const res = await api.post("/wallet/withdraw/initiate", {
        amount: numeric,
        bank_code: bankCode,
        account_number: accountNumber,
        pin,
      });

      if (res.data?.status && res.data?.data?.reference) {
        setOtpRef(res.data.data.reference);
        setStep("otp");
        showToast(res.data?.message || "OTP sent to your email", "success");
      } else {
        showToast(res.data?.message || "Could not initiate withdrawal", "error");
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to initiate withdrawal", "error");
    } finally {
      setLoading(false);
    }
  };

  // OTP SCREEN
  if (step === "otp" && otpRef) {
    return (
      <WithdrawOTPModal
        reference={otpRef}
        onClose={onClose}
        onSuccess={() => {
          onCompleted?.();
          onClose?.();
        }}
        showToast={showToast}
      />
    );
  }

  // =========================
  // 🔥 FORM UI RENDER
  // =========================
  return (
    <Modal title="Withdraw funds" onClose={onClose}>
      <form className="wallet-modal-form" onSubmit={handleSubmit}>
        <p className="small muted">
          Withdraw from your Trebetta wallet to any Nigerian bank.
        </p>

        {/* SAVED ACCOUNTS */}
        <div className="field">
          <label>Saved accounts</label>
          {loadingAccounts ? (
            <div className="small muted"><Loader small /></div>
          ) : savedAccounts.length === 0 ? (
            <div className="small muted">No saved accounts yet.</div>
          ) : (
            <div className="wallet-saved-accounts">
              {savedAccounts.map((acc) => (
                <button
                  type="button"
                  key={acc.id}
                  className={
                    "wallet-saved-account" +
                    (selectedAccountId === acc.id ? " active" : "")
                  }
                  onClick={() => handleUseSaved(acc.id)}
                >
                  <div className="wallet-saved-account-bank">
                    {acc.bank_code} • {acc.account_name || "Account"}
                  </div>
                  <div className="wallet-saved-account-number small muted">
                    {acc.account_number}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* BANK */}
        <div className="field">
          <label>Bank</label>
          <BankSelector
            value={bankCode}
            onChange={(val) => {
              setBankCode(val);
              if (errors.bankCode) setErrors((prev) => ({ ...prev, bankCode: "" }));
            }}
          />
          {errors.bankCode && (
            <div className="wallet-field-error small">{errors.bankCode}</div>
          )}
        </div>

        {/* ACCOUNT NUMBER */}
        <div className="field">
          <label>Account number</label>
          <input
            className="input"
            type="tel"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value.replace(/\D/g, ""));
              if (errors.accountNumber)
                setErrors((prev) => ({ ...prev, accountNumber: "" }));
            }}
            placeholder="10-digit NUBAN"
          />
          {errors.accountNumber && (
            <div className="wallet-field-error small">{errors.accountNumber}</div>
          )}
        </div>

        {/* AMOUNT + PREMIUM PREVIEW */}
        <div className="field">
          <label>Amount (NGN)</label>
          <input
            className={`input ${errors.amount ? "input-error" : ""}`}
            type="number"
            min="0"
            step="1"
            value={amount}
            placeholder={`Minimum withdrawal: ₦${minWithdrawal.toLocaleString("en-NG")}`}
            onChange={(e) => {
              const val = e.target.value;
              setAmount(val);

              const num = Number(val);
              setCalculatedFee(num > 0 ? computeFee(num) : 0);

              if (errors.amount)
                setErrors((prev) => ({ ...prev, amount: "" }));
            }}
          />

          {errors.amount && (
            <div className="wallet-field-error small">{errors.amount}</div>
          )}

          {/* PREMIUM OPAY-LIKE BREAKDOWN */}
          {amount && Number(amount) > 0 && (
            <div
              style={{
                background: "var(--card-bg)",
                padding: "10px 14px",
                marginTop: 8,
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                fontSize: "var(--font-sm)",
              }}
            >
              <div className="flex-between" style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted small">Amount</span>
                <span>₦{Number(amount).toLocaleString("en-NG")}</span>
              </div>

              <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span className="muted small">Withdrawal fee</span>
                <span>₦{calculatedFee.toLocaleString("en-NG")}</span>
              </div>

              <div
                className="flex-between"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: "1px solid var(--border-color)",
                  fontWeight: 600,
                  fontSize: "var(--font-md)",
                }}
              >
                <span>You will receive</span>
                <span style={{ color: "var(--primary)" }}>
                  ₦
                  {Math.max(0, Number(amount) - calculatedFee).toLocaleString("en-NG")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PIN */}
        <div className="field">
          <label>Transaction PIN</label>
          <input
            className="input"
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 4) setPin(v);
              if (errors.pin) setErrors((prev) => ({ ...prev, pin: "" }));
            }}
            placeholder="4-digit PIN"
          />
          {errors.pin && (
            <div className="wallet-field-error small">{errors.pin}</div>
          )}

          <div className="small" style={{ marginTop: 6, textAlign: "right" }}>
            <button
              type="button"
              className="link"
              onClick={() => {
                onClose?.();
                navigate("/reset-pin");
              }}
              style={{ fontSize: "var(--font-xs)" }}
            >
              Forgot PIN?
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="wallet-modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>

          <button
            type="submit"
            className="btn primary"
            disabled={loading || errors.amount}
          >
            {loading ? "Processing…" : "Continue"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
