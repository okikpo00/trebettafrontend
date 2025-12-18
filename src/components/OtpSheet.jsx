// src/components/OtpSheet.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";

export default function OtpSheet({
  isOpen,
  onClose,
  withdrawData,
  onConfirmed
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // 🔴 Inline error (visible inside sheet)
  const [sheetError, setSheetError] = useState("");

  /* ----------------------------------
     COUNTDOWN TIMER
  ----------------------------------- */
  useEffect(() => {
    if (!isOpen || !withdrawData?.expires_at) {
      setTimeLeft(null);
      return;
    }

    const target = new Date(withdrawData.expires_at).getTime();

    const tick = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isOpen, withdrawData]);

  /* ----------------------------------
     SUBMIT OTP
  ----------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setSheetError("");

    if (!otp || otp.length !== 6) {
      setSheetError("Enter the 6-digit OTP sent to your email");
      return;
    }

    if (!withdrawData?.reference) {
      setSheetError("Missing withdrawal reference");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/wallet/withdraw/confirm", {
        reference: withdrawData.reference,
        otp
      });

      if (res.data?.status) {
        setOtp("");
        onConfirmed();
      } else {
        setSheetError(res.data?.message || "Invalid or expired OTP");
      }
    } catch (err) {
      setSheetError(
        err?.response?.data?.message || "OTP confirmation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !withdrawData) return null;

  const minutes = timeLeft != null ? Math.floor(timeLeft / 60) : null;
  const seconds = timeLeft != null ? timeLeft % 60 : null;

  return (
    <BottomSheetPortal>
      <div className="bottom-sheet-backdrop" onClick={onClose}>
        <div
          className="bottom-sheet luxe"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bottom-sheet-handle" />

          {/* HEADER */}
          <div className="bottom-sheet-header">
            <h3 className="bottom-sheet-title">Confirm withdrawal</h3>
            <p className="bottom-sheet-subtitle small">
              Enter the 6-digit OTP sent to your email
            </p>
          </div>

          <div className="bottom-sheet-body">
            {/* SUMMARY */}
            <div className="wallet-otp-summary tiny">
              <p><strong>Reference:</strong> {withdrawData.reference}</p>
              {withdrawData.bank?.account_number && (
                <p><strong>Account:</strong> {withdrawData.bank.account_number}</p>
              )}
              <p>
                <strong>Fee:</strong> ₦
                {Number(withdrawData.fee || 0).toLocaleString("en-NG")}
              </p>
              {timeLeft != null && (
                <p>
                  <strong>Expires in:</strong>{" "}
                  {minutes}m {String(seconds).padStart(2, "0")}s
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              {/* OTP INPUT */}
              <div className="form-group">
                <label>One-Time Password</label>
                <input
                  className="input otp-input"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 6) setOtp(v);
                  }}
                  placeholder="••••••"
                />
              </div>

              {/* 🔴 INLINE ERROR */}
              {sheetError && (
                <div className="sheet-error">
                  {sheetError}
                </div>
              )}

              {/* ACTIONS */}
              <div className="bottom-sheet-footer">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn primary"
                  disabled={loading}
                >
                  {loading ? "Confirming..." : "Confirm withdrawal"}
                </button>
              </div>

              <p className="bottom-sheet-hint tiny">
                Didn’t receive OTP? Check spam or wait for expiry to retry.
              </p>
            </form>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
