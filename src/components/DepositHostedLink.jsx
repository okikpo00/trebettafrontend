// src/components/DepositHostedLink.jsx
import React from "react";

export default function DepositHostedLink({ data, onDone }) {
  const handleOpen = () => {
    if (data?.hosted_link) {
      window.open(data.hosted_link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="wallet-deposit-hosted">
      <h3 className="wallet-modal-heading">Complete on Flutterwave</h3>
      <p className="small muted">
        Continue on our secure Flutterwave checkout page to complete your
        deposit.
      </p>

      <div className="wallet-modal-actions">
        <button type="button" className="btn" onClick={onDone}>
          Cancel
        </button>
        <button type="button" className="btn primary" onClick={handleOpen}>
          Open Flutterwave Checkout
        </button>
      </div>
    </div>
  );
}