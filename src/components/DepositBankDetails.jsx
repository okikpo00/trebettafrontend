// src/components/DepositBankDetails.jsx
import React, { useMemo } from "react";

function formatExpiry(expires_at) {
  if (!expires_at) return null;
  const d = new Date(expires_at);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DepositBankDetails({ data, onDone }) {
  const bank = data?.bank || {};
  const expiry = useMemo(
    () => formatExpiry(bank.expires_at),
    [bank.expires_at]
  );

  const copyToClipboard = (value) => {
    if (!value) return;
    try {
      navigator.clipboard.writeText(String(value));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="wallet-deposit-bank">
      <h3 className="wallet-modal-heading">Transfer to fund your wallet</h3>
      <p className="small muted">
        Send the exact amount below to this account. Your wallet will be credited
        automatically once payment is confirmed.
      </p>

      <div className="wallet-deposit-grid">
        <div className="wallet-deposit-field">
          <div className="label small muted">Bank name</div>
          <div className="value">{bank.bank_name || "—"}</div>
        </div>
        <div className="wallet-deposit-field">
          <div className="label small muted">Account number</div>
          <div className="value with-copy">
            <span>{bank.account_number || "—"}</span>
            {bank.account_number && (
              <button
                type="button"
                className="link-btn small"
                onClick={() => copyToClipboard(bank.account_number)}
              >
                Copy
              </button>
            )}
          </div>
        </div>
        <div className="wallet-deposit-field">
          <div className="label small muted">Account name</div>
          <div className="value">{bank.account_name || "—"}</div>
        </div>
        <div className="wallet-deposit-field">
          <div className="label small muted">Reference</div>
          <div className="value with-copy">
            <span>{data.reference || "—"}</span>
            {data.reference && (
              <button
                type="button"
                className="link-btn small"
                onClick={() => copyToClipboard(data.reference)}
              >
                Copy
              </button>
            )}
          </div>
        </div>
      </div>

      {expiry && (
        <div className="wallet-deposit-expiry small muted">
          Expires at <span>{expiry}</span>
        </div>
      )}

      <div className="wallet-modal-actions">
        <button type="button" className="btn" onClick={onDone}>
          I&apos;m done
        </button>
      </div>
    </div>
  );
}