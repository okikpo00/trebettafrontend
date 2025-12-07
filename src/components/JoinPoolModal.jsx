// src/components/JoinPoolModal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Modal from "./Modal";
import Loader from "./Loader";
import { formatCurrency } from "../utils/format";

export default function JoinPoolModal({ pool, onClose, onJoined, showToast }) {
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [optionId, setOptionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const presets = [500, 1000, 2000, 5000];

  /** LOAD POOL DETAILS **/
  useEffect(() => {
    let isMounted = true;
    if (!pool) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/pools/${pool.id}`);
        if (res.data?.status && res.data?.data) {
          if (!isMounted) return;

          setDetails(res.data.data);
          const minEntry = Number(res.data.data.min_entry || pool.min_entry || 0);
          setAmount(String(minEntry || ""));
        } else {
          showToast?.(res.data?.message || "Could not load pool details", "error");
        }
      } catch (err) {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.message || "Failed to load pool details";
        showToast?.(msg, "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [pool, showToast]);

  if (!pool) return null;

  /** VALIDATION **/
  const validate = () => {
    const errs = {};
    const numeric = Number(amount);
    const minEntry = Number(details?.min_entry || pool.min_entry || 0);

    if (!optionId) errs.optionId = "Choose an option";
    if (!numeric || numeric <= 0) errs.amount = "Enter a valid amount";
    else if (numeric < minEntry) errs.amount = `Minimum entry is ${formatCurrency(minEntry)}`;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /** SUBMIT JOIN **/
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    const numeric = Number(amount);
    setSubmitting(true);

    try {
      const res = await api.post(`/pools/${pool.id}/join`, {
        option_id: optionId,
        amount: numeric,
      });

      if (res.data?.status) {
        const updatedPool = res.data?.data?.pool;

        showToast?.("You joined this pool successfully", "success");

        // update UI
        onJoined?.(updatedPool);
        onClose?.();

        // OPEN FRONTEND ENTRY SLIP
        navigate("/slip/view", {
          state: {
            mode: "join",
            pool: {
              id: updatedPool.id,
              title: updatedPool.title,
              user_option: updatedPool.user_option,
              options: updatedPool.options,
            },
            stake: numeric,
            optionId: optionId,
          },
        });

      } else {
        showToast?.(res.data?.message || "Could not join pool", "error");
      }

    } catch (err) {

      /** 🔥 FIX: Handle NOT LOGGED IN first */
      if (err?.response?.status === 401) {
        showToast?.("Please login to join pools", "error");
        navigate("/login");
        return; // 🔒 stop execution completely
      }

      const msg = err?.response?.data?.message || "Failed to join pool";

      if (msg === "already_joined") {
        showToast?.("You already joined this pool", "info");
      } else if (msg === "Insufficient balance") {
        showToast?.("Insufficient wallet balance. Fund your wallet.", "error");
      } else {
        showToast?.(msg, "error");
      }

    } finally {
      setSubmitting(false);
    }
  };

  const minEntry = Number(details?.min_entry || pool.min_entry || 0);
  const options = details?.options || [];

  const handleKeyAdjust = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setAmount((prev) => String(Number(prev || 0) + 100));
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAmount((prev) => {
        const n = Math.max(minEntry, Number(prev || 0) - 100);
        return String(n);
      });
    }
  };

  return (
    <Modal title="Join pool" onClose={onClose}>
      {loading ? (
        <div className="wallet-modal-center"><Loader /></div>
      ) : (
        <form className="wallet-modal-form" onSubmit={handleSubmit}>
          
          <p className="small muted">
            Lock your prediction on{" "}
            <span className="ticker-highlight">“{details?.title}”</span>.
          </p>

          {/* Option Picker */}
          <div className="field">
            <label>Choose option</label>

            {options.length === 0 ? (
              <div className="small muted">No options available for this pool yet.</div>
            ) : (
              <div className="join-options-list">
                {options.map((opt) => (
                  <label
                    key={opt.id}
                    className={
                      "join-option-pill" +
                      (optionId === opt.id ? " join-option-pill-active" : "")
                    }
                  >
                    <input
                      type="radio"
                      name="option"
                      value={opt.id}
                      checked={optionId === opt.id}
                      onChange={() => setOptionId(opt.id)}
                    />
                    <span>{opt.title}</span>
                  </label>
                ))}
              </div>
            )}

            {errors.optionId && (
              <div className="wallet-field-error small">{errors.optionId}</div>
            )}
          </div>

          {/* Amount */}
          <div className="field">
            <label>Amount (NGN)</label>

            <input
              className="input"
              type="number"
              step="100"
              min={minEntry}
              value={amount}
              onKeyDown={handleKeyAdjust}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors((prev) => ({ ...prev, amount: "" }));
                }
              }}
              placeholder={String(minEntry)}
            />

            <div className="field-msg small muted">
              Minimum entry {formatCurrency(minEntry)}.
            </div>

            {errors.amount && (
              <div className="wallet-field-error small">{errors.amount}</div>
            )}
          </div>

          {/* Presets */}
          <div className="wallet-amount-presets">
            {presets.map((p) => (
              <button
                type="button"
                key={p}
                className="wallet-amount-chip"
                onClick={() => {
                  setAmount(String(p));
                  if (errors.amount) {
                    setErrors((prev) => ({ ...prev, amount: "" }));
                  }
                }}
              >
                {formatCurrency(p)}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="wallet-modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "Joining..." : "Join pool"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
