// src/components/TransactionItem.jsx
import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Trophy,
  BarChart2,
  Wallet2,
} from "lucide-react"; // npm install lucide-react

function getLabelFromType(type) {
  switch (type) {
    case "deposit":
      return "Wallet deposit";
    case "withdrawal":
      return "Withdrawal";
    case "bet":
      return "Pool entry";
    case "payout":
      return "Pool payout";
    default:
      return type || "Transaction";
  }
}

function getBadgeClass(status) {
  if (!status) return "";
  const s = status.toLowerCase();
  if (s === "completed" || s === "success") return "badge success";
  if (s === "pending" || s === "processing") return "badge warn";
  if (s === "failed" || s === "cancelled") return "badge danger";
  return "badge";
}

function formatAmount(amount, type) {
  const n = Number(amount) || 0;
  const prefix =
    type === "withdrawal" || type === "bet"
      ? "-"
      : type === "payout" || type === "deposit"
      ? "+"
      : "";
  return `${prefix}₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionItem({ tx }) {
  const label = getLabelFromType(tx.type);
  const badgeClass = getBadgeClass(tx.status);
  const amountText = formatAmount(tx.amount, tx.type);
  const dateText = formatDate(tx.created_at);
  const provider = tx.provider ? tx.provider.toUpperCase() : "";

  const renderIcon = () => {
    if (tx.type === "deposit") return <ArrowUpRight size={18} />;
    if (tx.type === "withdrawal") return <ArrowDownLeft size={18} />;
    if (tx.type === "payout") return <Trophy size={18} />;
    if (tx.type === "bet") return <BarChart2 size={18} />;
    return <Wallet2 size={18} />;
  };

  return (
    <div className="wallet-tx-item">
      <div className="wallet-tx-icon">{renderIcon()}</div>
      <div className="wallet-tx-main">
        <div className="wallet-tx-title-row">
          <div className="wallet-tx-label">{label}</div>
          <div className="wallet-tx-amount">{amountText}</div>
        </div>
        <div className="wallet-tx-meta-row">
          <div className="wallet-tx-meta small muted">
            {provider && <span>{provider} • </span>}
            {dateText}
            {tx.reference && <span> • Ref: {tx.reference}</span>}
          </div>
          {tx.status && <div className={badgeClass}>{tx.status}</div>}
        </div>
      </div>
    </div>
  );
}