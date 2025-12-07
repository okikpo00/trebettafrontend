import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api";
import Toast from "../components/Toast";
import "../css/auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";
  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (tokenFromQuery) setToken(tokenFromQuery); }, [tokenFromQuery]);

  const validate = () => {
    const e = {};
    if (!token) e.token = "Token required";
    if (!password || password.length < 8) e.password = "Use at least 8 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { token, password });
      setToast({ message: res.data?.message || "Password reset successful", type: "success" });
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setToast({ message: err?.response?.data?.message || "Reset failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-auth">
      <div className="auth-card" role="main">
        <div className="auth-hero">
          <div className="brand-title">Reset password</div>
          <div className="subtitle">Enter a new password for your account</div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className={`field ${errors.token ? "error" : ""}`}>
            <label>Reset token (from email)</label>
            <input className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="paste token or use link" />
            {errors.token && <div className="field-msg error">{errors.token}</div>}
          </div>

          <div className={`field ${errors.password ? "error" : ""}`}>
            <label>New password</label>
            <div className="pw-wrap">
              <input className="input" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="field-msg error">{errors.password}</div>}
          </div>

          <div className={`field ${errors.confirm ? "error" : ""}`}>
            <label>Confirm password</label>
            <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {errors.confirm && <div className="field-msg error">{errors.confirm}</div>}
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
            <div className="small"><Link to="/login" className="link">Back to login</Link></div>
            <button type="submit" className="btn primary" disabled={loading}>{loading ? "Resetting..." : "Reset password"}</button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
