"use client";

import { useState } from "react";
import AuthStatusLayout from "./AuthStatusLayout";
import { useAppState } from "../app/AppProvider";

export default function ResetPasswordPage({ initialToken = "" }) {
  const { handlePasswordReset } = useAppState();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!initialToken) {
      setError("This reset link is missing its token. Request a fresh password reset email.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      await handlePasswordReset({ token: initialToken, password });
      setStatus("success");
      setSuccessMessage("Password updated. You can now sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
    } catch (nextError) {
      setStatus("error");
      setError(nextError.message || "Password reset failed.");
    }
  };

  return (
    <AuthStatusLayout
      description="Choose a new password for the email address linked to your Content Burst account."
      eyebrow="Password reset"
      title="Set a new password"
    >
      <div className="auth-inner-panel p-5">
        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>New password</span>
            <input
              className="ui-input"
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              type="password"
              value={password}
            />
          </label>

          <label className="field">
            <span>Confirm new password</span>
            <input
              className="ui-input"
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your new password"
              type="password"
              value={confirmPassword}
            />
          </label>

          <button
            className="ui-btn ui-btn-primary ui-btn-md ui-btn-pill"
            disabled={status === "loading"}
            type="submit"
          >
            {status === "loading" ? "Updating password..." : "Update password"}
          </button>
        </form>

        {!initialToken ? (
          <div className="mt-4 rounded-2xl border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fecaca]">
            This page needs a valid reset link. Request a new password reset email from the login screen.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#f87171]/30 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fecaca]">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-2xl border border-[#34d399]/30 bg-[#34d399]/10 px-4 py-3 text-sm text-[#b8f5db]">
            {successMessage}
          </div>
        ) : null}
      </div>
    </AuthStatusLayout>
  );
}
