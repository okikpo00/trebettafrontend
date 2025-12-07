import React from "react";

export default function ProfileHeader({ username, fullName, email }) {
  return (
    <div className="profile-header">
      <div className="profile-username">@{username}</div>

      {fullName && fullName.trim().length > 0 && (
        <div className="profile-full">{fullName}</div>
      )}

      <div className="profile-email">{email}</div>
    </div>
  );
}
