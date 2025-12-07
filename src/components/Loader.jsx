// src/components/Loader.jsx
import React from "react";

export default function Loader({ small }) {
  return (
    <div className={"loader" + (small ? " loader-sm" : "")}>
      <div className="loader-spinner" />
    </div>
  );
}