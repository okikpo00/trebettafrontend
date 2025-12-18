// src/components/SavedAccountsSheet.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import BottomSheetPortal from "./BottomSheetPortal";

export default function SavedAccountsSheet({
  isOpen,
  onClose,
  onSelectAccount,
  showToast
}) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchAccounts();
  }, [isOpen]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/wallet/accounts");
      if (res.data?.status && Array.isArray(res.data.data)) {
        setAccounts(res.data.data);
      } else {
        setAccounts([]);
      }
    } catch (_) {
      showToast?.("Failed to load saved accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this saved account?")) return;
    setDelLoading(id);
    try {
      const res = await api.delete(`/wallet/accounts/${id}`);
      if (res.data?.status) {
        showToast?.("Account deleted", "success");
        fetchAccounts();
      } else {
        showToast?.("Could not delete account", "error");
      }
    } catch (_) {
      showToast?.("Delete failed", "error");
    } finally {
      setDelLoading(null);
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

          <div className="bottom-sheet-header">
            <h3 className="bottom-sheet-title">Saved accounts</h3>
            <p className="bottom-sheet-subtitle small">
              Select a saved account to auto-fill withdrawal details.
            </p>
          </div>

          <div className="bottom-sheet-body">
            {loading && <div className="tiny muted">Loading...</div>}

            {!loading && accounts.length === 0 && (
              <div className="tiny muted">No saved accounts yet.</div>
            )}

            {!loading &&
              accounts.map((a) => (
                <div key={a.id} className="saved-account-row card">
                  <div>
                    <div className="saved-account-name">
                      {a.account_name}
                    </div>
                    <div className="tiny muted">
                      {a.account_number}
                    </div>
                  </div>

                  <div className="saved-account-actions">
                    <button
                      className="btn ghost tiny-btn"
                      onClick={() => {
                        onSelectAccount({
                          id: a.id,
                          bank_id: a.bank_code,
                          account_number: a.account_number,
                          account_name: a.account_name
                        });
                        onClose();
                      }}
                    >
                      Use
                    </button>

                    <button
                      className="btn outline tiny-btn"
                      onClick={() => handleDelete(a.id)}
                      disabled={delLoading === a.id}
                    >
                      {delLoading === a.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="bottom-sheet-footer">
            <button className="btn ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
