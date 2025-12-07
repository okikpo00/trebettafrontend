import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import Toast from "../components/Toast";
import "../css/auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Enter a valid email"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      setToast({ message: res.data?.message || "If account exists, reset link sent", type: "success" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setToast({ message: err?.response?.data?.message || "Failed to request reset", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-auth">
      <div className="auth-card" role="main">
        <div className="auth-hero">
          <div className="brand-title">Forgot password</div>
          <div className="subtitle">Enter your account email to receive a password reset link</div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className={`field ${error ? "error" : ""}`}>
            <label>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            {error && <div className="field-msg error">{error}</div>}
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="small"><Link to="/login" className="link">Back to login</Link></div>
            <div>
              <button type="button" className="btn ghost" onClick={() => navigate("/home")}>Cancel</button>
              <button type="submit" className="btn primary" disabled={loading} style={{ marginLeft: 12 }}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
