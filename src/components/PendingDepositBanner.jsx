// src/components/PendingDepositBanner.jsx
import React, { useEffect, useState } from "react";

export default function PendingDepositBanner({ deposit, onViewDetails }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deposit?.expires_at) { setTimeLeft(null); return; }
    const target = new Date(deposit.expires_at).getTime();
    const tick = () => { const now = Date.now(); const diff = Math.max(0, Math.floor((target - now) / 1000)); setTimeLeft(diff); };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deposit]);

  if (!deposit) return null;

  const min = timeLeft != null ? Math.floor(timeLeft / 60) : null;
  const sec = timeLeft != null ? timeLeft % 60 : null;

  const bank = deposit.bank || {};
  return (
    <div className="pending-deposit-banner luxe-card">
      <div>
        <div className="pending-tag">Pending deposit</div>
        <div className="pending-amount">₦{Number(deposit.amount || 0).toLocaleString("en-NG")}</div>
        <div className="tiny muted">Send to <strong>{bank.bank_name} • {bank.account_number}</strong> ({bank.account_name})</div>
        <div className="tiny muted">Ref: {deposit.reference} • Expires in {min}m {String(sec).padStart(2,"0")}s</div>
      </div>

      <div>
        <button className="btn ghost tiny-btn" onClick={onViewDetails}>View</button>
      </div>
    </div>
  );
}
