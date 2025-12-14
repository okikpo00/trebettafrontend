// src/components/DepositSheet.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";

const SUPPORT_PHONE = "+234 810 000 0000"; // replace with real support phone

export default function DepositSheet({ isOpen, onClose, onCreated, showToast }) {
  const [amount, setAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // reset whenever sheet closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setSenderName("");
      setSenderBank("");
      setResult(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const clean = Number(amount);
    if (!clean || clean <= 0) {
      showToast("Enter a valid deposit amount", "error");
      return;
    }
    if (!senderName || senderName.trim().length < 2) {
      showToast("Enter sender account name", "error");
      return;
    }
    if (!senderBank || senderBank.trim().length < 2) {
      showToast("Enter sender bank", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/wallet/deposit/initiate", {
        amount: clean,
        sender_name: senderName.trim(),
        sender_bank: senderBank.trim(),
      });

      if (res.data?.status && res.data.data) {
        const data = res.data.data;
        setResult(data);
        showToast(res.data.message || "Deposit created", "success");
        // call onCreated so current app flow works
        onCreated(data);
      } else {
        showToast(res.data?.message || "Could not create deposit", "error");
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Deposit initiation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheetPortal>
      <div className="bottom-sheet-backdrop" onClick={onClose}>
        <div className="bottom-sheet luxe" onClick={(e) => e.stopPropagation()}>
          <div className="bottom-sheet-handle" />

          {!result ? (
            <>
              <div className="bottom-sheet-header">
                <h3 className="bottom-sheet-title">Create deposit</h3>
                <p className="bottom-sheet-subtitle small">Transfer the exact amount to Trebetta's account. Keep the reference.</p>
              </div>

              <form onSubmit={handleSubmit} className="bottom-sheet-body">
                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input type="number" inputMode="numeric" min="0" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5000" required />
                </div>

                <div className="form-group">
                  <label>Sender account name</label>
                  <input type="text" className="input" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Exact name on your bank app" required />
                </div>

                <div className="form-group">
                  <label>Sender bank</label>
                  <input type="text" className="input" value={senderBank} onChange={(e) => setSenderBank(e.target.value)} placeholder="e.g. GTBank, Access, Kuda..." required />
                </div>

                <div className="bottom-sheet-footer">
                  <button type="button" className="btn ghost" onClick={onClose} disabled={loading}>Cancel</button>
                  <button type="submit" className="btn primary" disabled={loading}>{loading ? "Creating..." : "Create deposit"}</button>
                </div>

                <p className="bottom-sheet-hint tiny">After creation you'll get Trebetta bank details below. You have 15 minutes to complete the transfer.</p>
              </form>
            </>
          ) : (
            <div className="bottom-sheet-body">
              <div className="success-block">
                <div className="success-title">Deposit created</div>
                <div className="success-note tiny">Send the exact amount and reference to the account below</div>

                <div className="bank-details">
                  <div className="bank-row"><div className="bank-label">Bank</div><div className="bank-value">{result.bank.bank_name}</div></div>
                  <div className="bank-row"><div className="bank-label">Account number</div><div className="bank-value">{result.bank.account_number}</div></div>
                  <div className="bank-row"><div className="bank-label">Account name</div><div className="bank-value">{result.bank.account_name}</div></div>
                  <div className="bank-row"><div className="bank-label">Reference</div><div className="bank-value">{result.reference}</div></div>
                </div>

                <div className="bottom-sheet-footer">
                  <button type="button" className="btn ghost" onClick={onClose}>Done</button>
                  <button type="button" className="btn primary" onClick={() => {
                    try {
                      navigator.clipboard.writeText(result.bank.account_number || "");
                      showToast("Account number copied", "success");
                    } catch (_) {
                      showToast("Copy failed", "error");
                    }
                  }}>Copy account</button>
                </div>

                <div className="support tiny muted">Support: {SUPPORT_PHONE}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheetPortal>
  );
}
