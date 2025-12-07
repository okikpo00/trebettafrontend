import React, { useState } from "react";
import api from "../api";
import Toast from "../components/Toast";
import OTPInput from "../components/OTPInput";
import "../css/auth.css"; // reuse your auth styles

export default function ResetPin() {
  const [step, setStep] = useState(1); // 1 = verify password, 2 = otp + new pin
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (msg, type = "error") =>
    setToast({ message: msg, type });

  // -----------------------------
  // STEP 1: REQUEST PIN RESET
  // -----------------------------
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await api.post("/wallet/pin/reset/request", { password });

      if (res.data?.status) {
        showToast("OTP sent to your email", "success");
        setStep(2);
      } else {
        showToast(res.data?.message || "Could not request PIN reset");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Could not request PIN reset"
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // STEP 2: CONFIRM OTP + RESET PIN
  // -----------------------------
  const handleResetSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!otp || otp.length < 4) errs.otp = "Enter the OTP";
    if (!newPin || newPin.length !== 4) errs.newPin = "PIN must be 4 digits";
    if (!confirmPin || confirmPin.length !== 4)
      errs.confirmPin = "Confirm PIN must be 4 digits";
    if (newPin && confirmPin && newPin !== confirmPin)
      errs.confirmPin = "PINs do not match";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await api.post("/wallet/pin/reset", {
        otp,
        new_pin: newPin,
      });

      if (res.data?.status) {
        showToast("PIN reset successful", "success");
        setTimeout(() => {
          window.location.href = "/wallet"; // redirect back to wallet
        }, 800);
      } else {
        showToast(res.data?.message || "Could not reset PIN");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Could not reset PIN"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-auth">
      <div className="auth-card" style={{ marginTop: "60px" }}>
        <div className="auth-hero">
          <div className="brand-title">Reset Transaction PIN</div>
          <div className="subtitle">
            {step === 1
              ? "Verify your password to begin resetting your PIN"
              : "Enter OTP and set a new transaction PIN"}
          </div>
        </div>

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <form className="form" onSubmit={handlePasswordSubmit}>
            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({});
                }}
              />
              {errors.password && (
                <div className="field-msg error">{errors.password}</div>
              )}
            </div>

            <div className="small" style={{ marginTop: 4 }}>
              <a href="/forgot-password" className="link">
                Forgot password?
              </a>
            </div>

            <div className="form-foot" style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="btn primary"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </div>
          </form>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <form className="form" onSubmit={handleResetSubmit}>
            <div className="field">
              <label>Enter OTP</label>
              <OTPInput value={otp} onChange={setOtp} length={6} />
              {errors.otp && (
                <div className="field-msg error">{errors.otp}</div>
              )}
            </div>

            <div className="field">
              <label>New PIN</label>
              <input
                className="input"
                type="password"
                maxLength={4}
                inputMode="numeric"
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, ""))
                }
              />
              {errors.newPin && (
                <div className="field-msg error">{errors.newPin}</div>
              )}
            </div>

            <div className="field">
              <label>Confirm PIN</label>
              <input
                className="input"
                type="password"
                maxLength={4}
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, ""))
                }
              />
              {errors.confirmPin && (
                <div className="field-msg error">{errors.confirmPin}</div>
              )}
            </div>

            <div className="form-foot" style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="btn primary"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset PIN"}
              </button>
            </div>
          </form>
        )}
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