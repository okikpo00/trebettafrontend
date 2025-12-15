// src/pages/ContactSupport.jsx
import React from "react";

export default function ContactSupport() {
  const phone = "2348139907368";

  const message = `
Hello Trebetta Support 👋

Username:
Issue type (Deposit / Withdrawal / Pool / Account):
Amount (if applicable):
Date & time of issue:

Please assist me. Thank you.
  `.trim();

  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="profile-page">
      <h2 className="profile-section-title">Contact Support</h2>

      <p className="small muted" style={{ marginBottom: 16 }}>
        Need help with your Trebetta account?  
        Our support team is available on WhatsApp.
      </p>

      <div className="card">
        <h3 className="small" style={{ fontWeight: 700, marginBottom: 6 }}>
          💬 WhatsApp Support
        </h3>

        <p className="small muted" style={{ marginBottom: 12 }}>
          Chat with Trebetta Support for help with deposits, withdrawals,
          pools, or account issues.
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn primary"
          style={{ textDecoration: "none" }}
        >
          Contact via WhatsApp
        </a>
      </div>

      <div className="small muted" style={{ marginTop: 16 }}>
        <strong>Before messaging us, please include:</strong>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          <li>Your Trebetta username</li>
          <li>The issue you’re experiencing</li>
          <li>Amount and date (if wallet-related)</li>
          <li>Screenshot (if available)</li>
        </ul>
      </div>

      <div
        className="small muted"
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          background: "rgba(0,0,0,0.04)",
        }}
      >
        🔒 <strong>Security notice:</strong>  
        Trebetta support will <strong>never</strong> ask for your password,
        PIN, or OTP.
      </div>
    </div>
  );
}
