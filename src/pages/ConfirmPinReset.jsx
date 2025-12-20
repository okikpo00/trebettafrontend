import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ConfirmPinReset({ showToast }) {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP sent to your email");
      return;
    }

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("wallet/pin/reset/confirm", {
        otp: String(otp),
        new_pin: String(pin)
      });

      if (res.data?.status) {
        // ✅ SUCCESS TOAST (SAFE)
        if (typeof showToast === "function") {
          showToast("Transaction PIN reset successful", "success");
        }

        navigate("/profile/security");
      } else {
        setError(res.data?.message || "Reset failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="pin-reset-card">
      <h2 className="pin-reset-title">Confirm PIN Reset</h2>
      <p className="pin-reset-subtitle">
        Enter the OTP sent to your email and set a new transaction PIN.
      </p>

      {error && <div className="sheet-error">{error}</div>}

      <div className="pin-reset-group">
        <label>OTP Code</label>
        <input
          className="pin-reset-input"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          value={otp}
          onChange={(e) =>
            /^\d*$/.test(e.target.value) && setOtp(e.target.value)
          }
        />
      </div>

      <div className="pin-reset-group">
        <label>New Transaction PIN</label>
        <input
          className="pin-reset-input"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={(e) =>
            /^\d*$/.test(e.target.value) && setPin(e.target.value)
          }
        />
      </div>

      <button className="btn primary" disabled={loading}>
        {loading ? "Resetting..." : "Reset PIN"}
      </button>
    </form>
  );
}
