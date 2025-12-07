import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api";
import Toast from "../components/Toast";
import "../css/auth.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";
  const [token, setToken] = useState(tokenFromQuery);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (tokenFromQuery) setToken(tokenFromQuery); }, [tokenFromQuery]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!token) { setToast({ message: "Verification token required", type: "error" }); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { token });
      setToast({ message: res.data?.message || "Email verified", type: "success" });
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setToast({ message: err?.response?.data?.message || "Verification failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-auth">
      <div className="auth-card" role="main">
        <div className="auth-hero">
          <div className="brand-title">Verify Email</div>
          <div className="subtitle">Paste the verification token from your email or follow the link</div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Verification token</label>
            <input className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="token from email" />
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
            <div className="small"><Link to="/login" className="link">Back to login</Link></div>
            <button type="submit" className="btn primary" disabled={loading}>{loading ? "Verifying..." : "Verify"}</button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
