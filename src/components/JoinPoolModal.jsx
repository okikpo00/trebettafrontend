// src/components/JoinPoolModal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Modal from "./Modal";
import Loader from "./Loader";
import { formatCurrency } from "../utils/format";
import "../css/joinPoolModal.css"; // NEW TREBETTA-STYLED CSS

export default function JoinPoolModal({ pool, onClose, onJoined, showToast }) {
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optionId, setOptionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const FIX_PULSE = 500;
  const FIX_GRAND = 1000;

  useEffect(() => {
    let mounted = true;
    if (!pool) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/pools/${pool.id}`);
        if (mounted && res.data?.status) {
          setDetails(res.data.data);
          if (res.data.data.user_option) {
            setOptionId(res.data.data.user_option);
          }
        }
      } catch (_) {}
      finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [pool]);

  if (!pool) return null;

  const fixedEntry = pool.type === "grand" ? FIX_GRAND : FIX_PULSE;

  const validate = () => {
    const e = {};
    if (!optionId) e.optionId = "Choose an option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await api.post(`/pools/${pool.id}/join`, {
        option_id: optionId,
        amount: fixedEntry,
      });

      if (res.data?.status) {
        const updatedPool = res.data.data.pool;
        showToast?.("You joined this pool successfully", "success");

        onJoined?.(updatedPool);
        onClose?.();

        navigate("/slip/view", {
          state: {
            mode: "join",
            pool: {
              id: updatedPool.id,
              title: updatedPool.title,
              user_option: updatedPool.user_option,
              options: updatedPool.options,
            },
            stake: fixedEntry,
            optionId,
          },
        });
      } else {
        showToast?.(res.data?.message || "Could not join pool", "error");
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        showToast?.("Please login to join pools", "error");
        navigate("/login");
      } else {
        showToast?.(
          err?.response?.data?.message || "Failed to join pool",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const options = details?.options || [];

  return (
  <Modal title="Join pool" onClose={onClose}>
    <div className="jp-wrap">

      {loading ? (
        <div className="jp-center"><Loader /></div>
      ) : (
        <form className="jp-form" onSubmit={handleSubmit}>

          {/* Text */}
          <p className="jp-desc">
            Lock your prediction on <strong>“{details?.title}”</strong>.
          </p>

          {/* Options */}
          <div className="jp-section">
            <label className="jp-label">Choose option</label>

            <div className="jp-options">
              {options.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  className={
                    "jp-pill" + (optionId === opt.id ? " active" : "")
                  }
                  onClick={() => setOptionId(opt.id)}
                >
                  {opt.title}
                </button>
              ))}
            </div>

            {errors.optionId && (
              <div className="jp-error">{errors.optionId}</div>
            )}
          </div>

          {/* FIXED ENTRY */}
          <div className="jp-section">
            <label className="jp-label">Entry amount (NGN)</label>

            <div className="jp-entry-box">
              <span className="jp-entry-amount">
                {formatCurrency(fixedEntry)}
              </span>
            </div>

            <p className="jp-min muted">This entry amount is fixed.</p>
          </div>

          {/* Buttons */}
          <div className="jp-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Join pool
            </button>
          </div>

        </form>
      )}
    </div>
  </Modal>
);


}
