// src/components/WinMeterDisplay.jsx
import React from "react";
import {
  LineChart,
  Line,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import "../css/winmeter.css"; // your styling file

export default function WinMeterDisplay({
  potentialWin = 0,
  stake = 0,
  loading = false,
  poolStatus = "",
}) {
  const normalizedStake = Number(stake || 0);
  const normalizedWin = Number(potentialWin || 0);

  // Confidence = (win potential / stake) * 100 IF stake>0
  let confidence = 0;
  if (normalizedStake > 0 && normalizedWin > 0) {
    confidence = Math.min(100, Math.max(1, Math.round((normalizedWin / normalizedStake) * 100)));
  }

  // Fake trend data (sparkline)
  const data = Array.from({ length: 24 }, (_, i) => ({
    v:
      normalizedWin > 0
        ? 20 + (i * 3) + (Math.sin(i / 2) * 15)
        : i * 2,
  }));

  const isClosed = ["closed", "settled", "rollover"].includes(
    (poolStatus || "").toLowerCase()
  );

  return (
    <div className="winmeter-card">
      <div className="winmeter-top-row">
        <div className="winmeter-info">
          <div className="winmeter-label">Potential Win</div>

          {loading ? (
            <div className="skeleton-bar small" style={{ width: 110 }} />
          ) : (
            <div className="winmeter-amount">
              ₦{normalizedWin.toLocaleString()}
            </div>
          )}
        </div>

        {/* CONFIDENCE (Option A) */}
        <div className="winmeter-confidence-box">
          <span className="conf-label">Confidence</span>
          {loading ? (
            <span className="conf-value small skeleton-bar" style={{ width: 40 }} />
          ) : (
            <span className="conf-value">{confidence}%</span>
          )}
        </div>
      </div>

      {/* Sparkline */}
      <div className="winmeter-chart">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={data}>
            <YAxis hide domain={["auto", "auto"]} />
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={!isClosed}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="winmeter-bottom-note small muted">
        Powered by live trend insights
      </div>
    </div>
  );
}
