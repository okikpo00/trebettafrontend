// src/components/TransactionList.jsx
import React from "react";
import TransactionItem from "./TransactionItem";

export default function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="wallet-empty-state card">
        <div className="wallet-empty-title">No activity yet</div>
        <div className="wallet-empty-subtitle small muted">
          Once you deposit, withdraw, or join pools, your activity will appear
          here.
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-tx-list card">
      {transactions.map((tx) => (
        <TransactionItem key={tx.id} tx={tx} />
      ))}
    </div>
  );
}