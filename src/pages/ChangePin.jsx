// src/pages/profile/ChangePin.jsx
import React, { useState } from "react";
import api from "../api";
import Toast from "../components/Toast";

export default function ChangePin() {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") =>
    setToast({ message, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (oldPin.length !== 4 || newPin.length !== 4) {
      showToast("PIN must be exactly 4 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("wallet/pin/change", {
        old_pin: oldPin,
        new_pin: newPin,
      });

      if (res.data?.status) {
        showToast("Transaction PIN changed successfully", "success");
        setOldPin("");
        setNewPin("");
      } else {
        showToast(res.data?.message || "PIN change failed");
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "PIN change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container narrow">
      <h1 className="page-title">Change Transaction PIN</h1>
      <p className="small muted">
        Your PIN is required to confirm withdrawals.
      </p>

      <form onSubmit={handleSubmit} className="card form-card">
        <div className="form-group">
          <label>Old PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="input pin-input"
            value={oldPin}
            onChange={(e) =>
              /^\d*$/.test(e.target.value) && setOldPin(e.target.value)
            }
            placeholder="••••"
          />
        </div>

        <div className="form-group">
          <label>New PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="input pin-input"
            value={newPin}
            onChange={(e) =>
              /^\d*$/.test(e.target.value) && setNewPin(e.target.value)
            }
            placeholder="••••"
          />
        </div>

        <button className="btn primary" disabled={loading}>
          {loading ? "Updating..." : "Change PIN"}
        </button>
      </form>

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
