// src/components/CreatePinModal.jsx
import React, { useState } from "react";
import api from "../api";
import Modal from "./Modal";

export default function CreatePinModal({ onClose, onCreated, showToast }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ pin: "", confirmPin: "" });

  const validate = () => {
    const errs = {};
    if (!pin || pin.length !== 4) {
      errs.pin = "PIN must be 4 digits";
    }
    if (!confirmPin || confirmPin.length !== 4) {
      errs.confirmPin = "Confirm PIN must be 4 digits";
    } else if (pin && confirmPin && pin !== confirmPin) {
      errs.confirmPin = "PINs do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post("/wallet/pin/create", { pin });
      if (res.data?.status) {
        showToast(res.data?.message || "PIN created", "success");
        onCreated?.();
        onClose?.();
      } else {
        showToast(res.data?.message || "Could not create PIN", "error");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to create PIN",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create transaction PIN" onClose={onClose}>
      <form className="wallet-modal-form" onSubmit={handleSubmit}>
        <p className="small muted">
          Set a 4-digit transaction PIN. You&apos;ll use this to approve
          withdrawals.
        </p>

        <div className="field">
          <label>New PIN</label>
          <input
            className="input"
            type="password"
            maxLength={4}
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 4) {
                setPin(v);
              }
              if (errors.pin) {
                setErrors((prev) => ({ ...prev, pin: "" }));
              }
            }}
          />
          {errors.pin && (
            <div className="wallet-field-error small">{errors.pin}</div>
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
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 4) {
                setConfirmPin(v);
              }
              if (errors.confirmPin) {
                setErrors((prev) => ({ ...prev, confirmPin: "" }));
              }
            }}
          />
          {errors.confirmPin && (
            <div className="wallet-field-error small">
              {errors.confirmPin}
            </div>
          )}
        </div>

        <div className="wallet-modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Saving..." : "Create PIN"}
          </button>
        </div>
      </form>
    </Modal>
  );
}