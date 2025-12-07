import React, { useState, useEffect } from "react";
import api from "../api";
import "../css/profile.css";
import Toast from "../components/Toast";

export default function EditProfile() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="info") =>
    setToast({ message: msg, type });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/users/me");
        if (res.data?.user) {
          setForm(res.data.user);
        }
      } catch (err) {
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.put("/users/me", form);
      if (res.data?.message) showToast("Profile updated", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Update failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="profile-page-center">Loading...</div>;

  return (
    <div className="profile-page">
      <h2 className="profile-section-title">Edit Profile</h2>

      <form className="profile-form" onSubmit={handleSubmit}>
        {["first_name", "last_name", "username", "email", "phone"].map((field) => (
          <div key={field} className="profile-form-field">
            <label>{field.replace("_", " ").toUpperCase()}</label>
            <input
              name={field}
              className="input"
              value={form[field] || ""}
              onChange={handleChange}
            />
          </div>
        ))}

        <button className="btn primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
