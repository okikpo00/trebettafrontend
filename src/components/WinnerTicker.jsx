// src/components/WinnerTicker.jsx
import React from "react";
import { Trophy } from "lucide-react";
import TickerStrip from "./TickerStrip";
import { formatCurrency, timeAgo } from "../utils/format";

export default function WinnerTicker({ items }) {
  if (!items || !items.length) return null;

  return (
    <TickerStrip
      label="People already won"
      items={items}
      renderItem={(item) => (
        <div className="ticker-card-inner">
          <div className="ticker-icon winner">
            <Trophy size={16} />
          </div>
          <div className="ticker-body">
            <div className="ticker-title">
              {item.username || "User"} won{" "}
              <span className="ticker-highlight">
                {formatCurrency(item.amount)}
              </span>{" "}
              in “{item.pool_title || "a pool"}”
            </div>
            <div className="ticker-meta small muted">{timeAgo(item.created_at)}</div>
          </div>
        </div>
      )}
    />
  );
}
