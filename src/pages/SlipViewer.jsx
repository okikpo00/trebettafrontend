// src/pages/SlipViewer.jsx
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";

import "../css/slip.css";
import Toast from "../components/Toast";
import { formatCurrency } from "../utils/format";

import {
  ArrowLeft,
  Share2,
  Trophy,
  XCircle,
  RefreshCw,
} from "lucide-react";

export default function SlipViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const joinState = location.state; // For frontend-only join slip

  const cardRef = useRef(null);

  const [toast, setToast] = useState(null);
  const [sharing, setSharing] = useState(false);

  const showToast = (msg, type = "info") =>
    setToast({ message: msg, type });

  // Pool object sent when sharing from PoolDetails
  const pool = location.state?.pool || null;

  // ---- FAIL SAFE ----
  if (!pool && !(joinState?.mode === "join")) {
    return (
      <div className="slip-page slip-page-center">
        <button
          type="button"
          className="btn ghost slip-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          <span className="small">Back</span>
        </button>
        <p className="small muted" style={{ marginTop: 12 }}>
          Slip preview not available.
        </p>
      </div>
    );
  }

  // ============================================================
  // 🔥 1. FRONTEND-ONLY JOIN SLIP
  // ============================================================
  let isFrontendJoin = false;
  let joinData = null;

  if (joinState?.mode === "join") {
    isFrontendJoin = true;
    joinData = joinState;
  }

  const handleShareImage = async () => {
    if (!cardRef.current) return;

    setSharing(true);
    try {
      const node = cardRef.current;
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 2,
      });

      const resp = await fetch(dataUrl);
      const blob = await resp.blob();
      const file = new File([blob], "trebetta-slip.png", { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Trebetta Slip",
          text: "Check out my Trebetta prediction slip.",
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "trebetta-slip.png";
        link.click();
      }
    } catch (err) {
      showToast("Could not generate slip image", "error");
    } finally {
      setSharing(false);
    }
  };

  if (isFrontendJoin) {
    const poolTitle = joinData.pool.title;
    const stake = joinData.stake;
    const optionObj = joinData.pool.options.find(
      (o) => o.id === joinData.optionId
    );

    return (
      <div className="slip-page">
        <button
          type="button"
          className="btn ghost slip-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          <span className="small">Back</span>
        </button>

        <div className="slip-share-wrapper">
          <div className="slip-share-card" ref={cardRef}>
            <div className="slip-brand-row">
              <div className="slip-brand-mark">TB</div>
              <div className="slip-brand-text">
                <div className="slip-brand-name">Trebetta</div>
                <div className="slip-brand-tagline small">
                  Trend it. Predict it. Win it.
                </div>
              </div>
            </div>

            <div className="slip-badge slip-badge-entry">Entry Slip</div>

            <div className="slip-amount-block">
              <div className="slip-amount-label">Stake</div>
              <div className="slip-amount-main">{formatCurrency(stake)}</div>

              <div className="slip-info-block">
                <div className="slip-info-item">
                  <div className="slip-info-label">Pool</div>
                  <div className="slip-info-value">{poolTitle}</div>
                </div>

                <div className="slip-info-item">
                  <div className="slip-info-label">Your Pick</div>
                  <div className="slip-info-value slip-info-value-option">
                    {optionObj?.title}
                  </div>
                </div>
              </div>
            </div>

            <div className="slip-footer-row">
              <div className="slip-footer-col">
                <div className="slip-footer-label">Date</div>
                <div className="slip-footer-value small">
                  {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            <div className="slip-stamp">
              <span className="slip-stamp-dot" />
              <span className="small">Trebetta verified</span>
            </div>
          </div>
        </div>

        <div className="slip-actions">
          <button
            type="button"
            className="btn primary slip-share-btn"
            onClick={handleShareImage}
            disabled={sharing}
          >
            <Share2 size={18} />
            <span className="small">
              {sharing ? "Preparing image..." : "Share as image"}
            </span>
          </button>
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

  // ============================================================
  // 🔥 2. WIN / LOSS / REFUND / ENTRY-SLIP (after settlement)
  // ============================================================

  const poolStatus = (pool.status || "").toLowerCase();
  const isSettled = ["settled", "closed", "rollover", "refunded"].includes(
    poolStatus
  );
  const isRefund = poolStatus === "refunded";

  const userPick = pool.options?.find((opt) => opt.id === pool.user_option);

  const stake = Number(pool.user_stake || 0);
  const poolTitle = pool.title || "Trebetta Pool";
  const optionTitle = userPick?.title || "N/A";

  const createdDate =
    pool.entry_created_at || pool.closing_date || new Date();
  const createdLabel = new Date(createdDate).toLocaleString();

  let isWin = false;
  let isLoss = false;
  let isEntry = false;

  if (isRefund) {
  } else if (!isSettled) {
    isEntry = true;
  } else if (userPick) {
    if ((userPick.status || "").toLowerCase() === "active") isWin = true;
    else isLoss = true;
  } else {
    isEntry = true;
  }

  let winAmount = 0;
  if (isWin) {
    const total = Number(userPick.total_stake || 0);
    const payout = Number(pool.payout_pool || 0);
    winAmount = total > 0 ? Math.floor((stake / total) * payout) : stake;
  }

  let badgeLabel = "Pool Slip";
  if (isWin) badgeLabel = "Winning Slip";
  else if (isLoss) badgeLabel = "Losing Slip";
  else if (isRefund) badgeLabel = "Refund Slip";
  else badgeLabel = "Entry Slip";

  const displaySlipId = `TB-${pool.id}-${pool.user_option || "X"}`;

  // ======== SETTLED SLIP RENDER ========

  return (
    <div className="slip-page">
      <button
        type="button"
        className="btn ghost slip-back-btn"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        <span className="small">Back</span>
      </button>

      <div className="slip-share-wrapper">
        <div ref={cardRef} className="slip-card-premium">
          <div className="slip-header-brand">
            <div className="slip-logo">TB</div>
            <div className="slip-brand-text">
              <div className="slip-brand-name">Trebetta</div>
              <div className="slip-brand-tag small">
                Trend it. Predict it. Win it.
              </div>
            </div>
          </div>

          <div
            className={
              "slip-badge " +
              (isWin
                ? "slip-badge-win"
                : isLoss
                ? "slip-badge-loss"
                : isRefund
                ? "slip-badge-refund"
                : "slip-badge-entry")
            }
          >
            {badgeLabel}
          </div>

          <div className="slip-amount-block">
            {isWin && (
              <>
                <div className="slip-amount-label">You Won</div>
                <div className="slip-amount-main slip-gold">
                  <Trophy size={26} />
                  <span>{formatCurrency(winAmount)}</span>
                </div>
              </>
            )}

            {isLoss && (
              <>
                <div className="slip-amount-label">Result</div>
                <div className="slip-amount-main slip-loss">
                  <XCircle size={24} />
                  <span>You didn't win</span>
                </div>
              </>
            )}

            {isRefund && (
              <>
                <div className="slip-amount-label">Refunded</div>
                <div className="slip-amount-main slip-refund">
                  <RefreshCw size={24} />
                  <span>{formatCurrency(stake)}</span>
                </div>
              </>
            )}

            {isEntry && (
              <>
                <div className="slip-amount-label">Stake</div>
                <div className="slip-amount-main">
                  {formatCurrency(stake)}
                </div>
              </>
            )}
          </div>

          <div className="slip-info-block">
            <div className="slip-info-item">
              <div className="slip-info-label">Pool</div>
              <div className="slip-info-value">{poolTitle}</div>
            </div>

            <div className="slip-info-item">
              <div className="slip-info-label">Your Pick</div>
              <div className="slip-info-value slip-option">
                {optionTitle}
              </div>
            </div>

            <div className="slip-info-item">
              <div className="slip-info-label">Stake</div>
              <div className="slip-info-value">
                {formatCurrency(stake)}
              </div>
            </div>
          </div>

          <div className="slip-footer-row">
            <div className="slip-footer-col">
              <div className="slip-footer-label">Slip Ref</div>
              <div className="slip-footer-value small">
                {displaySlipId}
              </div>
            </div>

            <div className="slip-footer-col">
              <div className="slip-footer-label">Date</div>
              <div className="slip-footer-value small">
                {createdLabel}
              </div>
            </div>
          </div>

          <div className="slip-stamp">
            <span className="slip-stamp-dot" />
            <span className="small">Trebetta verified</span>
          </div>
        </div>
      </div>

      <div className="slip-actions">
        <button
          type="button"
          className="btn primary slip-share-btn"
          onClick={handleShareImage}
          disabled={sharing}
        >
          <Share2 size={18} />
          <span className="small">
            {sharing ? "Preparing image..." : "Share as image"}
          </span>
        </button>
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
