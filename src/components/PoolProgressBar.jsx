// src/components/PoolProgressBar.jsx
import React from "react";

export default function PoolProgressBar({ progress = 0, type = "pulse", total = 0, target = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  return (
    <div>
      <div className="pool-progress-track">
        <div
          className={`pool-progress-fill ${type === "grand" ? "grand" : "pulse"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="pool-progress-percent">
        <span>{pct}% of target filled</span>
        {total > 0 && (
          <span>
            {" "}
            • Pool: ₦{Number(total).toLocaleString("en-NG", {
              maximumFractionDigits: 0,
            })}
          </span>
        )}
        {target > 0 && (
          <span>
            {" "}
            / Target: ₦{Number(target).toLocaleString("en-NG", {
              maximumFractionDigits: 0,
            })}
          </span>
        )}
      </div>
    </div>
  );
}
