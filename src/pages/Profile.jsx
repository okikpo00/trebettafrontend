// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

import "../css/profile.css";

import ProfileHeader from "../components/ProfileHeader";
import ProfileListSection from "../components/ProfileListSection";
import ProfileListItem from "../components/ProfileListItem";
import KycBadge from "../components/KycBadge";
import Toast from "../components/Toast";
import Loader from "../components/Loader";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [kyc, setKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (m, t = "info") => setToast({ message: m, type: t });

  const loadData = async () => {
    setLoading(true);
    try {
      const [meRes, kycRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/kyc/status"),
      ]);

      if (meRes.data?.user) setUser(meRes.data.user);

      let list = [];
      if (Array.isArray(kycRes.data)) {
        list = kycRes.data;
      } else if (kycRes.data && Array.isArray(kycRes.data.data)) {
        list = kycRes.data.data;
      }
      setKyc(list);
    } catch (err) {
      console.error(err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="profile-page-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page-center">
        <p className="small muted">Could not load profile.</p>
      </div>
    );
  }

  const latestKyc = kyc[0] || null;
  const kycStatus = latestKyc?.status || null;

  // Determine what KYC submit item should say
  let kycSubmitLabel = "Submit KYC";
  let kycSubmitDisabled = false;

  if (!latestKyc) {
    kycSubmitLabel = "Submit KYC";
    kycSubmitDisabled = false;
  } else if (kycStatus === "pending") {
    kycSubmitLabel = "KYC Pending";
    kycSubmitDisabled = true;
  } else if (kycStatus === "approved") {
    kycSubmitLabel = "KYC Approved";
    kycSubmitDisabled = true;
  } else if (kycStatus === "rejected") {
    kycSubmitLabel = "Re-submit KYC";
    kycSubmitDisabled = false;
  }

  return (
    <div className="profile-page">
      {/* TOP HEADER */}
      <ProfileHeader
        username={user.username}
        fullName={`${user.first_name || ""} ${user.last_name || ""}`}
        email={user.email}
      />

      {/* ACCOUNT INFO */}
      <ProfileListSection title="Account">
        <ProfileListItem
          label="Edit Profile"
          onClick={() => navigate("/profile/edit")}
        />
        <ProfileListItem
          label="Change Password"
          onClick={() => navigate("/profile/change-password")}
        />
      </ProfileListSection>

      {/* KYC BLOCK */}
      <ProfileListSection title="KYC Verification">
        {/* KYC STATUS ROW */}
        <div className="profile-kyc-row">
          <div>
            <div className="profile-kyc-title">KYC Status</div>
            <div className="profile-kyc-sub">
              {kycStatus ? kycStatus : "Not submitted"}
            </div>
          </div>
          <KycBadge status={kycStatus} />
        </div>

        {/* VIEW KYC STATUS — always clickable */}
        <ProfileListItem
          label="View KYC Status"
          onClick={() => navigate("/profile/kyc/status")}
        />

        {/* SUBMIT / RESUBMIT KYC */}
        <ProfileListItem
          label={kycSubmitLabel}
          disabled={kycSubmitDisabled}
          onClick={() => {
            if (!kycSubmitDisabled) navigate("/profile/kyc/submit");
          }}
        />
      </ProfileListSection>

 {/* SETTINGS */}
<ProfileListSection title="Security">
  <ProfileListItem
    label="Change Transaction PIN"
    onClick={() => navigate("/profile/pin/change")}
  />

  <ProfileListItem
    label="Forgot Transaction PIN"
    onClick={() => navigate("/profile/pin/reset")}
  />
</ProfileListSection>

<ProfileListSection title="Settings">
  <ProfileListItem
    label="Notifications"
    onClick={() => navigate("/notifications")}
  />
  <ProfileListItem
    label="Delete Account"
    onClick={() => navigate("/profile/delete-account")}
  />
</ProfileListSection>



      {/* SUPPORT */}
      <ProfileListSection title="Support">
        <ProfileListItem
          label="Help Center"
          onClick={() => navigate("/support/help-center")}
        />
        <ProfileListItem
          label="Contact Support"
          onClick={() => navigate("/support/contact")}
        />
        <ProfileListItem
          label="Terms & Privacy"
          onClick={() => navigate("/support/terms")}
        />
      </ProfileListSection>

      {/* LOGOUT BUTTON */}
      <button
        type="button"
        className="profile-logout-btn"
        onClick={async () => {
          try {
            await api.post("/auth/logout");
            navigate("/login", { replace: true });
          } catch {
            showToast("Could not logout", "error");
          }
        }}
      >
        Logout
      </button>

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
