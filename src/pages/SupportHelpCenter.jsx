import React from "react";
import "../css/support.css";
export default function HelpCenter() {
  return (
    <div className="profile-page">
      <h2 className="profile-section-title">Help Center</h2>
      <p className="small muted">
        Find answers to common questions about using Trebetta.
      </p>

      {/* ================= WALLET & PAYMENTS ================= */}
      <section className="help-section">
        <h3 className="help-title">Wallet & Payments</h3>

        <HelpItem q="How do I fund my wallet?">
          Go to <strong>Wallet → Deposit</strong>, enter the amount, and transfer
          the exact amount to the bank account shown on your screen.
        </HelpItem>

        <HelpItem q="Which bank account do I transfer to?">
          You must transfer only to the bank account displayed inside Trebetta
          during your deposit process. Do not reuse old details.
        </HelpItem>

        <HelpItem q="How long does a deposit take?">
          Most deposits reflect within a few minutes. In rare cases, it may take
          longer due to bank delays.
        </HelpItem>

        <HelpItem q="Why is my deposit pending?">
          Deposits may be pending due to bank delays, incorrect amounts, or
          verification checks. Most pending deposits resolve automatically.
        </HelpItem>

        <HelpItem q="What should I do if I sent money but my wallet is not credited?">
          Refresh your wallet first. If it remains pending, contact Trebetta
          Support with the amount sent, time of transfer, and sender bank.
        </HelpItem>

        <HelpItem q="Is there a minimum deposit amount?">
          Yes. The minimum deposit amount is displayed during deposit.
        </HelpItem>

        <HelpItem q="Is there a maximum deposit amount?">
          Yes. Deposit limits apply for security reasons and may change over time.
        </HelpItem>

        <HelpItem q="Can I fund my wallet at night or on weekends?">
          Yes. Wallet funding is available 24/7, including weekends.
        </HelpItem>

        <HelpItem q="Can I use someone else’s bank account to deposit?">
          Yes. Deposits can be made from any bank account if instructions are
          followed correctly.
        </HelpItem>

        <HelpItem q="How do I withdraw my money?">
          Go to <strong>Wallet → Withdraw</strong>, enter the amount, select your
          bank, enter your PIN, and confirm with OTP.
        </HelpItem>

        <HelpItem q="How long do withdrawals take?">
          Withdrawals are usually processed within minutes but may take longer
          depending on bank processing.
        </HelpItem>

        <HelpItem q="Why is my withdrawal pending?">
          Pending withdrawals may occur due to verification checks or bank delays.
        </HelpItem>

        <HelpItem q="Why was my withdrawal rejected?">
          Withdrawals may be rejected due to incorrect bank details, insufficient
          balance, or PIN/OTP issues.
        </HelpItem>

        <HelpItem q="Is there a minimum withdrawal amount?">
          Yes. The minimum withdrawal amount is ₦1,000.
        </HelpItem>

        <HelpItem q="Is there a withdrawal fee?">
          Yes. A small fee applies and is deducted from the withdrawal amount.
        </HelpItem>

        <HelpItem q="Can I cancel a withdrawal?">
          No. Withdrawals cannot be cancelled once submitted.
        </HelpItem>

        <HelpItem q="Can I change my bank details?">
          Yes. You can add or update your saved bank accounts anytime.
        </HelpItem>

        <HelpItem q="Is my money safe on Trebetta?">
          Yes. Trebetta uses secure systems and verification processes to protect
          user funds.
        </HelpItem>
      </section>

      {/* ================= POOLS & PREDICTIONS ================= */}
      <section className="help-section">
        <h3 className="help-title">Pools & Predictions</h3>

        <HelpItem q="What is Trebetta?">
          Trebetta is a social prediction platform where users join pools and
          predict outcomes on trending events.
        </HelpItem>

        <HelpItem q="How does Trebetta work?">
          Users join pools by choosing an option and staking a fixed amount.
          Winners share the payout pool when the event ends.
        </HelpItem>

        <HelpItem q="What is a pool?">
          A pool is a prediction room where users place opinions on an outcome.
        </HelpItem>

        <HelpItem q="What is a Pulse pool?">
          Pulse pools are short-term pools with fast outcomes.
        </HelpItem>

        <HelpItem q="What is a Grand pool?">
          Grand pools stay open longer and usually have larger payouts.
        </HelpItem>

        <HelpItem q="What is the difference between Pulse and Grand pools?">
          Pulse pools are fast and short-term. Grand pools are longer and larger.
        </HelpItem>

        <HelpItem q="How do I join a pool?">
          Open a pool, choose an option, confirm the fixed entry amount, and join.
        </HelpItem>

        <HelpItem q="How much does it cost to join a pool?">
          Pulse pools cost ₦500. Grand pools cost ₦1,000.
        </HelpItem>

        <HelpItem q="Can I join more than one option in a pool?">
          No. You can only choose one option per pool.
        </HelpItem>

        <HelpItem q="Can I change my option after joining a pool?">
          No. Once joined, your choice is locked.
        </HelpItem>

        <HelpItem q="When does a pool close?">
          Pools close at the time displayed on the pool page.
        </HelpItem>

        <HelpItem q="Why is a pool locked?">
          Pools lock when predictions are no longer allowed.
        </HelpItem>

        <HelpItem q="What happens if a pool is cancelled?">
          All participants are refunded automatically.
        </HelpItem>

        <HelpItem q="How do I know if I have won?">
          You will receive a notification and see the result in your pool history.
        </HelpItem>

        <HelpItem q="When are winners paid?">
          Winners are credited immediately after the pool is settled.
        </HelpItem>
      </section>

      {/* ================= ACCOUNT & SECURITY ================= */}
      <section className="help-section">
        <h3 className="help-title">Account & Security</h3>

        <HelpItem q="How do I create an account?">
          Register using your phone number or email on Trebetta.
        </HelpItem>

        <HelpItem q="Can I have more than one account?">
          No. Multiple accounts are not allowed.
        </HelpItem>

        <HelpItem q="Why do I need a PIN?">
          Your PIN protects withdrawals and sensitive wallet actions.
        </HelpItem>

        <HelpItem q="What is OTP?">
          OTP is a one-time password used to confirm sensitive actions.
        </HelpItem>

        <HelpItem q="How do I log out of my account?">
          Go to <strong>Profile → Logout</strong>.
        </HelpItem>
      </section>

      {/* ================= TROUBLESHOOTING ================= */}
      <section className="help-section">
        <h3 className="help-title">Troubleshooting</h3>

        <HelpItem q="The app is not loading, what should I do?">
          Check your internet connection and refresh the app.
        </HelpItem>

        <HelpItem q="A transaction failed, what should I do?">
          Wait a moment and try again. If it continues, contact support.
        </HelpItem>
      </section>

      <p className="small muted" style={{ marginTop: 24 }}>
        Still need help? Visit the <strong>Contact Support</strong> page.
      </p>
    </div>
  );
}

/* Reusable FAQ item */
function HelpItem({ q, children }) {
  return (
    <div className="help-item">
      <div className="help-q">{q}</div>
      <div className="help-a small muted">{children}</div>
    </div>
  );
}
