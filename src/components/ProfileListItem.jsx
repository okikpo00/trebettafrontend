import React from "react";
import { ChevronRight } from "lucide-react";

export default function ProfileListItem({ label, onClick }) {
  return (
    <div className="profile-item" onClick={onClick}>
      <span className="profile-item-label">{label}</span>
      <ChevronRight size={18} />
    </div>
  );
}
