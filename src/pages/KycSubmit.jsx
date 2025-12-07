// src/pages/profile/KycSubmit.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import "../css/profile.css";
import "../css/kyc.css";

export default function KycSubmit() {
  const navigate = useNavigate();

  const [documentType, setDocumentType] = useState("NIN_SLIP");

  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  // Camera
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const showToast = (message, type = "info") =>
    setToast({ message, type });

  // ---- Cloudinary upload helper ----
  async function uploadToCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_NAME
    }/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_PRESET
    );

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error("Upload failed");
    }
    return data.secure_url;
  }

  // ---- Front / back upload handlers ----
  const handleFrontChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFront(true);
    try {
      const url = await uploadToCloudinary(file);
      setFrontUrl(url);
      showToast("Front side uploaded", "success");
    } catch (err) {
      console.error(err);
      showToast("Could not upload front image", "error");
    } finally {
      setUploadingFront(false);
    }
  };

  const handleBackChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBack(true);
    try {
      const url = await uploadToCloudinary(file);
      setBackUrl(url);
      showToast("Back side uploaded", "success");
    } catch (err) {
      console.error(err);
      showToast("Could not upload back image", "error");
    } finally {
      setUploadingBack(false);
    }
  };

  // ---- Camera / selfie logic ----
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        showToast("Camera not supported on this device", "error");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setSelfieUrl("");
    } catch (err) {
      console.error(err);
      showToast("Unable to access camera", "error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCaptureSelfie = async () => {
    if (!videoRef.current) return;

    setUploadingSelfie(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );

      if (!blob) throw new Error("Could not capture selfie");

      const url = await uploadToCloudinary(blob);
      setSelfieUrl(url);
      showToast("Selfie captured", "success");

      // turn off camera after capture
      stopCamera();
    } catch (err) {
      console.error(err);
      showToast("Could not capture selfie", "error");
    } finally {
      setUploadingSelfie(false);
    }
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Submit to backend ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentType || !frontUrl || !backUrl || !selfieUrl) {
      showToast("Please complete all KYC steps", "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/kyc/submit", {
        document_type: documentType,
        document_url: frontUrl,      // FRONT
        document_url_back: backUrl,  // BACK
        selfie_url: selfieUrl,       // SELFIE
      });

      showToast(
        "KYC submitted successfully. We’ll review and update your status.",
        "success"
      );

      // 🔁 Move user straight to Status page (shows "Pending review")
      navigate("/profile/kyc/status");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Error submitting KYC";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const isUploadingAnything =
    uploadingFront || uploadingBack || uploadingSelfie;

  const isSubmitDisabled =
    !documentType ||
    !frontUrl ||
    !backUrl ||
    !selfieUrl ||
    isUploadingAnything ||
    submitting;

  return (
    <div className="kyc-page">
      <h2 className="profile-section-title">Verify your identity</h2>
      <p className="small muted kyc-intro-text">
        Trebetta requires KYC to keep pools fair and withdrawals secure.
        Your details are encrypted and reviewed by our team.
      </p>

      {/* INFO CARD */}
      <div className="kyc-info-card">
        <h3 className="kyc-info-title">KYC checklist</h3>
        <ul className="kyc-bullet-list small">
          <li>No blurry or dark photos.</li>
          <li>All text on your ID must be clearly readable.</li>
          <li>Use your real face – no filters, hats or sunglasses.</li>
          <li>Make sure your document is valid and not expired.</li>
          <li>Selfie must match the face on your ID.</li>
        </ul>
      </div>

      <form className="kyc-form" onSubmit={handleSubmit}>
        {/* Document type */}
        <div className="profile-form-field">
          <label>Document type</label>
          <select
            className="input"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="NIN_SLIP">NIN Slip</option>
            <option value="NATIONAL_ID">National ID Card</option>
            <option value="PVC">PVC</option>
            <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
            <option value="INTERNATIONAL_PASSPORT">
              International Passport
            </option>
          </select>
          <p className="small muted">
            Choose the ID document you will upload for verification.
          </p>
        </div>

        {/* Document front & back grid */}
        <div className="kyc-upload-grid">
          {/* FRONT */}
          <div className="kyc-upload-card">
            <div className="kyc-upload-header">
              <span className="kyc-upload-title">Upload document front</span>
              <span className="kyc-upload-pill">Required</span>
            </div>
            <p className="small muted kyc-upload-hint">
              Show the full front of your ID. No reflections, no cropped
              corners.
            </p>

            {frontUrl ? (
              <div className="kyc-preview-wrap">
                <img
                  src={frontUrl}
                  alt="Document front preview"
                  className="kyc-preview-img"
                />
                <button
                  type="button"
                  className="btn ghost small kyc-change-btn"
                  onClick={() => setFrontUrl("")}
                >
                  Change image
                </button>
              </div>
            ) : (
              <label className="kyc-upload-drop">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFrontChange}
                  disabled={uploadingFront}
                />
                {uploadingFront ? (
                  <div className="kyc-upload-loading">
                    <Loader size={18} />
                    <span className="small">Uploading front...</span>
                  </div>
                ) : (
                  <div className="kyc-upload-body">
                    <span className="kyc-upload-main">
                      Tap to upload front
                    </span>
                    <span className="small muted">
                      JPG or PNG image. Clear and readable.
                    </span>
                  </div>
                )}
              </label>
            )}
          </div>

          {/* BACK */}
          <div className="kyc-upload-card">
            <div className="kyc-upload-header">
              <span className="kyc-upload-title">Upload document back</span>
              <span className="kyc-upload-pill">Required</span>
            </div>
            <p className="small muted kyc-upload-hint">
              Upload the back of your ID (where applicable). If your document
              has no back, upload the same side again.
            </p>

            {backUrl ? (
              <div className="kyc-preview-wrap">
                <img
                  src={backUrl}
                  alt="Document back preview"
                  className="kyc-preview-img"
                />
                <button
                  type="button"
                  className="btn ghost small kyc-change-btn"
                  onClick={() => setBackUrl("")}
                >
                  Change image
                </button>
              </div>
            ) : (
              <label className="kyc-upload-drop">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackChange}
                  disabled={uploadingBack}
                />
                {uploadingBack ? (
                  <div className="kyc-upload-loading">
                    <Loader size={18} />
                    <span className="small">Uploading back...</span>
                  </div>
                ) : (
                  <div className="kyc-upload-body">
                    <span className="kyc-upload-main">
                      Tap to upload back
                    </span>
                    <span className="small muted">
                      JPG or PNG image. Clear and readable.
                    </span>
                  </div>
                )}
              </label>
            )}
          </div>
        </div>

        {/* SELFIE SECTION */}
        <div className="kyc-selfie-card">
          <div className="kyc-upload-header">
            <span className="kyc-upload-title">Live selfie</span>
            <span className="kyc-upload-pill">Required</span>
          </div>
          <p className="small muted kyc-upload-hint">
            Use your phone&apos;s camera. Face the camera directly, in a bright
            place. No sunglasses, masks or heavy filters.
          </p>

          {!selfieUrl && !cameraActive && (
            <button
              type="button"
              className="btn outline kyc-camera-btn"
              onClick={startCamera}
              disabled={uploadingSelfie}
            >
              {uploadingSelfie ? "Preparing camera..." : "Open camera"}
            </button>
          )}

          {/* Live camera view */}
          {cameraActive && (
            <div className="kyc-selfie-live">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="kyc-selfie-video"
              />
              <div className="kyc-selfie-actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={handleCaptureSelfie}
                  disabled={uploadingSelfie}
                >
                  {uploadingSelfie ? "Capturing..." : "Capture selfie"}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={stopCamera}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Captured selfie preview */}
          {selfieUrl && !cameraActive && (
            <div className="kyc-preview-wrap kyc-selfie-preview">
              <img
                src={selfieUrl}
                alt="Selfie preview"
                className="kyc-preview-img kyc-preview-img-selfie"
              />
              <button
                type="button"
                className="btn ghost small kyc-change-btn"
                onClick={startCamera}
              >
                Retake selfie
              </button>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <div className="kyc-submit-row">
          <button
            className="btn primary"
            type="submit"
            disabled={isSubmitDisabled}
          >
            {submitting ? "Submitting KYC..." : "Submit for review"}
          </button>
          {!frontUrl || !backUrl || !selfieUrl ? (
            <p className="small muted">
              Upload <strong>front, back and selfie</strong> to enable submit.
            </p>
          ) : (
            <p className="small muted">
              By submitting, you agree that your details may be used for
              identity verification.
            </p>
          )}
        </div>
      </form>

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
