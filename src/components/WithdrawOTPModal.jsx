// src/components/WithdrawOTPModal.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Modal from "./Modal";
import OTPInput from "./OTPInput";

export default function WithdrawOTPModal({
  reference,
  onClose,
  onSuccess,
  showToast,
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60); // 10 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length !== 6) {
      showToast("Enter the 6-digit OTP sent to your email", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/wallet/withdraw/confirm", {
        reference,
        otp,
      });
      if (res.data?.status) {
        showToast(
          res.data?.message || "Withdrawal is now processing",
          "success"
        );
        onSuccess?.();
      } else {
        showToast(res.data?.message || "Could not confirm withdrawal", "error");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to confirm withdrawal",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <Modal title="Enter OTP" onClose={onClose}>
      <form className="wallet-modal-form" onSubmit={handleSubmit}>
        <p className="small muted">
          We sent a 6-digit OTP to your email. Enter it to confirm your
          withdrawal.
        </p>

        <OTPInput value={otp} onChange={setOtp} length={6} />

        <div className="wallet-otp-timer small muted">
          Expires in {minutes}:{secs.toString().padStart(2, "0")}
        </div>

        <div className="wallet-modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Confirming..." : "Confirm withdrawal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}