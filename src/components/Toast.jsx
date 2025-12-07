// src/components/Toast.jsx
import React, { useEffect, useState } from "react";
import "../css/toast.css";

export default function Toast({ message, type = "info", duration = 4000, onClose }) {
  const [visible, setVisible] = useState(Boolean(message));
  useEffect(() => {
    setVisible(Boolean(message));
    if (!message) return;
    const t = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div className={`toast ${type} ${visible ? "in" : "out"}`} role="status" aria-live="polite">
      <div className="toast-body">{message}</div>
      <button className="toast-close" onClick={() => { setVisible(false); onClose && onClose(); }} aria-label="Close">×</button>
    </div>
  );
}
