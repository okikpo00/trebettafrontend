// src/components/BalanceCard.jsx
import React from "react";

export default function BalanceCard({
  balance,
  currency = "NGN",
  onDeposit,
  onWithdraw,
}) {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(balance || 0);

  return (
    <div className="card wallet-balance-card">
      <div className="wallet-balance-label small muted">Available balance</div>
      <div className="wallet-balance-value">{formatted}</div>
      <div className="wallet-balance-context small muted">
        Use this balance to join Trebetta pools.
      </div>
      <div className="wallet-balance-actions">
        <button
          type="button"
          className="btn primary"
          onClick={onDeposit}
        >
          Deposit
        </button>
        <button
          type="button"
          className="btn"
          onClick={onWithdraw}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}