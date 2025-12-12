// src/components/OtpSheet.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";

export default function OtpSheet({ isOpen, onClose, withdrawData, onConfirmed, showToast }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!isOpen || !withdrawData?.expires_at) { setTimeLeft(null); return; }
    const target = new Date(withdrawData.expires_at).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setTimeLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isOpen, withdrawData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!otp || String(otp).length < 4) { showToast("Enter the OTP", "error"); return; }
    if (!withdrawData?.reference) { showToast("Missing reference", "error"); return; }

    setLoading(true);
    try {
      const res = await api.post("/wallet/withdraw/confirm", { reference: withdrawData.reference, otp });
      if (res.data?.status) {
        onConfirmed();
        setOtp("");
      } else {
        showToast(res.data?.message || "Could not confirm", "error");
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Confirm failed", "error");
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
        <div className="bottom-sheet luxe" onClick={(e) => e.stopPropagation()}>
          <div className="bottom-sheet-handle" />
          <div className="bottom-sheet-header">
            <h3 className="bottom-sheet-title">Enter OTP</h3>
            <p className="bottom-sheet-subtitle small">A 6-digit OTP was sent to your email. Enter it to confirm.</p>
          </div>

          <div className="bottom-sheet-body">
            <div className="wallet-otp-summary tiny">
              <p><strong>Reference:</strong> {withdrawData.reference}</p>
              {withdrawData.bank?.account_number && <p><strong>Account:</strong> {withdrawData.bank.account_number}</p>}
              <p><strong>Fee:</strong> ₦{Number(withdrawData.fee || 0).toLocaleString("en-NG")}</p>
              {timeLeft != null && <p><strong>Expires in:</strong> {minutes}m {String(seconds).padStart(2, "0")}s</p>}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>OTP</label>
                <input type="number" inputMode="numeric" className="input otp-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" required />
              </div>

              <div className="bottom-sheet-footer">
                <button type="button" className="btn ghost" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" className="btn primary" disabled={loading}>{loading ? "Confirming..." : "Confirm withdrawal"}</button>
              </div>

              <p className="bottom-sheet-hint tiny">If you didn't get it, check spam or request a new withdrawal after expiry.</p>
            </form>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
