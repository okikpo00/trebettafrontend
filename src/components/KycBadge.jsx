import React from "react";

export default function KycBadge({ status }) {
  if (!status) {
    return <span className="kyc-badge kyc-none">Not Submitted</span>;
  }

  const s = status.toLowerCase();

  if (s === "approved")
    return <span className="kyc-badge kyc-approved">Approved</span>;

  if (s === "pending")
    return <span className="kyc-badge kyc-pending">Pending</span>;

  if (s === "rejected")
    return <span className="kyc-badge kyc-rejected">Rejected</span>;

  return <span className="kyc-badge kyc-none">{status}</span>;
}
