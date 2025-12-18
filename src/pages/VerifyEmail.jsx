// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation
} from "react-router-dom";
import api from "../api";
import Toast from "../components/Toast";
import "../css/auth.css";

const RESEND_WAIT = 60; // seconds

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tokenFromQuery = searchParams.get("token");
  const emailFromState = location.state?.email;

  /**
   * status:
   * idle       -> waiting / email sent
   * verifying  -> verifying token
   * success    -> verified
   * error      -> failed / expired
   */
  const [status, setStatus] = useState("idle");

  const [countdown, setCountdown] = useState(RESEND_WAIT);
  const [canResend, setCanResend] = useState(false);
  const [toast, setToast] = useState(null);

  /* --------------------------------------------------
     AUTO VERIFY IF TOKEN EXISTS IN URL
  -------------------------------------------------- */
  useEffect(() => {
    if (!tokenFromQuery) return;

    (async () => {
      setStatus("verifying");
      try {
        const res = await api.post("/auth/verify-email", {
          token: tokenFromQuery
        });

        setStatus("success");
        setToast({
          message: res.data?.message || "Email verified successfully",
          type: "success"
        });

        // short pause then force login
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } catch (err) {
        setStatus("error");
        setToast({
          message:
            err?.response?.data?.message ||
            "Verification failed or link expired",
          type: "error"
        });
      }
    })();
  }, [tokenFromQuery, navigate]);

  /* --------------------------------------------------
     RESEND COUNTDOWN
  -------------------------------------------------- */
  useEffect(() => {
    if (canResend) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [canResend]);

  /* --------------------------------------------------
     RESEND HANDLER (UI ONLY)
  -------------------------------------------------- */
  const handleResend = () => {
    setCanResend(false);
    setCountdown(RESEND_WAIT);

    setToast({
      message:
        "If the email exists, a new verification link has been sent.",
      type: "success"
    });
  };

  /* --------------------------------------------------
     UI RENDER
  -------------------------------------------------- */
  const renderContent = () => {
    if (status === "verifying") {
      return (
        <>
          <div className="brand-title">Verifying email…</div>
          <p className="subtitle">Please wait a moment</p>
        </>
      );
    }

    if (status === "success") {
      return (
        <>
          <div className="brand-title">Email verified ✅</div>
          <p className="subtitle">
            Your email has been verified successfully.  
            Redirecting to login…
          </p>
        </>
      );
    }

    if (status === "error") {
      return (
        <>
          <div className="brand-title">Verification failed ❌</div>
          <p className="subtitle">
            This link may have expired or already been used.
          </p>

          <div style={{ marginTop: 16 }}>
            {!canResend ? (
              <p className="small muted">
                Resend available in {countdown}s…
              </p>
            ) : (
              <button className="btn primary" onClick={handleResend}>
                Resend verification email
              </button>
            )}
          </div>
        </>
      );
    }

    // IDLE (default email sent state)
    return (
      <>
        <div className="brand-title">Almost there 🎉</div>

        <p className="subtitle">
          {emailFromState ? (
            <>
              We sent a verification link to{" "}
              <strong>{emailFromState}</strong>
            </>
          ) : (
            "We sent you a verification email"
          )}
        </p>

        <p className="small muted" style={{ marginTop: 10 }}>
          Please check your inbox and spam folder.
        </p>

        <div style={{ marginTop: 20 }}>
          {!canResend ? (
            <p className="small muted">
              Didn’t receive email? Wait {countdown}s…
            </p>
          ) : (
            <button className="btn ghost" onClick={handleResend}>
              Resend verification email
            </button>
          )}
        </div>

        <p className="small muted" style={{ marginTop: 14 }}>
          You must verify your email before logging in.
        </p>
      </>
    );
  };

  return (
    <div className="container-auth">
      <div className="auth-card" role="main">
        <div className="auth-hero">{renderContent()}</div>
      </div>

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
