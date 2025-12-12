// src/components/DepositSheet.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";

const TREBETTA_ACCOUNTS = [
  {
    id: "sterling_primary",
    bank_name: "Sterling Bank",
    account_number: "0116012103",
    account_name: "HORIZON BLUE BLISS GLOBAL",
    support_phone: "+234 810 000 0000",
  },
  // add others here if you use multiple Trebetta receiving accounts
];

export default function DepositSheet({
  isOpen,
  onClose,
  onCreated,
  showToast,
}) {
  const [amount, setAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // selected trebetta receiving account (visual only)
  const [trebettaAccountId, setTrebettaAccountId] = useState(TREBETTA_ACCOUNTS[0].id);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setSenderName("");
      setSenderBank("");
      setResult(null);
      setLoading(false);
      setTrebettaAccountId(TREBETTA_ACCOUNTS[0].id);
    }
  }, [isOpen]);

  const selectedTrebetta = TREBETTA_ACCOUNTS.find(a => a.id === trebettaAccountId) || TREBETTA_ACCOUNTS[0];

  const resetForm = () => {
    setAmount("");
    setSenderName("");
    setSenderBank("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanAmount = Number(amount);
    if (!cleanAmount || cleanAmount <= 0) {
      showToast("Enter a valid deposit amount", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/wallet/deposit/initiate", {
        amount: cleanAmount,
        sender_name: senderName,
        sender_bank: senderBank,
      });

      if (res.data?.status && res.data.data) {
        showToast(res.data.message || "Deposit created", "success");
        setResult(res.data.data);
        onCreated(res.data.data);
        resetForm();
      } else {
        showToast(
          res.data?.message || "Could not create deposit",
          "error"
        );
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Deposit initiation failed",
        "error"
      );
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
                <h3 className="bottom-sheet-title">Deposit</h3>
                <p className="bottom-sheet-subtitle small">
                  Transfer the exact amount to the Trebetta account shown below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bottom-sheet-body">
                <div className="form-group">
                  <label>Pay to (Trebetta account)</label>
                  <select
                    className="input"
                    value={trebettaAccountId}
                    onChange={(e) => setTrebettaAccountId(e.target.value)}
                  >
                    {TREBETTA_ACCOUNTS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.bank_name} • {a.account_number}
                      </option>
                    ))}
                  </select>
                  <div className="tiny muted" style={{ marginTop: 6 }}>
                    Support: <strong>{selectedTrebetta.support_phone}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Sender account name</label>
                  <input
                    type="text"
                    className="input"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Exact name on your bank app"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Sender bank</label>
                  <input
                    type="text"
                    className="input"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    placeholder="e.g. GTBank, Access, Kuda..."
                    required
                  />
                </div>

                <div className="bottom-sheet-footer">
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn primary"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create deposit"}
                  </button>
                </div>

                <p className="bottom-sheet-hint tiny">
                  After creating a deposit, you’ll see Trebetta bank account details and have{" "}
                  <strong>15 minutes</strong> to complete the transfer.
                </p>
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

                <div className="support tiny muted">Support: {selectedTrebetta.support_phone}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheetPortal>
  );
}
