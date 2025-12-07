// src/components/DepositModal.jsx
import React, { useState } from "react";
import api from "../api";
import Modal from "./Modal";
import DepositBankDetails from "./DepositBankDetails";
import DepositHostedLink from "./DepositHostedLink";
import Loader from "./Loader";

const MIN_DEPOSIT = 500;

export default function DepositModal({ onClose, onCompleted, showToast }) {
  const [step, setStep] = useState("form"); // form | result
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({ amount: "" });

  const presets = [500, 1000, 2000, 5000];

  const handlePreset = (value) => {
    setAmount(String(value));
    setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const validate = () => {
    const numeric = Number(amount);
    let error = "";

    if (!numeric || numeric <= 0) {
      error = "Enter a valid amount";
    } else if (numeric < MIN_DEPOSIT) {
      error = 'Minimum deposit is ₦500';
    }

    setErrors({ amount: error });
    return !error;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    const numeric = Number(amount);
    setLoading(true);
    try {
      const res = await api.post("/wallet/deposit/initiate", { amount: numeric });
      if (res.data?.status && res.data?.data) {
        setResult(res.data.data);
        setStep("result");
        showToast(res.data?.message || "Deposit initiated", "success");
      } else {
        showToast(res.data?.message || "Could not initiate deposit", "error");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to initiate deposit",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onCompleted?.();
    onClose?.();
  };

  const hasBankDetails =
    result?.bank && (result.bank.account_number || result.bank.bank_name);
  const hasHostedLink = result?.hosted_link;

  return (
    <Modal title={step === "form" ? "Deposit funds" : "Deposit details"} onClose={onClose}>
      {step === "form" && (
        <form className="wallet-modal-form" onSubmit={handleSubmit}>
          <p className="small muted">
            Enter how much you want to add to your Trebetta wallet.
          </p>

          <div className="field">
            <label>Amount (NGN)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors((prev) => ({ ...prev, amount: "" }));
                }
              }}
              placeholder="e.g. 2000"
            />
            {errors.amount && (
              <div className="wallet-field-error small">{errors.amount}</div>
            )}
          </div>

          <div className="wallet-amount-presets">
            {presets.map((p) => (
              <button
                type="button"
                key={p}
                className="wallet-amount-chip"
                onClick={() => handlePreset(p)}
              >
                ₦{p.toLocaleString("en-NG")}
              </button>
            ))}
          </div>

          <div className="wallet-modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Starting..." : "Continue"}
            </button>
          </div>
        </form>
      )}

      {step === "result" && !result && (
        <div className="wallet-modal-center">
          <Loader />
        </div>
      )}

      {step === "result" && result && (
        <div className="wallet-deposit-result">
          {hasBankDetails && (
            <DepositBankDetails
              data={result}
              onDone={handleDone}
            />
          )}

          {!hasBankDetails && hasHostedLink && (
            <DepositHostedLink
              data={result}
              onDone={handleDone}
            />
          )}

          {!hasBankDetails && !hasHostedLink && (
            <div className="wallet-modal-center small">
              <p className="muted">
                Deposit was initiated but no bank details or checkout link was
                returned. Please contact support or try again later.
              </p>
              <button type="button" className="btn primary" onClick={handleDone}>
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}