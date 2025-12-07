import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api";
import Toast from "../components/Toast";
import "../css/auth.css";

const PW_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // at least 8 chars and includes number + letter

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);

  const formatPhone = (p) => {
    let s = String(p || "").replace(/[^\d]/g, "").trim();
    if (/^0\d{10}$/.test(s)) return "+234" + s.slice(1);
    if (/^234\d{10}$/.test(s)) return "+" + s;
    if (/^\+234\d{10}$/.test("+" + s) && s.length === 13) return "+" + s; // fallback
    // simply return input if starts with +234
    if (/^\+234\d{10}$/.test(p)) return p;
    return p;
  };

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim()) e.lastName = "Required";
    if (!username.trim()) e.username = "Required";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email";
    if (phone.trim()) {
      const fp = formatPhone(phone);
      if (!/^\+234\d{10}$/.test(fp)) e.phone = "Use Nigerian format, e.g. +2347012345678";
    }
    if (!PW_RE.test(password)) e.password = "Password must be ≥8 chars and include letters & numbers";
    if (password !== confirm) e.confirm = "Passwords do not match";
    if (!agree) e.agree = "You must accept Terms & confirm age";
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
      const body = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: formatPhone(phone.trim()) || undefined,
        password,
      };
      const res = await api.post("/auth/register", body);
      setToast({ message: res.data?.message || "Registered successfully", type: "success" });
      // animated success — small delay, then redirect to login
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      setToast({ message: msg, type: "error" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-auth">
      <div className="auth-card" ref={cardRef} role="main">
        <div className="auth-hero">
          <div className="brand-title">TREBETTA</div>
          <div className="subtitle">Create an account to start predicting and winning</div>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className={`field ${errors.firstName ? "error" : ""}`}>
                <label>First name</label>
                <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                {errors.firstName && <div className="field-msg error">{errors.firstName}</div>}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className={`field ${errors.lastName ? "error" : ""}`}>
                <label>Last name</label>
                <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                {errors.lastName && <div className="field-msg error">{errors.lastName}</div>}
              </div>
            </div>
          </div>

          <div className={`field ${errors.username ? "error" : ""}`}>
            <label>Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
            {errors.username && <div className="field-msg error">{errors.username}</div>}
          </div>

          <div className={`field ${errors.email ? "error" : ""}`}>
            <label>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            {errors.email && <div className="field-msg error">{errors.email}</div>}
          </div>

          <div className={`field ${errors.phone ? "error" : ""}`}>
            <label>Phone (optional) — Nigeria format</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2347012345678 or 07012345678" />
            {errors.phone && <div className="field-msg error">{errors.phone}</div>}
          </div>

          <div className="row">
            <div style={{ flex: 1 }} className={`field ${errors.password ? "error" : ""}`}>
              <label>Password</label>
              <div className="pw-wrap">
                <input className="input" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="use at least 8 characters" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password ? <div className="field-msg error">{errors.password}</div> : <div className="field-msg helper">Use at least 8 characters, include letters and numbers</div>}
            </div>

            <div style={{ flex: 1 }} className={`field ${errors.confirm ? "error" : ""}`}>
              <label>Confirm</label>
              <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              {errors.confirm && <div className="field-msg error">{errors.confirm}</div>}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <input id="terms" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <label htmlFor="terms" className="small">I hereby confirm I am 18+ and agree to the <span className="link">Terms & Conditions</span></label>
          </div>
          {errors.agree && <div className="field-msg error">{errors.agree}</div>}

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="small">Already have an account? <Link to="/login" className="link">Login</Link></div>
            <div>
              <button type="button" className="btn ghost" onClick={() => navigate("/home")}>Cancel</button>
              <button type="submit" className="btn primary" disabled={loading} style={{ marginLeft: 12 }}>
                {loading ? "Creating..." : "Create account"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
