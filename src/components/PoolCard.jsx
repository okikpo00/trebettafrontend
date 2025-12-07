// src/components/PoolCard.jsx
import React from "react";
import { Clock3, Users, ArrowRight } from "lucide-react";
import "../css/home.css";
import { formatCurrency, formatCountdown } from "../utils/format";

export default function PoolCard({ pool, onOpenDetails }) {
  if (!pool) return null;

  const isPulse = pool.type === "pulse";
  const typeLabel = isPulse ? "Pulse" : pool.type === "grand" ? "Grand" : "Pool";

const minEntry =
  Number(pool.min_entry) ||
  Number(pool.minimum_entry) ||
  Number(pool.min) ||
  Number(pool.entry_min) ||
  0;
  const participants = Number(pool.participants || 0);
const isLocked = pool.status === "locked";
const countdown = isLocked ? "Locked" : formatCountdown(pool.countdown);

  const progressPercent = Math.round((Number(pool.progress || 0) || 0) * 100);
  const hasJoined = !!pool.user_joined;

  return (
    <div className="pool-card card" onClick={() => onOpenDetails?.(pool)}>
      <div className="pool-card-header">
        <div className="pool-card-title-block">
          <div className={"pool-type-pill " + (isPulse ? "pulse" : "grand")}>
            {typeLabel}
          </div>
          <h3 className="pool-card-title">{pool.title}</h3>
          {isLocked && (
  <span className="pool-status-locked small">Locked</span>
)}

        </div>
      </div>

      <div className="pool-card-meta small">
        <span className="pool-card-meta-item">
          <Clock3 size={14} />
          <span>{countdown}</span>
        </span>
        <span className="pool-card-meta-item">
          <Users size={14} />
          <span>{participants.toLocaleString("en-NG")} entries</span>
        </span>
      </div>

      <div className="pool-card-progress-row">
        <div className="pool-card-progress-bar">
          <div
            className={
              "pool-card-progress-fill " + (isPulse ? "pulse" : "grand")
            }
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="pool-card-progress-label small muted">
          {progressPercent}% of target pool
        </span>
      </div>

      <div className="pool-card-footer">
        <div className="pool-card-footer-left small">
          <div>Min entry {formatCurrency(minEntry)}</div>
          {pool.total_stake != null && (
            <div className="muted">
              Total pool {formatCurrency(pool.total_stake)}
            </div>
          )}
        </div>
        <button
          type="button"
          className="btn primary pool-card-cta"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails?.(pool);
          }}
        >
          {hasJoined ? "view pool" : "View pool"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
