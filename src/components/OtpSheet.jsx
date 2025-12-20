// src/components/OtpSheet.jsx
import React, { useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";
import "../css/otpSheet.css";

export default function OtpSheet({ isOpen, onClose, withdrawData, onConfirmed }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !withdrawData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP sent to your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/wallet/withdraw/confirm", {
        reference: withdrawData.reference,
        otp
      });

      if (res.data?.status) {
        onConfirmed();
        setOtp("");
      } else {
        setError(res.data?.message || "Invalid OTP");
      }
    } catch {
      setError("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetPortal>
      <div className="sheet-backdrop" onClick={onClose}>
        <div className="sheet-card" onClick={(e) => e.stopPropagation()}>

          <div className="sheet-handle" />
          <h3 className="sheet-title">Confirm Withdrawal</h3>
          <p className="sheet-subtitle">Enter the 6-digit code sent to your email</p>

          {error && <div className="sheet-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="otp-box">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i}>{otp[i] || ""}</span>
              ))}
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v)) setOtp(v);
                }}
              />
            </div>

            <div className="sheet-footer">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
