// src/pages/Register.jsx
import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api";
import Toast from "../components/Toast";
import "../css/auth.css";

const PW_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function Register() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

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

  const formatPhone = (p) => {
    let s = String(p || "").replace(/[^\d]/g, "").trim();
    if (/^0\d{10}$/.test(s)) return "+234" + s.slice(1);
    if (/^234\d{10}$/.test(s)) return "+" + s;
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
      if (!/^\+234\d{10}$/.test(fp)) {
        e.phone = "Use Nigerian format, e.g. +2347012345678";
      }
    }
    if (!PW_RE.test(password)) {
      e.password = "Password must be ≥8 chars and include letters & numbers";
    }
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
    setTimeout(() => cardRef.current?.classList.remove("shake"), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: formatPhone(phone.trim()) || undefined,
        password
      });

      navigate("/verify-email", {
        state: { email: email.trim() }
      });
    } catch (err) {
      setToast({
        message: err?.response?.data?.message || "Registration failed",
        type: "error"
      });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-auth">
      <div className="auth-card" ref={cardRef}>
        <div className="auth-hero">
          <div className="brand-title">TREBETTA</div>
          <div className="subtitle">Create an account to get started</div>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {/* Names */}
          <div className="row">
            <div className={`field ${errors.firstName ? "error" : ""}`}>
              <label>First name</label>
              <input
                className="input"
                placeholder="e.g. John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && <div className="field-msg error">{errors.firstName}</div>}
            </div>

            <div className={`field ${errors.lastName ? "error" : ""}`}>
              <label>Last name</label>
              <input
                className="input"
                placeholder="e.g. Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && <div className="field-msg error">{errors.lastName}</div>}
            </div>
          </div>

          {/* Username */}
          <div className={`field ${errors.username ? "error" : ""}`}>
            <label>Username</label>
            <input
              className="input"
              placeholder="Choose a unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <div className="field-msg error">{errors.username}</div>}
          </div>

          {/* Email */}
          <div className={`field ${errors.email ? "error" : ""}`}>
            <label>Email</label>
            <input
              className="input"
              placeholder="e.g. name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div className="field-msg error">{errors.email}</div>}
          </div>

          {/* Phone */}
          <div className={`field ${errors.phone ? "error" : ""}`}>
            <label>Phone (optional)</label>
            <input
              className="input"
              placeholder="+2347012345678 or 07012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && <div className="field-msg error">{errors.phone}</div>}
          </div>

          {/* Passwords */}
          <div className="row">
            <div className={`field ${errors.password ? "error" : ""}`}>
              <label>Password</label>
              <div className="pw-wrap">
                <input
                  className="input"
                  placeholder="Minimum 8 characters (letters & numbers)"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                >
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <div className="field-msg error">{errors.password}</div>}
            </div>

            <div className={`field ${errors.confirm ? "error" : ""}`}>
              <label>Confirm password</label>
              <input
                className="input"
                placeholder="Re-enter password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {errors.confirm && <div className="field-msg error">{errors.confirm}</div>}
            </div>
          </div>

          {/* Terms */}
          <div className="row">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <label className="small">
              I am 18+ and agree to the{" "}
              <Link to="/support/terms" className="link">Terms & Privacy</Link>
            </label>
          </div>
          {errors.agree && <div className="field-msg error">{errors.agree}</div>}

          {/* Actions */}
          <div className="row actions">
            <span className="small">
              Already have an account? <Link to="/login" className="link">Login</Link>
            </span>
            <button className="btn primary" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
