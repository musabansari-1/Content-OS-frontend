"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthStatusLayout from "./AuthStatusLayout";
import { useAppState } from "../app/AppProvider";

export default function VerifyEmailPage({ initialToken = "" }) {
  const {
    user,
    verificationStatus,
    handleResendVerification,
    handleVerifyEmailToken,
  } = useAppState();
  const router = useRouter();
  const verifyHandlerRef = useRef(handleVerifyEmailToken);
  const [status, setStatus] = useState(initialToken ? "loading" : "idle");
  const [message, setMessage] = useState(
    initialToken
      ? "Verifying your email now."
      : user?.email_verified
        ? "Your email is already verified."
        : "Open the verification link from your inbox to finish setting up your account.",
  );
  const [error, setError] = useState("");
  const attemptedTokenRef = useRef("");

  useEffect(() => {
    verifyHandlerRef.current = handleVerifyEmailToken;
  }, [handleVerifyEmailToken]);

  useEffect(() => {
    if (!initialToken || attemptedTokenRef.current === initialToken) {
      return undefined;
    }

    let cancelled = false;
    attemptedTokenRef.current = initialToken;
    setStatus("loading");
    setError("");

    verifyHandlerRef.current(initialToken)
      .then(() => {
        if (cancelled) {
          return;
        }
        setStatus("success");
        setMessage("Your email has been verified and you are now signed in. Redirecting you back into the app.");
        window.setTimeout(() => {
          if (!cancelled) {
            router.replace("/");
          }
        }, 1200);
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }
        setStatus("error");
        setError(nextError.message || "Verification failed.");
      });

    return () => {
      cancelled = true;
    };
  }, [initialToken, router]);

  const handleResendClick = async () => {
    setError("");
    try {
      await handleResendVerification();
      setStatus("resent");
      setMessage("A fresh verification link has been sent to your inbox.");
    } catch (nextError) {
      setStatus("error");
      setError(nextError.message || "We could not send another verification email.");
    }
  };

  return (
    <AuthStatusLayout
      description="Use the link from your inbox to verify the email address tied to your Content Burst workspace."
      eyebrow="Email verification"
      title="Confirm your email"
    >
      <div className="auth-inner-panel grid gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-warning">
            Status
          </p>
          <p className="mt-3 text-base leading-7 text-ink">{message}</p>
        </div>

        {status === "loading" ? (
          <p className="text-sm text-muted">Verification is in progress. This usually takes a moment.</p>
        ) : null}

        {error ? (
          <div className="ui-notice ui-notice-error">
            {error}
          </div>
        ) : null}

        {!initialToken ? (
          <p className="text-sm leading-6 text-muted">
            If you opened this page without a token, return to your inbox and use the full verification link from the email.
          </p>
        ) : null}

        {user && !user.email_verified ? (
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="ui-btn ui-btn-primary ui-btn-pill ui-btn-md"
              disabled={verificationStatus === "loading"}
              onClick={handleResendClick}
              type="button"
            >
              {verificationStatus === "loading" ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        ) : null}
      </div>
    </AuthStatusLayout>
  );
}
