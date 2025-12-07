// src/components/MyPoolEmpty.jsx
import React from "react";
import { Flame } from "lucide-react";
import "../css/mypools.css";

export default function MyPoolEmpty() {
  return (
    <div className="mypool-empty">
      <Flame size={40} className="mypool-empty-icon" />
      <h2>No Pools Yet</h2>
      <p className="small muted">
        Join your first Pulse or Grand pool to start predicting.
      </p>
      <a href="/home" className="btn primary mypool-empty-btn">
        Explore Pools
      </a>
    </div>
  );
}
