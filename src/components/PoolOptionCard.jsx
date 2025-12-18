// src/components/PoolOptionCard.jsx
import React from "react";

export default function PoolOptionCard({
  option,
  poolStatus,
  isUserPick,
  onSelect,
}) {
  const status = (option.status || "").toLowerCase();

  const isSettled =
    poolStatus === "settled" ||
    poolStatus === "closed" ||
    poolStatus === "rollover";

  // Backend rule
  const isWinner = isSettled && status === "active";
  const isEliminated = status === "eliminated";

  let statusLabel = "";
  let statusClass = "";

  if (isWinner) {
    statusLabel = "Winner";
    statusClass = "status-won";
  } else if (isEliminated) {
    statusLabel = "status-eliminated";
    statusLabel = "Eliminated";
  }

  return (
    <button
      type="button"
      className={
        "pool-option-card option-static" +
        (isWinner ? " winner" : "") +
        (isEliminated ? " eliminated" : "") +
        (isUserPick ? " selected" : "")
      }
      onClick={onSelect}
    >
      {/* TITLE */}
      <div className="pool-option-header">
        <div className="pool-option-title">
          {option.title}
        </div>
      </div>

      {/* STATUS ONLY */}
      <div className="pool-option-footer">
        {isUserPick && !isWinner && (
          <span className="pool-option-chip your-pick">
            Your pick
          </span>
        )}

        {!isUserPick && statusLabel && (
          <span className={"pool-option-chip " + statusClass}>
            {statusLabel}
          </span>
        )}
      </div>
    </button>
  );
}