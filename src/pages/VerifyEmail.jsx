// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import api from "../api";
import Toast from "../components/Toast";
import "../css/auth.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tokenFromQuery = searchParams.get("token");
  const emailFromState = location.state?.email;

  const [token, setToken] = useState(tokenFromQuery || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-verify if token exists in URL
  useEffect(() => {
    if (!tokenFromQuery) return;

    (async () => {
      setLoading(true);
      try {
        const res = await api.post("/auth/verify-email", { token: tokenFromQuery });
        setToast({ message: res.data?.message || "Email verified", type: "success" });
        setTimeout(() => navigate("/login"), 1200);
      } catch (err) {
        setToast({ message: err?.response?.data?.message || "Verification failed", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [tokenFromQuery, navigate]);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { token });
      setToast({ message: res.data?.message || "Email verified", type: "success" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setToast({ message: err?.response?.data?.message || "Verification failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-auth">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="brand-title">Almost there 🎉</div>
          <div className="subtitle">
            {emailFromState
              ? `We sent a verification link to ${emailFromState}`
              : "Check your email to verify your account"}
          </div>
        </div>

        {!tokenFromQuery && (
          <form className="form" onSubmit={handleManualVerify}>
            <div className="field">
              <label>Verification token</label>
              <input className="input" value={token} onChange={(e) => setToken(e.target.value)} />
            </div>

            <div className="row actions">
              <Link to="/login" className="link small">Back to login</Link>
              <button className="btn primary" disabled={loading}>
                {loading ? "Verifying..." : "Verify email"}
              </button>
            </div>
          </form>
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
