// src/components/DepositSheet.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";

const SUPPORT_PHONE = "+234 810 000 0000";
const FLW_MIN_AMOUNT = 500; // 🔴 Flutterwave minimum

export default function DepositSheet({ isOpen, onClose, onCreated, showToast }) {
  const [method, setMethod] = useState("flutterwave"); // flutterwave | manual
  const [amount, setAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 🔴 INLINE SHEET ERROR (VISIBLE)
  const [sheetError, setSheetError] = useState("");

  /* ----------------------------------
     RESET ON CLOSE
  ----------------------------------- */
  useEffect(() => {
    if (!isOpen) {
      setMethod("flutterwave");
      setAmount("");
      setSenderName("");
      setSenderBank("");
      setResult(null);
      setLoading(false);
      setSheetError("");
    }
  }, [isOpen]);

  /* ----------------------------------
     SUBMIT HANDLER
  ----------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setSheetError("");

    const cleanAmount = Number(amount);

    if (!cleanAmount || cleanAmount <= 0) {
      setSheetError("Enter a valid amount e.g. 5000");
      return;
    }

    /* -------------------------------
       FLUTTERWAVE (INSTANT)
    -------------------------------- */
 /* -------------------------------
   FLUTTERWAVE (INSTANT)
-------------------------------- */
if (method === "flutterwave") {
  if (cleanAmount < FLW_MIN_AMOUNT) {
    setSheetError("Minimum instant deposit is ₦500");
    return;
  }

  setLoading(true);
  try {
    const res = await api.post(
      "/wallet/deposit/flutterwave/initiate",
      { amount: cleanAmount }
    );

    // ✅ CORRECT RESPONSE SHAPE
    if (res?.status && res?.data?.payment_link) {
      window.location.href = res.data.payment_link;
      return;
    }

    console.error("FLW INIT BAD RESPONSE:", res);
    setSheetError("Unable to start payment. Please try again.");
  } catch (err) {
    console.error("FLW INIT ERROR:", err);
    setSheetError(
      err?.response?.data?.message || "Failed to start payment"
    );
  } finally {
    setLoading(false);
  }
  return;
}

    /* -------------------------------
       MANUAL DEPOSIT (UNCHANGED)
    -------------------------------- */
    if (!senderName || senderName.trim().length < 2) {
      setSheetError("Enter sender account name exactly as in your bank app");
      return;
    }

    if (!senderBank || senderBank.trim().length < 2) {
      setSheetError("Enter sender bank e.g. GTBank, Opay, Kuda");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/wallet/deposit/initiate", {
        amount: cleanAmount,
        sender_name: senderName.trim(),
        sender_bank: senderBank.trim(),
      });

      if (res.data?.status && res.data.data) {
        setResult(res.data.data);
        showToast(res.data.message || "Deposit created", "success");
        onCreated?.(res.data.data);
      } else {
        setSheetError(res.data?.message || "Could not create deposit");
      }
    } catch (err) {
      setSheetError(
        err?.response?.data?.message || "Deposit initiation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BottomSheetPortal>
      <div className="bottom-sheet-backdrop" onClick={onClose}>
        <div
          className="bottom-sheet luxe"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bottom-sheet-handle" />

          {!result ? (
            <>
              {/* HEADER */}
              <div className="bottom-sheet-header">
                <h3 className="bottom-sheet-title">Add money</h3>
                <p className="bottom-sheet-subtitle small">
                  Choose how you want to fund your wallet
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bottom-sheet-body">
                {/* METHOD */}
                <div className="form-group">
                  <label>Deposit method</label>

                  <div className="deposit-methods">
                    <button
                      type="button"
                      className={`deposit-method ${
                        method === "flutterwave" ? "active" : ""
                      }`}
                      onClick={() => setMethod("flutterwave")}
                    >
                      <strong>Instant deposit</strong>
                      <span className="tiny muted">
                        Card / Bank transfer / USSD (IMPORTANT:
During payment, your bank may show the beneficiary as
HORIZON BLUE BLISS GLOBAL.
This is Trebetta’s official payment account. Your wallet will be credited automatically.)
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`deposit-method ${
                        method === "manual" ? "active" : ""
                      }`}
                      onClick={() => setMethod("manual")}
                    >
                      <strong>Manual bank transfer</strong>
                      <span className="tiny muted">
                        Processed manually • takes a few minutes
                      </span>
                    </button>
                  </div>
                </div>

                {/* AMOUNT */}
                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                  />
                </div>

                {/* MANUAL FIELDS */}
                {method === "manual" && (
                  <>
                    <div className="form-group">
                      <label>Sender account name</label>
                      <input
                        className="input"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Exact name on your bank app"
                      />
                    </div>

                    <div className="form-group">
                      <label>Sender bank</label>
                      <input
                        className="input"
                        value={senderBank}
                        onChange={(e) => setSenderBank(e.target.value)}
                        placeholder="e.g. GTBank, Opay, Kuda"
                      />
                    </div>
                  </>
                )}

                {/* 🔴 INLINE ERROR */}
                {sheetError && (
                  <div className="sheet-error">
                    {sheetError}
                  </div>
                )}

                {/* FOOTER */}
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
                    {loading
                      ? "Please wait..."
                      : method === "flutterwave"
                      ? "Continue to payment"
                      : "Create deposit"}
                  </button>
                </div>

                {method === "manual" && (
                  <p className="bottom-sheet-hint tiny">
                    After creation, you’ll see Trebetta’s bank details.  
                    You have 15 minutes to complete the transfer.
                  </p>
                )}
              </form>
            </>
          ) : (
            /* RESULT VIEW */
            <div className="bottom-sheet-body">
              <div className="success-block">
                <div className="success-title">Deposit created</div>
                <div className="success-note tiny">
                  Send the exact amount using the details below
                </div>

                <div className="bank-details">
                  <div className="bank-row">
                    <div className="bank-label">Bank</div>
                    <div className="bank-value">{result.bank.bank_name}</div>
                  </div>
                  <div className="bank-row">
                    <div className="bank-label">Account number</div>
                    <div className="bank-value">{result.bank.account_number}</div>
                  </div>
                  <div className="bank-row">
                    <div className="bank-label">Account name</div>
                    <div className="bank-value">{result.bank.account_name}</div>
                  </div>
                  <div className="bank-row">
                    <div className="bank-label">Reference</div>
                    <div className="bank-value">{result.reference}</div>
                  </div>
                </div>

                <div className="bottom-sheet-footer">
                  <button className="btn ghost" onClick={onClose}>
                    Done
                  </button>
                </div>

                <div className="support tiny muted">
                  Support: {SUPPORT_PHONE}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheetPortal>
  );
}
