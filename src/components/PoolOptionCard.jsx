// src/components/PoolOptionCard.jsx
import React from "react";
import { ChevronRight } from "lucide-react";

export default function PoolOptionCard({
  option,
  poolStatus,      // <-- we need this
  isUserPick,
  onSelect,
}) {
  const status = (option.status || "").toLowerCase();

  const isSettled = poolStatus === "settled" || poolStatus === "closed" || poolStatus === "rollover";

  // Backend rule:
  // active     → winner (ONLY if settled)
  // eliminated → eliminated
  const isWinner = isSettled && status === "active";
  const isEliminated = status === "eliminated";

  // Badge label + class
  let statusLabel = "";
  let statusClass = "";

  if (isWinner) {
    statusLabel = "Winner";
    statusClass = "status-won";
  } else if (isEliminated) {
    statusLabel = "Eliminated";
    statusClass = "status-eliminated";
  }

  const stake = Number(option.total_stake || 0);

  return (
    <button
      type="button"
      className={
        "pool-option-card" +
        (isWinner ? " winner" : "") +
        (isEliminated ? " eliminated" : "") +
        (isUserPick ? " selected" : "")
      }
      onClick={onSelect}
    >
      <div className="pool-option-header">
        <div className="pool-option-title">{option.title}</div>

        {/* Right arrow icon */}
        <div className="pool-option-chip">
          <ChevronRight size={14} />
        </div>
      </div>

      <div className="pool-option-footer">
        <span>
          Stake: ₦
          {stake.toLocaleString("en-NG", {
            maximumFractionDigits: 0,
          })}
        </span>

        <span>
          {/* Your Pick */}
          {isUserPick && !isWinner && (
            <span className="pool-option-chip your-pick">
              Your pick
            </span>
          )}

          {/* Winner or Eliminated */}
          {!isUserPick && statusLabel && (
            <span className={"pool-option-chip " + statusClass}>
              {statusLabel}
            </span>
          )}
        </span>
      </div>
    </button>
  );
}
