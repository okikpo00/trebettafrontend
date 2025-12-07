// src/pages/kycStatus.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Toast from "../components/Toast";
import Loader from "../components/Loader";

import "../css/profile.css";
import "../css/kyc.css";

export default function KycStatus() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (m, t = "info") => setToast({ message: m, type: t });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/kyc/status");

        let list = [];
        // Support both shapes: array OR { status, data: [] }
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        }

        if (mounted) {
          setRecord(list.length > 0 ? list[0] : null); // latest (backend already DESC)
        }
      } catch (err) {
        console.error(err);
        if (mounted) showToast("Failed to load KYC status", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- UI derivations ----------
  let statusLabel = "Not submitted";
  let statusClass = "kyc-status-pill-none";

  if (record?.status) {
    const s = String(record.status).toLowerCase();
    if (s === "pending") {
      statusLabel = "Pending review";
      statusClass = "kyc-status-pill-pending";
    } else if (s === "approved") {
      statusLabel = "Approved";
      statusClass = "kyc-status-pill-approved";
    } else if (s === "rejected") {
      statusLabel = "Rejected";
      statusClass = "kyc-status-pill-rejected";
    } else {
      statusLabel = record.status;
      statusClass = "kyc-status-pill-none";
    }
  }

  const createdAt = record?.created_at
    ? new Date(record.created_at).toLocaleString()
    : null;

  return (
    <div className="kyc-page">
      <h2 className="profile-section-title">KYC status</h2>

      {loading ? (
        <div className="kyc-status-card">
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
        </div>
      ) : !record ? (
        <div className="kyc-status-card">
          <p className="small muted">
            You haven&apos;t submitted any KYC yet. Go to{" "}
            <strong>Submit KYC</strong> to get verified.
          </p>
        </div>
      ) : (
        <div className="kyc-status-card">
          <div className="kyc-status-header">
            <span className={"kyc-status-pill " + statusClass}>
              {statusLabel}
            </span>
            <span className="small muted">
              {createdAt ? `Submitted ${createdAt}` : ""}
            </span>
          </div>

          <div className="kyc-status-body small">
            <div className="kyc-status-row">
              <span className="kyc-status-label">Document type</span>
              <span className="kyc-status-value">
                {record.document_type || "-"}
              </span>
            </div>

            {record.status === "rejected" && record.rejection_reason && (
              <div className="kyc-status-reason">
                <div className="kyc-status-label">Reason</div>
                <div className="kyc-status-value">
                  {record.rejection_reason}
                </div>
              </div>
            )}

            <div className="kyc-status-thumbs">
              {record.document_url && (
                <div className="kyc-status-thumb">
                  <div className="kyc-status-thumb-label small">
                    Document front
                  </div>
                  <img
                    src={record.document_url}
                    alt="KYC front"
                    className="kyc-status-thumb-img"
                  />
                </div>
              )}

              {record.document_url_back && (
                <div className="kyc-status-thumb">
                  <div className="kyc-status-thumb-label small">
                    Document back
                  </div>
                  <img
                    src={record.document_url_back}
                    alt="KYC back"
                    className="kyc-status-thumb-img"
                  />
                </div>
              )}

              {record.selfie_url && (
                <div className="kyc-status-thumb">
                  <div className="kyc-status-thumb-label small">
                    Selfie
                  </div>
                  <img
                    src={record.selfie_url}
                    alt="KYC selfie"
                    className="kyc-status-thumb-img"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
