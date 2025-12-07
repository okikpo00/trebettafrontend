import React, { useState } from "react";
import api from "../api";
import Toast from "../components/Toast";
import "../css/profile.css";

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/users/change-password", form);
      setToast({ message: res.data.message, type: "success" });
    } catch (err) {
      setToast({
        message: err?.response?.data?.message || "Failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h2 className="profile-section-title">Change Password</h2>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-form-field">
          <label>Current Password</label>
          <input
            type="password"
            name="current_password"
            className="input"
            value={form.current_password}
            onChange={handleChange}
          />
        </div>

        <div className="profile-form-field">
          <label>New Password</label>
          <input
            type="password"
            name="new_password"
            className="input"
            value={form.new_password}
            onChange={handleChange}
          />
        </div>

        <button className="btn primary" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
