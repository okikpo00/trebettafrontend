// src/components/OTPInput.jsx
import React, { useRef } from "react";

export default function OTPInput({ value, onChange, length = 6 }) {
  const inputsRef = useRef([]);

  const safeValue = String(value || "").slice(0, length);

  const handleChange = (index, char) => {
    const cleaned = char.replace(/\D/g, "");
    const chars = safeValue.split("");
    chars[index] = cleaned;
    const next = chars.join("").slice(0, length);
    onChange(next);

    if (cleaned && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !safeValue[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="otp-input-group">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="tel"
          maxLength={1}
          className="otp-input"
          value={safeValue[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}