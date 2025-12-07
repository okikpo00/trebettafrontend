// src/components/TickerStrip.jsx
import React, { useMemo } from "react";
import "../css/home.css";

/**
 * Generic horizontal auto-scrolling strip (SportyBet style)
 * Used by: HomeActivityTicker, WinnerTicker
 */
export default function TickerStrip({ label, items, renderItem }) {
  const list = Array.isArray(items) ? items : [];

  if (!list.length) return null;

  // duplicate items so the animation has enough width to scroll
  const extended = useMemo(
    () => (list.length < 4 ? [...list, ...list, ...list] : [...list, ...list]),
    [list]
  );

  return (
    <section className="home-section">
      <div className="home-section-header">
        <h2 className="home-section-title">{label}</h2>
      </div>

      <div className="ticker-strip">
        <div className="ticker-track">
          {extended.map((item, idx) => (
            <div key={idx} className="ticker-card">
              {renderItem(item)}
            </div>
          ))}
        </div>
        <div className="ticker-fade ticker-fade-left" />
        <div className="ticker-fade ticker-fade-right" />
      </div>
    </section>
  );
}
