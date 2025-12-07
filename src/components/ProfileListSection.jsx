import React from "react";

export default function ProfileListSection({ title, children }) {
  return (
    <div className="profile-section">
      <div className="profile-section-title">{title}</div>
      {children}
    </div>
  );
}
