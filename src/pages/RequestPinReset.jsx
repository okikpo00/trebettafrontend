import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function RequestPinReset({ showToast }) {
  const navigate = useNavigate(); // ✅ CORRECT WAY
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔔 Safe toast helper
  const notify = (message, type = "success") => {
    if (typeof showToast === "function") {
      showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/wallet/pin/reset/request", { password });

      if (res.status === 200) {
        notify("OTP sent to your email", "success");
        navigate("/profile/pin/reset/confirm"); // ✅ SAFE
        return;
      }

      setError(res.data?.message || "Request failed");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="pin-card">
      <h2>Reset Transaction PIN</h2>
      <p className="muted">
        Enter your account password to continue
      </p>

      {error && <div className="sheet-error">{error}</div>}

      <input
        type="password"
        className="input"
        placeholder="Account password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <button
        type="submit"
        className="btn primary"
        disabled={loading}
      >
        {loading ? "Please wait..." : "Send OTP"}
      </button>
    </form>
  );
}