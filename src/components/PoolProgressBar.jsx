// src/components/PoolProgressBar.jsx
import React from "react";

export default function PoolProgressBar({
  progress = 0,
  type = "pulse"
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  return (
    <div className="pool-progress">
      <div className="pool-progress-track">
        <div
          className={`pool-progress-fill ${
            type === "grand" ? "grand" : "pulse"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="pool-progress-percent">
        {pct}% of target filled
      </div>
    </div>
  );
}