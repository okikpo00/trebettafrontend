// src/components/PoolTypeTabs.jsx
import React from "react";
import { Flame, Crown } from "lucide-react";
import "../css/home.css";

export default function PoolTypeTabs({
  activeType,
  onChange,
  pulseMin = 500,
  grandMin = 1000,
}) {
  return (
    <div className="home-section">
      <div className="pool-tabs">
        <button
          type="button"
          className={
            "pool-tab" + (activeType === "pulse" ? " pool-tab-active pulse" : "")
          }
          onClick={() => onChange("pulse")}
        >
          <div className="pool-tab-label">
            <Flame size={16} />
            <span>Pulse Pools</span>
          </div>
          <div className="pool-tab-sub small muted">
            Entry ₦{pulseMin.toLocaleString("en-NG")}
          </div>
        </button>

        <button
          type="button"
          className={
            "pool-tab" + (activeType === "grand" ? " pool-tab-active grand" : "")
          }
          onClick={() => onChange("grand")}
        >
          <div className="pool-tab-label">
            <Crown size={16} />
            <span>Grand Pools</span>
          </div>
          <div className="pool-tab-sub small muted">
            Entry ₦{grandMin.toLocaleString("en-NG")}
          </div>
        </button>
      </div>
    </div>
  );
}
