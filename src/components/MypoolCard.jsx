// src/components/MyPoolCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Crown, Flame } from "lucide-react";
import "../css/mypools.css";
import { formatCurrency } from "../utils/format";

export default function MyPoolCard({ pool }) {
  const navigate = useNavigate();

  const isPulse = pool.type === "pulse";
  const isGrand = pool.type === "grand";
const isLocked = pool.pool_status === "locked";
const isSettled = ["settled", "closed", "rollover", "refunded"].includes(
  pool.pool_status
);


  const win = Number(pool.potential_win || 0);
  const stake = Number(pool.user_stake || 0);

  // Derive the user’s option label
  const userPickLabel =
    pool.user_option_label ||
    pool.user_option_name ||
    pool.user_option_title ||
    pool.user_option_value ||
    null;

  // Status badge
let statusLabel = "Joined";
let statusColor = "joined";

if (isLocked && !isSettled) {
  statusLabel = "Locked";
  statusColor = "locked";
}

if (isSettled) {
  if (pool.entry_status === "won") {
    statusLabel = `You Won ${formatCurrency(win)}`;
    statusColor = "won";
  } else if (pool.entry_status === "lost") {
    statusLabel = "Lost";
    statusColor = "lost";
  } else if (pool.entry_status === "refunded") {
    statusLabel = "Refunded";
    statusColor = "refund";
  }
}

  // Navigation
  const handleViewDetails = () => {
    navigate(`/pools/${pool.pool_id}`);
  };

  const handleViewLedger = () => {
    navigate(`/pools/${pool.pool_id}/ledger`);
  };

  return (
    <div className="mypool-card card">
      {/* TOP ROW */}
      <div className="mypool-top">
        <div className="mypool-type-pill">
          {isPulse ? <Flame size={16} /> : <Crown size={16} />}
          {isPulse ? "Pulse" : isGrand ? "Grand" : "Pool"}
        </div>

        <div className={"mypool-status " + statusColor}>{statusLabel}</div>
      </div>

      {/* TITLE */}
      <h3 className="mypool-title">{pool.title}</h3>

      {/* USER PICK */}
      {userPickLabel && (
        <div className="mypool-pick-row">
          <div className="mypool-label">
            Your pick
            {isSettled && pool.entry_status === "lost" ? " (lost)" : ""}
            {isSettled && pool.entry_status === "won" ? " (won)" : ""}
          </div>
          <div className="mypool-value">{userPickLabel}</div>
        </div>
      )}

      {/* POTENTIAL WIN (only active) */}
      {!isSettled && (
        <div className="mypool-winmeter-row">
          <div className="mypool-label">Potential Win</div>
          <div className="mypool-value">{formatCurrency(win)}</div>
        </div>
      )}

      {/* STAKE / WON */}
      <div className="mypool-stake-row">
        <div className="mypool-label">
          {isSettled && pool.entry_status === "won"
            ? "Amount Won"
            : "Your Stake"}
        </div>
        <div className="mypool-value">
          {isSettled && pool.entry_status === "won"
            ? formatCurrency(win)
            : formatCurrency(stake)}
        </div>
      </div>

      {/* ACTIONS */}
      {isSettled ? (
        <div className="mypool-actions">
          <button
            type="button"
            className="mypool-btn mypool-btn-secondary"
            onClick={handleViewDetails}
          >
            View Details <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className="mypool-btn"
            onClick={handleViewLedger}
          >
            View Ledger <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <button
          className="mypool-btn"
          type="button"
          onClick={handleViewDetails}
        >
          View Details <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
