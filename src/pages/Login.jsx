import React, { useState, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api";
import Toast from "../components/Toast";
import { WalletContext } from "../context/WalletContext";
import "../css/auth.css";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  // 🔥 access wallet refresh function
  const { refreshWallet } = useContext(WalletContext);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!identifier.trim()) e.identifier = "Required";
    if (!password) e.password = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const triggerShake = () => {
    if (!cardRef.current) return;
    cardRef.current.classList.remove("shake");
    cardRef.current.offsetWidth;
    cardRef.current.classList.add("shake");
    setTimeout(() => cardRef.current && cardRef.current.classList.remove("shake"), 600);
  };

  const handleSubmit = async (ev) => {
    ev?.preventDefault();
    if (!validate()) { triggerShake(); return; }
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        identifier: identifier.trim(),
        password
      });

      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user;

      // TOKEN STORE
      if (token) {
        localStorage.setItem("trebetta_token", token);
      }

      if (user?.has_pin) {
        localStorage.setItem("trebetta_has_pin", "yes");
      } else {
        localStorage.removeItem("trebetta_has_pin");
      }

      // 🔥 REFRESH WALLET IMMEDIATELY = FIX TOPBAR NOT SHOWING BALANCE
      try {
        await refreshWallet();
      } catch (e) {
        console.log("wallet refresh failed silently");
      }

      // UPDATE APP AUTH STATE
      onLoginSuccess?.();

      setToast({ message: "Login successful", type: "success" });

      setTimeout(() => navigate("/home"), 700);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed";
      setToast({ message: msg, type: "error" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-auth">
      <div className="auth-card" ref={cardRef} role="main" aria-labelledby="login-title">
        <div className="auth-hero">
          <div className="brand-title" id="login-title">TREBETTA</div>
          <div className="subtitle">Log in to your account to join pools and manage your wallet</div>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className={`field ${errors.identifier ? "error" : ""}`}>
            <label>Email / Username / Phone</label>
            <input
              className="input"
              placeholder="you@example.com or username or +234701..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
            {errors.identifier && <div className="field-msg error">{errors.identifier}</div>}
          </div>

          <div className={`field ${errors.password ? "error" : ""}`}>
            <label>Password</label>
            <div className="pw-wrap">
              <input
                className="input"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                {showPw ? <FaEyeSlash/> : <FaEye/>}
              </button>
            </div>
            {errors.password && <div className="field-msg error">{errors.password}</div>}
          </div>

          <div className="form-foot">
            <div className="small row">
              <label className="remember">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="link" style={{ marginLeft: 12 }}>Forgot password?</Link>
            </div>

            <div>
              <button type="button" className="btn ghost" onClick={() => navigate("/register")}>Create account</button>
              <button type="submit" className="btn primary" disabled={loading} style={{ marginLeft: 12 }}>
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
