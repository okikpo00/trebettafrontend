// src/pages/TermsPrivacy.jsx
import React from "react";

export default function TermsPrivacy() {
  return (
    <div className="profile-page">
      <h2 className="profile-section-title">Terms & Privacy</h2>

      {/* ================= TERMS OF SERVICE ================= */}
      <h3 className="profile-subsection-title">📄 Terms of Service</h3>
      <p className="small muted">Effective Date: 14/12/25</p>

      <p className="small">
        Welcome to Trebetta. By accessing or using the Trebetta platform
        (“Platform”), you agree to be bound by these Terms of Service (“Terms”).
        If you do not agree, please do not use the Platform.
      </p>

      <h4>1. About Trebetta</h4>
      <p className="small">
        Trebetta is a digital platform that allows users to participate in
        opinion-based pools related to real-world events. Participation is
        voluntary and subject to these Terms.
      </p>
      <p className="small">
        Trebetta does not provide financial, legal, or investment advice.
      </p>

      <h4>2. Eligibility</h4>
      <ul className="small">
        <li>Be at least 18 years old</li>
        <li>Provide accurate and truthful information</li>
        <li>Maintain only one account</li>
        <li>Use the Platform for lawful purposes only</li>
      </ul>
      <p className="small">
        Trebetta reserves the right to restrict or terminate accounts that
        violate these conditions.
      </p>

      <h4>3. Account Responsibility</h4>
      <ul className="small">
        <li>Keeping your login credentials secure</li>
        <li>All activities carried out through your account</li>
        <li>Ensuring your account information is up to date</li>
      </ul>
      <p className="small">
        Trebetta is not responsible for losses resulting from unauthorized
        access caused by user negligence.
      </p>

      <h4>4. Wallet, Deposits & Withdrawals</h4>
      <ul className="small">
        <li>Users may fund their wallets using supported payment methods.</li>
        <li>Wallet balances are digital records, not bank accounts.</li>
        <li>
          Deposit and withdrawal processing times may vary due to banking,
          verification, or security checks.
        </li>
        <li>
          Trebetta reserves the right to delay, review, or decline transactions
          where necessary for security or compliance.
        </li>
      </ul>

      <h4>5. Pools & Participation</h4>
      <ul className="small">
        <li>Joining a pool is final once confirmed.</li>
        <li>
          Pool outcomes are determined using publicly available and verifiable
          information.
        </li>
        <li>Trebetta’s decision on pool outcomes is final.</li>
        <li>
          If a pool cannot be resolved, Trebetta may cancel it and refund
          affected users.
        </li>
      </ul>
      <p className="small">
        Trebetta does not guarantee winnings or outcomes.
      </p>

      <h4>6. Fair Use & Abuse Prevention</h4>
      <ul className="small">
        <li>Manipulate pools or outcomes</li>
        <li>Use automated tools or multiple accounts</li>
        <li>Exploit system weaknesses</li>
        <li>Engage in fraudulent or abusive behavior</li>
      </ul>

      <h4>7. Suspension & Termination</h4>
      <p className="small">
        Trebetta reserves the right to suspend accounts, restrict access, or
        terminate services without prior notice where required.
      </p>

      <h4>8. Limitation of Liability</h4>
      <p className="small">
        Trebetta is not liable for losses resulting from user decisions, network
        issues, third-party services, or event outcomes. Use of the Platform is
        at your own risk.
      </p>

      <h4>9. Changes to the Platform</h4>
      <p className="small">
        Continued use of the Platform constitutes acceptance of updated Terms.
      </p>

      <h4>10. Governing Law</h4>
      <p className="small">
        These Terms are governed by applicable laws within Trebetta’s operating
        jurisdiction.
      </p>

      <h4>11. Contact</h4>
      <p className="small">
        For questions or concerns, contact Trebetta support through official
        channels.
      </p>

      {/* ================= PRIVACY POLICY ================= */}
      <h3 className="profile-subsection-title" style={{ marginTop: 32 }}>
        🔐 Privacy Policy
      </h3>
      <p className="small muted">Effective Date: 14/12/25</p>

      <p className="small">
        Trebetta respects your privacy. This Privacy Policy explains how we
        collect, use, and protect your information.
      </p>

      <h4>1. Information We Collect</h4>
      <ul className="small">
        <li>Personal details (name, email, phone number)</li>
        <li>Account and transaction records</li>
        <li>Device and usage information</li>
        <li>Communication and support interactions</li>
      </ul>

      <h4>2. How We Use Information</h4>
      <ul className="small">
        <li>Provide and maintain the Platform</li>
        <li>Process transactions</li>
        <li>Improve security and prevent fraud</li>
        <li>Communicate important updates</li>
        <li>Provide customer support</li>
      </ul>

      <h4>3. Data Sharing</h4>
      <p className="small">Trebetta does not sell personal data.</p>
      <ul className="small">
        <li>Payment and verification providers</li>
        <li>Service partners required for platform operation</li>
        <li>Legal or regulatory authorities when required by law</li>
      </ul>

      <h4>4. Data Security</h4>
      <p className="small">
        We implement reasonable security measures to protect user data. However,
        no system is completely secure.
      </p>

      <h4>5. Cookies & Tracking</h4>
      <p className="small">
        Trebetta uses cookies for authentication, security, and platform
        functionality.
      </p>

      <h4>6. Data Retention</h4>
      <p className="small">
        Information is retained only as long as necessary for operational,
        legal, and security purposes.
      </p>

      <h4>7. User Rights</h4>
      <p className="small">
        Users may request access, correction, or deletion of their personal data
        subject to legal requirements.
      </p>

      <h4>8. Changes to This Policy</h4>
      <p className="small">
        Continued use of Trebetta indicates acceptance of policy updates.
      </p>

      <h4>9. Contact</h4>
      <p className="small">
        For privacy-related questions, contact Trebetta support through official
        channels.
      </p>
    </div>
  );
}
