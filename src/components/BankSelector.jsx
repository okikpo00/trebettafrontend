// src/components/BankSelector.jsx
import React from "react";
import BANKS from "./banks";

export default function BankSelector({ value, onChange }) {
  return (
    <select
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select bank</option>
      {BANKS.map((b) => (
        <option key={b.code} value={b.code}>
          {b.name} ({b.code})
        </option>
      ))}
    </select>
  );
}