// src/components/HomeActivityTicker.jsx
import React from "react";
import { Activity } from "lucide-react";
import TickerStrip from "./TickerStrip";
import { formatCurrency, timeAgo } from "../utils/format";

export default function HomeActivityTicker({ items }) {
  if (!items || !items.length) return null;

  return (
    <TickerStrip
      label="People are predicting"
      items={items}
      renderItem={(item) => (
        <div className="ticker-card-inner">
          <div className="ticker-icon activity">
            <Activity size={16} />
          </div>
          <div className="ticker-body">
            <div className="ticker-title">
              {item.user_masked || "User"} joined{" "}
              <span className="ticker-highlight">
                “{item.pool_title || "a pool"}”
              </span>
            </div>
            <div className="ticker-meta small muted">
              Stake {formatCurrency(item.amount)} • {timeAgo(item.created_at)}
            </div>
          </div>
        </div>
      )}
    />
  );
}
