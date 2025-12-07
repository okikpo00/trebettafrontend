// src/components/PoolCountdown.jsx
import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function PoolCountdown({ closingDate, status }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!closingDate || !["open", "locked"].includes(status)) {
      setLabel("");
      return;
    }

    const target = new Date(closingDate).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setLabel("Closing soon");
        return;
      }
      const totalMinutes = Math.floor(diff / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const mins = totalMinutes % 60;

      if (days > 0) {
        setLabel(`Closes in ${days}d ${hours}h`);
      } else if (hours > 0) {
        setLabel(`Closes in ${hours}h ${mins}m`);
      } else {
        setLabel(`Closes in ${mins}m`);
      }
    };

    update();
    const interval = setInterval(update, 30000); // 30s
    return () => clearInterval(interval);
  }, [closingDate, status]);

  if (!label) return null;

  return (
    <div className="pool-countdown">
      <Clock size={14} />
      <span className="small">{label}</span>
    </div>
  );
}
