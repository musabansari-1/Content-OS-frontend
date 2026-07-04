"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL, GOOGLE_CLIENT_ID } from "../../lib/appConstants";
import {
  apiFetch,
  buildGenerationGroup,
  buildLinkedInPostText,
  buildGenerationSource,
  buildScheduledPostPayload,
  buildVideoPayload,
  buildWorkspaceAssets,
  clearAuthState,
  getScheduledPostAssetId,
  isTemporarilyUnavailableAsset,
  normalizeGenerationGroups,
  normalizeBlockValue,
  openHostedCheckout,
  orderTargetAssets,
  parseLineItems,
  parseSampleBlocks,
  persistAuth,
  readPlanner,
  readStoredAuth,
  readWorkspace,
  serializeWorkspace,
  writePlanner,
  writeWorkspace,
} from "../../lib/appUtils";
import { REMOVED_ASSET_TYPES } from "../../lib/appConstants";

const AppStateContext = createContext(null);

export function AppProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [authConsentAccepted, setAuthConsentAccepted] = useState(false);
  const [authStatus, setAuthStatus] = useState("idle");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageKind, setAuthMessageKind] = useState("info");
  const [authActionUrl, setAuthActionUrl] = useState("");
  const [authActionLabel, setAuthActionLabel] = useState("");
  const [googleAuthStatus, setGoogleAuthStatus] = useState("idle");
  const [googleAuthError, setGoogleAuthError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [bootStatus, setBootStatus] = useState("loading");

  const [videoInput, setVideoInput] = useState("");
  const [generateTranscript, setGenerateTranscript] = useState("");
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [generateStatus, setGenerateStatus] = useState("idle");
  const [generateError, setGenerateError] = useState("");
  const [generateJob, setGenerateJob] = useState(null);
  const [lastGeneratedCount, setLastGeneratedCount] = useState(0);
  const [targetAssets, setTargetAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [unavailableMessage, setUnavailableMessage] = useState("");

  const [workspaceAssets, setWorkspaceAssets] = useState([]);
  const [generationGroups, setGenerationGroups] = useState([]);
  const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState("idle");
  const [activeAssetId, setActiveAssetId] = useState("");
  const [activeBlockId, setActiveBlockId] = useState("");
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [campaignPlans, setCampaignPlans] = useState([]);
  const [plannerSaveStatus, setPlannerSaveStatus] = useState("idle");
  const [plannerLoaded, setPlannerLoaded] = useState(false);
  const pendingGenerationSourceRef = useRef("");

  const [profileMode, setProfileMode] = useState("samples");
  const [sampleText, setSampleText] = useState("");
  const [youtubeText, setYoutubeText] = useState("");
  const [youtubeTranscriptText, setYoutubeTranscriptText] = useState("");
  const [profileStatus, setProfileStatus] = useState("idle");
  const [profileError, setProfileError] = useState("");
  const [voiceProfile, setVoiceProfile] = useState(null);
  const [linkedinPublishStatus, setLinkedinPublishStatus] = useState("idle");
  const [linkedinPublishError, setLinkedinPublishError] = useState("");
  const [linkedinPublishResult, setLinkedinPublishResult] = useState(null);
  const [xPublishStatus, setXPublishStatus] = useState("idle");
  const [xPublishError, setXPublishError] = useState("");
  const [xPublishResult, setXPublishResult] = useState(null);
  const [instagramPublishStatus, setInstagramPublishStatus] = useState("idle");
  const [instagramPublishError, setInstagramPublishError] = useState("");
  const [instagramPublishResult, setInstagramPublishResult] = useState(null);
  const [ghostPublishStatus, setGhostPublishStatus] = useState("idle");
  const [ghostPublishError, setGhostPublishError] = useState("");
  const [ghostPublishResult, setGhostPublishResult] = useState(null);
  const [youtubePublishStatus, setYoutubePublishStatus] = useState("idle");
  const [youtubePublishError, setYoutubePublishError] = useState("");
  const [youtubePublishResult, setYoutubePublishResult] = useState(null);
  const [connectedPlatformIds, setConnectedPlatformIds] = useState([]);
  const [integrationStatus, setIntegrationStatus] = useState("idle");
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [scheduledPostsStatus, setScheduledPostsStatus] = useState("idle");
  const [scheduledPostsError, setScheduledPostsError] = useState("");
  const [scheduleStatus, setScheduleStatus] = useState("idle");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleResult, setScheduleResult] = useState(null);
  const [rolloutScheduleStatus, setRolloutScheduleStatus] = useState("idle");
  const [rolloutScheduleError, setRolloutScheduleError] = useState("");
  const [rolloutScheduleResult, setRolloutScheduleResult] = useState(null);
  const [cancelScheduledPostId, setCancelScheduledPostId] = useState(null);
  const [cancelScheduledPostError, setCancelScheduledPostError] = useState("");
  const [billingSummary, setBillingSummary] = useState(null);
  const [billingPlans, setBillingPlans] = useState([]);
  const [billingStatus, setBillingStatus] = useState("idle");
  const [billingError, setBillingError] = useState("");
  const [billingCheckoutStatus, setBillingCheckoutStatus] = useState("idle");
  const [billingCheckoutError, setBillingCheckoutError] = useState("");
  const [billingCancelStatus, setBillingCancelStatus] = useState("idle");
  const [billingCancelError, setBillingCancelError] = useState("");
  const tokenRef = useRef("");
  const refreshPromiseRef = useRef(null);

  const setAuthNotice = ({
    message = "",
    kind = "info",
    actionUrl = "",
    actionLabel = "",
  } = {}) => {
    setAuthMessage(message);
    setAuthMessageKind(kind);
    setAuthActionUrl(actionUrl);
    setAuthActionLabel(actionLabel);
  };

  const syncAuthSession = (accessToken, nextUser) => {
    tokenRef.current = accessToken || "";
    setToken(accessToken || "");
    setUser(nextUser || null);
    if (accessToken && nextUser) {
      persistAuth(accessToken, nextUser);
      return;
    }
    clearAuthState();
  };

  const resetAuthState = () => {
    tokenRef.current = "";
    clearAuthState();
    setToken("");
    setUser(null);
  };

  const handleVerificationRequirement = (response) => {
    if (!response?.email_verification_required) {
      return;
    }
    setAuthNotice({
      message: response.email_verification_sent
        ? "Verify your email to unlock billing, integrations, and publishing. We just sent you a verification link."
        : "Verify your email to unlock billing, integrations, and publishing.",
      kind: "warning",
      actionUrl: response.email_verification_preview_url || "",
      actionLabel: response.email_verification_preview_url
        ? "Open verification link"
        : "",
    });
  };

  const refreshAccessToken = async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      const response = await apiFetch("/auth/refresh", { method: "POST" });
      syncAuthSession(response.access_token, response.user);
      handleVerificationRequirement(response);
      return response;
    })()
      .catch((error) => {
        resetAuthState();
        throw error;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  };

  const authenticatedFetch = async (
    path,
    options = {},
    { accessToken = tokenRef.current, retry = true } = {},
  ) => {
    try {
      return await apiFetch(path, options, accessToken);
    } catch (error) {
      if (retry && error.status === 401) {
        const refreshed = await refreshAccessToken();
        return apiFetch(path, options, refreshed.access_token);
      }
      if (error.status === 403 && /verify your email/i.test(error.message || "")) {
        setAuthNotice({ message: error.message, kind: "warning" });
      }
      throw error;
    }
  };

  const authenticatedRawFetch = async (
    path,
    options = {},
    { accessToken = tokenRef.current, retry = true } = {},
  ) => {
    const headers = { ...(options.headers ?? {}) };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...options,
      headers,
    });
    if (retry && response.status === 401) {
      const refreshed = await refreshAccessToken();
      return authenticatedRawFetch(path, options, {
        accessToken: refreshed.access_token,
        retry: false,
      });
    }
    return response;
  };

  const normalizeStoredRolloutPlans = (storedPlanner) => {
    const rawPlans = Array.isArray(storedPlanner?.rollouts)
      ? storedPlanner.rollouts
      : Array.isArray(storedPlanner?.campaigns)
        ? storedPlanner.campaigns
        : [];

    return rawPlans
      .map((plan) => ({
        id: String(plan?.id || "").trim(),
        name: String(plan?.name || plan?.title || "").trim() || "Untitled rollout",
        generationGroupId: String(plan?.generationGroupId || "").trim(),
        cadence: String(plan?.cadence || "daily").trim() || "daily",
        preferredTime: String(plan?.preferredTime || "10:00").trim() || "10:00",
        startDate: String(plan?.startDate || "").trim(),
        assetIds: Array.isArray(plan?.assetIds)
          ? plan.assetIds.map((assetId) => String(assetId).trim()).filter(Boolean)
          : [],
        createdAt: plan?.createdAt || new Date().toISOString(),
        updatedAt: plan?.updatedAt || plan?.createdAt || new Date().toISOString(),
      }))
      .filter((plan) => plan.id && plan.assetIds.length);
  };

  const refreshIntegrationStatus = async ({ accessToken = token } = {}) => {
    if (!accessToken) {
      setConnectedPlatformIds([]);
      setIntegrationStatus("idle");
      return [];
    }

    setIntegrationStatus("loading");
    try {
      const response = await authenticatedFetch(
        "/status",
        { method: "GET" },
        { accessToken },
      );
      const platforms = Array.isArray(response?.connected_platform_ids)
        ? response.connected_platform_ids.map((platform) => String(platform).trim()).filter(Boolean)
        : [];
      setConnectedPlatformIds(platforms);
      setIntegrationStatus("success");
      return platforms;
    } catch {
      setIntegrationStatus("error");
      return [];
    }
  };

  const ensurePlatformConnected = (platform) => {
    const normalizedPlatform = String(platform || "").trim().toLowerCase();
    if (!normalizedPlatform || integrationStatus !== "success") return;
    if (connectedPlatformIds.includes(normalizedPlatform)) return;

    const platformLabel = {
      linkedin: "LinkedIn",
      x: "X",
      instagram: "Instagram",
      tiktok: "TikTok",
      ghost: "Ghost",
      youtube: "YouTube",
    }[normalizedPlatform] || normalizedPlatform;

    throw new Error(`Connect ${platformLabel} in Integrations before scheduling this asset.`);
  };

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const storedAuth = readStoredAuth();
        const storedToken = storedAuth.token ?? "";
        const storedUser = storedAuth.user ?? null;
        if (storedUser) {
          setUser(storedUser);
        }
        if (storedToken) {
          tokenRef.current = storedToken;
          setToken(storedToken);
          const me = await authenticatedFetch(
            "/me",
            { method: "GET" },
            { accessToken: storedToken },
          );
          if (cancelled) return;
          syncAuthSession(storedToken, me);
        } else {
          const refreshed = await refreshAccessToken();
          if (cancelled) return;
          syncAuthSession(refreshed.access_token, refreshed.user);
        }
      } catch (error) {
        if (!cancelled) {
          resetAuthState();
        }
      } finally {
        if (!cancelled) {
          setBootStatus("ready");
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPublicCatalog() {
      try {
        const response = await apiFetch("/target-assets", { method: "GET" });
        if (cancelled) return;
        const catalog = Array.isArray(response.target_assets)
          ? response.target_assets
          : [];
        const { enabled, ordered } = orderTargetAssets(catalog);
        setTargetAssets(ordered);
        setSelectedAssets((current) => {
          const cleanedCurrent = current.filter(
            (assetType) => !REMOVED_ASSET_TYPES.includes(assetType),
          );
          if (cleanedCurrent.length) return cleanedCurrent;
          return enabled.slice(0, 3).map((asset) => asset.asset_type);
        });
        const plans = await apiFetch("/billing/plans", { method: "GET" });
        if (!cancelled) {
          setBillingPlans(Array.isArray(plans) ? plans : []);
        }
      } catch (error) {
        if (!cancelled) setGenerateError(error.message);
      }
    }

    loadPublicCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (bootStatus === "loading") {
      return undefined;
    }

    if (!token) {
      setBillingSummary(null);
      setBillingStatus("idle");
      setBillingError("");
      setConnectedPlatformIds([]);
      setIntegrationStatus("idle");
      setScheduledPosts([]);
      setScheduledPostsStatus("idle");
      setScheduledPostsError("");
      setScheduleStatus("idle");
      setScheduleError("");
      setScheduleResult(null);
      setRolloutScheduleStatus("idle");
      setRolloutScheduleError("");
      setRolloutScheduleResult(null);
      setCancelScheduledPostId(null);
      setCancelScheduledPostError("");
      setBillingCancelStatus("idle");
      setBillingCancelError("");
      setCampaignPlans([]);
      setPlannerSaveStatus("idle");
      setPlannerLoaded(false);
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        const me = await authenticatedFetch("/me", { method: "GET" });
        if (cancelled) return;
        setUser(me);
        persistAuth(token, me);
        const billing = await authenticatedFetch("/billing/me", { method: "GET" });
        if (!cancelled) {
          setBillingSummary(billing);
          setBillingStatus("success");
          setBillingError("");
        }
        try {
          const profile = await authenticatedFetch("/me/voice-profile", { method: "GET" });
          if (!cancelled) setVoiceProfile(profile);
        } catch (error) {
          if (!cancelled && error.status !== 404) setProfileError(error.message);
        }
        await refreshIntegrationStatus();
        try {
          const scheduled = await authenticatedFetch(
            "/scheduled-posts?status=scheduled&limit=20",
            { method: "GET" },
          );
          if (!cancelled) {
            setScheduledPosts(Array.isArray(scheduled) ? scheduled : []);
            setScheduledPostsStatus("success");
            setScheduledPostsError("");
          }
        } catch (error) {
          if (!cancelled) {
            setScheduledPostsStatus("error");
            setScheduledPostsError(error.message);
          }
        }
      } catch (error) {
        if (!cancelled) {
          if (error.status === 401) {
            resetAuthState();
          }
          setAuthError(error.message);
          setBillingStatus("error");
          setBillingError(error.message);
        }
      } finally {
        if (!cancelled) setBootStatus("ready");
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [bootStatus, token]);

  useEffect(() => {
    if (!user) return;
    const storedWorkspace = readWorkspace(user);
    if (Array.isArray(storedWorkspace.assets) && storedWorkspace.assets.length) {
      const normalizedWorkspace = normalizeGenerationGroups(
        storedWorkspace.assets,
        storedWorkspace.generationGroups || [],
      );
      setWorkspaceAssets(normalizedWorkspace.assets);
      setGenerationGroups(normalizedWorkspace.groups);
      setActiveAssetId(normalizedWorkspace.assets[0].id);
      setWorkspaceSaveStatus("saved");
      setWorkspaceLoaded(true);
      return;
    }
    setWorkspaceAssets([]);
    setGenerationGroups([]);
    setWorkspaceSaveStatus("idle");
    setWorkspaceLoaded(true);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const storedPlanner = readPlanner(user);
    const normalizedPlans = normalizeStoredRolloutPlans(storedPlanner);
    if (normalizedPlans.length) {
      setCampaignPlans(normalizedPlans);
      setPlannerSaveStatus("saved");
      setPlannerLoaded(true);
      return;
    }
    setCampaignPlans([]);
    setPlannerSaveStatus("idle");
    setPlannerLoaded(true);
  }, [user]);

  useEffect(() => {
    if (!user || !workspaceLoaded) return undefined;
    setWorkspaceSaveStatus("saving");
    const timeoutId = window.setTimeout(() => {
      writeWorkspace(user, {
        assets: workspaceAssets,
        generationGroups,
        savedAt: new Date().toISOString(),
      });
      setWorkspaceSaveStatus("saved");
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [generationGroups, user, workspaceAssets, workspaceLoaded]);

  useEffect(() => {
    if (!user || !plannerLoaded) return undefined;
    setPlannerSaveStatus("saving");
    const timeoutId = window.setTimeout(() => {
      writePlanner(user, {
        rollouts: campaignPlans,
        savedAt: new Date().toISOString(),
      });
      setPlannerSaveStatus("saved");
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [campaignPlans, plannerLoaded, user]);

  useEffect(() => {
    if (!token || generateStatus !== "loading" || !generateJob?.id) {
      return undefined;
    }

    let cancelled = false;
    let completionTimeoutId;
    let pollTimeoutId;

    async function pollJob() {
      try {
        const job = await authenticatedFetch(
          `/generation-jobs/${generateJob.id}`,
          { method: "GET" },
        );
        if (cancelled) return;
        setGenerateJob(job);

        if (job.status === "completed") {
          completionTimeoutId = window.setTimeout(() => {
            if (cancelled) return;
            const generatedResults = Array.isArray(job.result?.results)
              ? job.result.results
              : [];
            const source =
              pendingGenerationSourceRef.current ||
              buildGenerationSource({
                videoInput,
                generateTranscript,
                selectedAssets,
              });
            const generationGroupId = `generation-${generateJob.id || Date.now().toString(36)}`;
            const newAssets = buildWorkspaceAssets(generatedResults, source, {
              generationGroupId,
            });
            const nextGenerationGroup = buildGenerationGroup({
              id: generationGroupId,
              sourceLabel: source,
              selectedAssets,
              assetIds: newAssets.map((asset) => asset.id),
              createdAt: new Date().toISOString(),
            });
            setGenerationGroups((current) => [nextGenerationGroup, ...current]);
            setWorkspaceAssets((current) => [...newAssets, ...current]);
            setActiveAssetId(newAssets[0]?.id || "");
            setActiveBlockId("");
            setLastGeneratedCount(newAssets.length);
            setGenerateStatus("success");
            pendingGenerationSourceRef.current = "";
          }, 900);
          return;
        }

        if (job.status === "failed") {
          setGenerateStatus("error");
          setGenerateError(job.error || job.detail || "Generation failed.");
          return;
        }

        pollTimeoutId = window.setTimeout(pollJob, 1200);
      } catch (error) {
        if (!cancelled) {
          setGenerateStatus("error");
          setGenerateError(error.message);
        }
      }
    }

    pollJob();
    return () => {
      cancelled = true;
      if (completionTimeoutId) window.clearTimeout(completionTimeoutId);
      if (pollTimeoutId) window.clearTimeout(pollTimeoutId);
    };
  }, [
    generateJob?.id,
    generateStatus,
    generateTranscript,
    selectedAssets,
    token,
    videoInput,
  ]);

  useEffect(() => {
    if (!workspaceAssets.length) {
      setActiveAssetId("");
      return;
    }
    const exists = workspaceAssets.some((asset) => asset.id === activeAssetId);
    if (!exists) setActiveAssetId(workspaceAssets[0].id);
  }, [workspaceAssets, activeAssetId]);

  const selectedAsset =
    workspaceAssets.find((asset) => asset.id === activeAssetId) ?? null;

  const authConsentMessage =
    "Please agree to the Terms of Service and confirm that you have read the Privacy Policy.";

  const handleSetAuthMode = (mode) => {
    setAuthMode(mode);
    if (authError) setAuthError("");
    if (authMessage) setAuthNotice();
    if (googleAuthError) setGoogleAuthError("");
  };

  const handleAuthConsentChange = (accepted) => {
    setAuthConsentAccepted(Boolean(accepted));
    if (authError) setAuthError("");
    if (googleAuthError) setGoogleAuthError("");
  };

  const requireSignupConsent = (surface = "form") => {
    if (authMode !== "register" || authConsentAccepted) {
      return true;
    }
    setAuthStatus("idle");
    setGoogleAuthStatus("idle");
    setAuthNotice();
    if (surface === "google") {
      setGoogleAuthError(authConsentMessage);
    } else {
      setAuthError(authConsentMessage);
    }
    return false;
  };

  const handleAuthChange = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }));
    if (authError) setAuthError("");
    if (authMessage) setAuthNotice();
    if (googleAuthError) setGoogleAuthError("");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    if (!requireSignupConsent("form")) {
      return;
    }
    if (!authForm.email.trim()) {
      setAuthError("Enter your email address.");
      return;
    }
    if (authMode !== "forgot" && !authForm.password.trim()) {
      setAuthError("Enter your email and password.");
      return;
    }

    setAuthStatus("loading");
    setAuthError("");
    setAuthNotice();
    try {
      if (authMode === "forgot") {
        const response = await apiFetch("/auth/password/forgot", {
          method: "POST",
          body: JSON.stringify({ email: authForm.email.trim() }),
        });
        setAuthStatus("success");
        setAuthNotice({
          message: response.message,
          kind: "success",
          actionUrl: response.password_reset_preview_url || "",
          actionLabel: response.password_reset_preview_url
            ? "Open reset link"
            : "",
        });
        return;
      }

      const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
      const payload = {
        email: authForm.email.trim(),
        password: authForm.password,
      };
      if (authMode === "register") {
        payload.display_name = authForm.displayName.trim();
      }
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (authMode === "register") {
        resetAuthState();
        setAuthNotice({
          message:
            response.message ||
            "Check your email to verify your account. Once you confirm it, we will sign you in automatically.",
          kind: "success",
          actionUrl: response.email_verification_preview_url || "",
          actionLabel: response.email_verification_preview_url
            ? "Open verification link"
            : "",
        });
      } else {
        syncAuthSession(response.access_token, response.user);
        handleVerificationRequirement(response);
      }
      setAuthStatus("success");
      setAuthForm({
        email: authForm.email,
        password: "",
        displayName: "",
      });
      setAuthConsentAccepted(false);
    } catch (error) {
      setAuthStatus("error");
      if (
        authMode === "login" &&
        error.status === 403 &&
        error.payload?.detail?.email_verification_required
      ) {
        setAuthNotice({
          message:
            error.payload.detail.message ||
            "Verify your email before logging in. We sent you a fresh verification link.",
          kind: "warning",
          actionUrl: error.payload.detail.email_verification_preview_url || "",
          actionLabel: error.payload.detail.email_verification_preview_url
            ? "Open verification link"
            : "",
        });
      }
      setAuthError(error.message);
    }
  };

  const handleGoogleSignIn = async (idToken) => {
    if (!requireSignupConsent("google")) {
      return;
    }
    if (!idToken) {
      setGoogleAuthError("Google sign-in did not return a valid credential.");
      return;
    }

    setGoogleAuthStatus("loading");
    setGoogleAuthError("");
    setAuthNotice();
    try {
      const response = await apiFetch("/auth/google", {
        method: "POST",
        body: JSON.stringify({ id_token: idToken }),
      });
      syncAuthSession(response.access_token, response.user);
      handleVerificationRequirement(response);
      setGoogleAuthStatus("success");
    } catch (error) {
      setGoogleAuthStatus("error");
      setGoogleAuthError(error.message);
    }
  };

  const handleResendVerification = async () => {
    if (!tokenRef.current) return;
    setVerificationStatus("loading");
    try {
      const response = await authenticatedFetch("/auth/verify-email/request", {
        method: "POST",
      });
      setVerificationStatus("success");
      setAuthNotice({
        message: response.email_verification_required
          ? "We sent another verification email."
          : "Your email is already verified.",
        kind: response.email_verification_required ? "success" : "info",
        actionUrl: response.email_verification_preview_url || "",
        actionLabel: response.email_verification_preview_url
          ? "Open verification link"
          : "",
      });
    } catch (error) {
      setVerificationStatus("error");
      setAuthNotice({ message: error.message, kind: "error" });
      throw error;
    }
  };

  const handleVerifyEmailToken = async (tokenValue) => {
    const response = await apiFetch("/auth/verify-email/confirm", {
      method: "POST",
      body: JSON.stringify({ token: tokenValue }),
    });
    syncAuthSession(response.access_token, response.user);
    setAuthNotice({
      message: "Email verified. You are now signed in and ready to continue.",
      kind: "success",
    });
    return response;
  };

  const handlePasswordReset = async ({ token: resetToken, password }) => {
    const response = await apiFetch("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ token: resetToken, password }),
    });
    resetAuthState();
    setAuthMode("login");
    setAuthForm({
      email: response.email || authForm.email,
      password: "",
      displayName: "",
    });
    setAuthNotice({
      message: "Password updated. Sign in with your new password.",
      kind: "success",
    });
    return response;
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {}
    resetAuthState();
    setAuthStatus("idle");
    setAuthError("");
    setAuthNotice();
    setGoogleAuthStatus("idle");
    setGoogleAuthError("");
    setVerificationStatus("idle");
    setProfileError("");
    setLinkedinPublishStatus("idle");
    setLinkedinPublishError("");
    setLinkedinPublishResult(null);
    setInstagramPublishStatus("idle");
    setInstagramPublishError("");
    setInstagramPublishResult(null);
    setYoutubePublishStatus("idle");
    setYoutubePublishError("");
    setYoutubePublishResult(null);
    setScheduledPosts([]);
    setScheduledPostsStatus("idle");
    setScheduledPostsError("");
    setScheduleStatus("idle");
    setScheduleError("");
    setScheduleResult(null);
    setRolloutScheduleStatus("idle");
    setRolloutScheduleError("");
    setRolloutScheduleResult(null);
    setCancelScheduledPostId(null);
    setCancelScheduledPostError("");
    setBillingSummary(null);
    setBillingStatus("idle");
    setBillingError("");
    setBillingCheckoutStatus("idle");
    setBillingCheckoutError("");
    setBillingCancelStatus("idle");
    setBillingCancelError("");
    setGenerateError("");
    setWorkspaceAssets([]);
    setGenerationGroups([]);
    setCampaignPlans([]);
    setPlannerSaveStatus("idle");
    setPlannerLoaded(false);
    setVoiceProfile(null);
    setUploadedVideo(null);
    pendingGenerationSourceRef.current = "";
  };

  const handleAssetToggle = (assetType) => {
    if (REMOVED_ASSET_TYPES.includes(assetType)) {
      setUnavailableMessage("That asset type is no longer available.");
      return;
    }

    if (isTemporarilyUnavailableAsset(assetType)) {
      const label =
        targetAssets.find((asset) => asset.asset_type === assetType)?.label ??
        assetType.replaceAll("_", " ");
      setUnavailableMessage(
        `${label} is temporarily unavailable right now. We'll re-enable it as soon as it's ready.`,
      );
      return;
    }

    setSelectedAssets((current) => {
      if (current.includes(assetType)) {
        return current.filter((item) => item !== assetType);
      }
      return [...current, assetType];
    });
    setUnavailableMessage("");
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!videoInput.trim() && !generateTranscript.trim() && !uploadedVideo) {
      setGenerateError(
        "Paste a YouTube URL/video ID, upload a video, or paste a transcript to generate content.",
      );
      return;
    }
    if (!selectedAssets.length) {
      setGenerateError("Choose at least one asset type.");
      return;
    }

    setGenerateStatus("loading");
    setGenerateError("");
    setGenerateJob(null);
    setLastGeneratedCount(0);

    try {
      let transcriptToUse = generateTranscript.trim();
      let uploadedVideoMetadata = null;

      if (uploadedVideo) {
        const maxSize = 1.0 * 1024 * 1024 * 1024;
        if (uploadedVideo.size > maxSize) {
          throw new Error(
            `File too large. Maximum size is 1.0GB. Your file is ${(
              uploadedVideo.size /
              (1024 * 1024 * 1024)
            ).toFixed(2)}GB.`,
          );
        }

        const formData = new FormData();
        formData.append("file", uploadedVideo);
        const response = await authenticatedRawFetch("/upload-video", {
          method: "POST",
          body: formData,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || "Video upload failed.");
        }

        transcriptToUse = data.transcript || "";
        uploadedVideoMetadata = {
          uploaded_video_filename: uploadedVideo.name,
          uploaded_video_content_type: uploadedVideo.type || "",
          uploaded_video_path: data.stored_video_path || "",
          uploaded_video_url: data.stored_video_url || "",
          transcription_bundle: data.transcription_bundle || {},
        };
        pendingGenerationSourceRef.current = `Generated from uploaded video ${uploadedVideo.name} for ${selectedAssets.length} selected asset types.`;
      } else {
        pendingGenerationSourceRef.current = buildGenerationSource({
          videoInput,
          generateTranscript,
          selectedAssets,
        });
      }

      const payload = {
        ...buildVideoPayload(videoInput),
        transcript: transcriptToUse,
        target_assets: selectedAssets,
        ...(uploadedVideoMetadata || {}),
      };
        const job = await authenticatedFetch(
          "/generation-jobs",
          { method: "POST", body: JSON.stringify(payload) },
        );
      setGenerateJob(job);
    } catch (error) {
      setGenerateStatus("error");
      setGenerateError(error.message);
    }
  };

  const saveVoiceProfile = async (path, payload) => {
    setProfileStatus("loading");
    setProfileError("");
    try {
      const profile = await authenticatedFetch(
        path,
        { method: "POST", body: JSON.stringify(payload) },
      );
      setVoiceProfile(profile);
      setProfileStatus("success");
    } catch (error) {
      setProfileStatus("error");
      setProfileError(error.message);
    }
  };

  const handleSaveSamplesProfile = async (event) => {
    event.preventDefault();
    const samples = parseSampleBlocks(sampleText);
    if (!samples.length) {
      setProfileError("Add at least one writing sample or transcript block.");
      return;
    }
    await saveVoiceProfile("/me/voice-profile", { samples });
  };

  const handleSaveYoutubeProfile = async (event) => {
    event.preventDefault();
    const youtubeUrls = parseLineItems(youtubeText);
    const transcripts = parseSampleBlocks(youtubeTranscriptText);
    if (!youtubeUrls.length && !transcripts.length) {
      setProfileError("Paste at least one YouTube URL, video ID, or transcript.");
      return;
    }
    await saveVoiceProfile("/me/voice-profile/from-youtube", {
      youtube_urls: youtubeUrls.filter((item) => item.startsWith("http")),
      youtube_video_ids: youtubeUrls.filter((item) => !item.startsWith("http")),
      transcripts,
    });
  };

  const handleBlockChange = (assetId, blockId, value) => {
    setWorkspaceAssets((current) =>
      current.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              updatedAt: new Date().toISOString(),
              blocks: asset.blocks.map((block) =>
                block.id === blockId
                  ? {
                      ...block,
                      value,
                      isDirty:
                        normalizeBlockValue(value) !==
                        normalizeBlockValue(block.originalValue),
                    }
                  : block,
              ),
            }
          : asset,
      ),
    );
  };

  const handleAssetStatusChange = (assetId, newStatus) => {
    setWorkspaceAssets((current) =>
      current.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : asset,
      ),
    );
  };

  const handleRevertBlock = (assetId, blockId) => {
    setWorkspaceAssets((current) =>
      current.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              updatedAt: new Date().toISOString(),
              blocks: asset.blocks.map((block) =>
                block.id === blockId
                  ? { ...block, value: block.originalValue, isDirty: false }
                  : block,
              ),
            }
          : asset,
      ),
    );
  };

  const handleDeleteAsset = (assetId) => {
    setWorkspaceAssets((current) =>
      current.filter((asset) => asset.id !== assetId),
    );
    setGenerationGroups((current) =>
      current
        .map((group) => ({
          ...group,
          assetIds: group.assetIds.filter((id) => id !== assetId),
          updatedAt: new Date().toISOString(),
        }))
        .filter((group) => group.assetIds.length),
    );
    setCampaignPlans((current) =>
      current.map((campaign) => ({
        ...campaign,
        assetIds: campaign.assetIds.filter((id) => id !== assetId),
        updatedAt: new Date().toISOString(),
      })),
    );
    if (activeAssetId === assetId) {
      setActiveAssetId("");
      setActiveBlockId("");
    }
  };

  const handleCreateCampaign = (input) => {
    const name = String(input?.name || "").trim();
    if (!name) {
      throw new Error("Campaign name is required.");
    }

    const now = new Date().toISOString();
    const nextCampaign = {
      id: `campaign-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      objective: String(input?.objective || "").trim(),
      focusPlatform: String(input?.focusPlatform || "multi").trim() || "multi",
      weeklyGoal: Math.max(1, Math.min(14, Number(input?.weeklyGoal) || 3)),
      startDate: String(input?.startDate || "").trim(),
      endDate: String(input?.endDate || "").trim(),
      notes: String(input?.notes || "").trim(),
      assetIds: Array.isArray(input?.assetIds)
        ? input.assetIds.map((assetId) => String(assetId).trim()).filter(Boolean)
        : [],
      createdAt: now,
      updatedAt: now,
    };

    setCampaignPlans((current) => [nextCampaign, ...current]);
    return nextCampaign;
  };

  const handleDeleteCampaign = (campaignId) => {
    setCampaignPlans((current) =>
      current.filter((campaign) => campaign.id !== campaignId),
    );
  };

  const handleToggleCampaignAsset = (campaignId, assetId) => {
    const normalizedAssetId = String(assetId || "").trim();
    if (!normalizedAssetId) return;

    setCampaignPlans((current) =>
      current.map((campaign) => {
        if (campaign.id !== campaignId) return campaign;
        const exists = campaign.assetIds.includes(normalizedAssetId);
        return {
          ...campaign,
          assetIds: exists
            ? campaign.assetIds.filter((id) => id !== normalizedAssetId)
            : [...campaign.assetIds, normalizedAssetId],
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const handlePublishLinkedInAsset = async (asset) => {
    if (!asset) {
      setLinkedinPublishError("Select a LinkedIn asset first.");
      return;
    }
    if (!asset.assetType || !asset.assetType.toLowerCase().includes("linkedin")) {
      setLinkedinPublishError("This asset is not a LinkedIn post.");
      return;
    }

    const text = buildLinkedInPostText(asset);
    if (!text.trim()) {
      setLinkedinPublishError("The selected asset does not have any content to publish.");
      return;
    }

    setLinkedinPublishStatus("loading");
    setLinkedinPublishError("");
    setLinkedinPublishResult(null);

    try {
      const response = await authenticatedFetch("/linkedin/publish", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setLinkedinPublishResult({ assetId: asset.id, ...response });
      setLinkedinPublishStatus("success");
    } catch (error) {
      setLinkedinPublishStatus("error");
      setLinkedinPublishError(error.message);
      setLinkedinPublishResult({ assetId: asset.id, error: error.message });
    }
  };

  const handlePublishXAsset = async (asset) => {
    if (!asset) {
      setXPublishError("Select an X asset first.");
      return;
    }

    const assetType = String(asset.assetType || "").toLowerCase();
    if (!["x_post", "twitter_thread"].includes(assetType)) {
      setXPublishError("Only X posts and X threads can be published to X.");
      return;
    }

    setXPublishStatus("loading");
    setXPublishError("");
    setXPublishResult(null);

    try {
      const response = await authenticatedFetch("/x/publish", {
        method: "POST",
        body: JSON.stringify({ asset }),
      });
      setXPublishResult({ assetId: asset.id, ...response });
      setXPublishStatus("success");
    } catch (error) {
      setXPublishStatus("error");
      setXPublishError(error.message);
      setXPublishResult({ assetId: asset.id, error: error.message });
    }
  };

  const handlePublishInstagramAsset = async (asset) => {
    if (!asset) {
      setInstagramPublishError("Select an Instagram asset first.");
      return;
    }
    const assetType = String(asset.assetType || "").toLowerCase();
    if (!assetType.includes("instagram")) {
      setInstagramPublishError("This asset is not an Instagram reel or carousel.");
      return;
    }

    setInstagramPublishStatus("loading");
    setInstagramPublishError("");
    setInstagramPublishResult(null);

    try {
      const response = await authenticatedFetch("/instagram/publish", {
        method: "POST",
        body: JSON.stringify({ asset }),
      });
      setInstagramPublishResult({ assetId: asset.id, ...response });
      setInstagramPublishStatus("success");
    } catch (error) {
      setInstagramPublishStatus("error");
      setInstagramPublishError(error.message);
      setInstagramPublishResult({ assetId: asset.id, error: error.message });
    }
  };

  const handlePublishGhostAsset = async (asset) => {
    if (!asset) {
      setGhostPublishError("Select a Ghost-ready asset first.");
      return;
    }

    const assetType = String(asset.assetType || "").toLowerCase();
    if (!["blog_post", "newsletter"].includes(assetType)) {
      setGhostPublishError("Only blog posts and newsletters can be published to Ghost.");
      return;
    }

    setGhostPublishStatus("loading");
    setGhostPublishError("");
    setGhostPublishResult(null);

    try {
      const response = await authenticatedFetch("/ghost/publish", {
        method: "POST",
        body: JSON.stringify({ asset }),
      });
      setGhostPublishResult({ assetId: asset.id, ...response });
      setGhostPublishStatus("success");
    } catch (error) {
      setGhostPublishStatus("error");
      setGhostPublishError(error.message);
      setGhostPublishResult({ assetId: asset.id, error: error.message });
    }
  };

  const handlePublishYouTubeAsset = async (asset) => {
    if (!asset) {
      setYoutubePublishError("Select a YouTube Shorts asset first.");
      return;
    }

    const assetType = String(asset.assetType || "").toLowerCase();
    if (assetType !== "youtube_shorts") {
      setYoutubePublishError("Only YouTube Shorts assets can be published to YouTube.");
      return;
    }

    setYoutubePublishStatus("loading");
    setYoutubePublishError("");
    setYoutubePublishResult(null);

    try {
      const response = await authenticatedFetch("/youtube/publish", {
        method: "POST",
        body: JSON.stringify({ asset }),
      });
      setYoutubePublishResult({ assetId: asset.id, ...response });
      setYoutubePublishStatus("success");
    } catch (error) {
      setYoutubePublishStatus("error");
      setYoutubePublishError(error.message);
      setYoutubePublishResult({ assetId: asset.id, error: error.message });
    }
  };

  const refreshScheduledPosts = async ({ silent = false } = {}) => {
    if (!token) {
      setScheduledPosts([]);
      setScheduledPostsStatus("idle");
      setScheduledPostsError("");
      return [];
    }

    if (!silent) {
      setScheduledPostsStatus("loading");
      setScheduledPostsError("");
    }

    try {
      const response = await authenticatedFetch(
        "/scheduled-posts?status=scheduled&limit=20",
        { method: "GET" },
      );
      const nextPosts = Array.isArray(response) ? response : [];
      setScheduledPosts(nextPosts);
      setScheduledPostsStatus("success");
      setScheduledPostsError("");
      return nextPosts;
    } catch (error) {
      setScheduledPostsStatus("error");
      setScheduledPostsError(error.message);
      throw error;
    }
  };

  const scheduleAssetRequest = async (asset, scheduledForValue) => {
    if (!token) {
      throw new Error("Log in before scheduling posts.");
    }

    if (!asset) {
      throw new Error("Select an asset to schedule first.");
    }

    const existingScheduledPost = scheduledPosts.find(
      (post) => getScheduledPostAssetId(post) === String(asset.id || "").trim(),
    );
    if (existingScheduledPost) {
      throw new Error("This asset is already scheduled.");
    }

    const scheduleDate = new Date(scheduledForValue);
    if (Number.isNaN(scheduleDate.getTime())) {
      throw new Error("Choose a valid date and time.");
    }

    const { platform, payload } = buildScheduledPostPayload(asset);
    ensurePlatformConnected(platform);
    return authenticatedFetch(
      "/scheduled-posts",
      {
        method: "POST",
        body: JSON.stringify({
          platform,
          payload,
          scheduled_for: scheduleDate.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      },
    );
  };

  const handleScheduleAsset = async (asset, scheduledForValue) => {
    setScheduleStatus("loading");
    setScheduleError("");
    setScheduleResult({ assetId: asset.id });

    try {
      const response = await scheduleAssetRequest(asset, scheduledForValue);
      setScheduleResult({ assetId: asset.id, ...response });
      setScheduleStatus("success");
      await refreshScheduledPosts({ silent: true });
    } catch (error) {
      setScheduleStatus("error");
      setScheduleError(error.message);
      setScheduleResult({ assetId: asset.id, error: error.message });
    }
  };

  const saveRolloutPlan = (input) => {
    const name = String(input?.name || "").trim();
    const generationGroupId = String(input?.generationGroupId || "").trim();
    const assetIds = Array.isArray(input?.assetIds)
      ? input.assetIds.map((assetId) => String(assetId).trim()).filter(Boolean)
      : [];
    if (!name) {
      throw new Error("Add a rollout name.");
    }
    if (!generationGroupId) {
      throw new Error("Choose a generation batch first.");
    }
    if (!assetIds.length) {
      throw new Error("Select at least one asset for this rollout.");
    }

    const now = new Date().toISOString();
    const nextPlan = {
      id: String(input?.id || "").trim() || `rollout-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      generationGroupId,
      cadence: String(input?.cadence || "daily").trim() || "daily",
      preferredTime: String(input?.preferredTime || "10:00").trim() || "10:00",
      startDate: String(input?.startDate || "").trim(),
      assetIds,
      createdAt: input?.createdAt || now,
      updatedAt: now,
    };

    setCampaignPlans((current) => {
      const existingIndex = current.findIndex((plan) => plan.id === nextPlan.id);
      if (existingIndex === -1) return [nextPlan, ...current];
      const next = [...current];
      next[existingIndex] = { ...current[existingIndex], ...nextPlan };
      return next;
    });

    return nextPlan;
  };

  const handleCreateRolloutPlan = (input) => saveRolloutPlan(input);

  const handleDeleteRolloutPlan = (rolloutId) => {
    setCampaignPlans((current) =>
      current.filter((plan) => plan.id !== rolloutId),
    );
  };

  const handleScheduleRolloutPlan = async ({ rollout, entries }) => {
    const rolloutEntries = Array.isArray(entries) ? entries : [];
    if (!rolloutEntries.length) {
      setRolloutScheduleStatus("error");
      setRolloutScheduleError("There are no schedulable assets in this rollout.");
      setRolloutScheduleResult(null);
      return null;
    }

    let savedRollout;
    try {
      savedRollout = saveRolloutPlan(rollout);
    } catch (error) {
      setRolloutScheduleStatus("error");
      setRolloutScheduleError(error.message);
      setRolloutScheduleResult(null);
      return null;
    }

    setRolloutScheduleStatus("loading");
    setRolloutScheduleError("");
    setRolloutScheduleResult(null);

    const successes = [];
    const failures = [];

    for (const entry of rolloutEntries) {
      try {
        const response = await scheduleAssetRequest(entry.asset, entry.scheduledFor);
        successes.push({
          assetId: entry.asset.id,
          assetTitle: entry.asset.title,
          scheduledFor: entry.scheduledFor,
          response,
        });
      } catch (error) {
        failures.push({
          assetId: entry.asset.id,
          assetTitle: entry.asset.title,
          scheduledFor: entry.scheduledFor,
          error: error.message,
        });
      }
    }

    await refreshScheduledPosts({ silent: true });

    const result = {
      rolloutId: savedRollout.id,
      successes,
      failures,
    };

    setRolloutScheduleResult(result);
    if (successes.length && failures.length) {
      setRolloutScheduleStatus("partial");
      setRolloutScheduleError(`${failures.length} asset${failures.length === 1 ? "" : "s"} could not be scheduled.`);
    } else if (successes.length) {
      setRolloutScheduleStatus("success");
    } else {
      setRolloutScheduleStatus("error");
      setRolloutScheduleError(failures[0]?.error || "Scheduling failed.");
    }

    return result;
  };

  const handleCancelScheduledPost = async (postId) => {
    if (!token || !postId) return;

    setCancelScheduledPostId(postId);
    setCancelScheduledPostError("");
    try {
      await authenticatedFetch("/scheduled-posts/" + postId + "/cancel", {
        method: "POST",
      });
      setScheduledPosts((current) => current.filter((post) => post.id !== postId));
    } catch (error) {
      setCancelScheduledPostError(error.message);
    } finally {
      setCancelScheduledPostId(null);
    }
  };

  const refreshBilling = async () => {
    if (!token) return null;

    setBillingStatus("loading");
    setBillingError("");
    try {
      const [summary, plans] = await Promise.all([
        authenticatedFetch("/billing/me", { method: "GET" }),
        billingPlans.length ? Promise.resolve(billingPlans) : apiFetch("/billing/plans", { method: "GET" }),
      ]);
      setBillingSummary(summary);
      setBillingPlans(Array.isArray(plans) ? plans : []);
      setBillingStatus("success");
      return summary;
    } catch (error) {
      setBillingStatus("error");
      setBillingError(error.message);
      throw error;
    }
  };

  const handleStartBillingCheckout = async (planCode) => {
    if (!token) {
      setBillingCheckoutError("Log in before starting checkout.");
      return;
    }

    setBillingCheckoutStatus("loading");
    setBillingCheckoutError("");

    try {
      const checkoutConfig = await authenticatedFetch(
        "/billing/checkout",
        {
          method: "POST",
          body: JSON.stringify({ plan_code: planCode }),
        },
      );
      await openHostedCheckout(checkoutConfig);
      setBillingCheckoutStatus("success");
    } catch (error) {
      setBillingCheckoutStatus("error");
      setBillingCheckoutError(error.message);
      throw error;
    }
  };

  const handleCancelSubscription = async () => {
    if (!token) {
      setBillingCancelError("Log in before changing your subscription.");
      return;
    }

    setBillingCancelStatus("loading");
    setBillingCancelError("");

    try {
      const summary = await authenticatedFetch("/billing/cancel", {
        method: "POST",
      });
      setBillingSummary(summary);
      setBillingStatus("success");
      setBillingError("");
      setBillingCancelStatus("success");
    } catch (error) {
      setBillingCancelStatus("error");
      setBillingCancelError(error.message);
      throw error;
    }
  };

  const handleExportWorkspace = async () => {
    await navigator.clipboard.writeText(serializeWorkspace(workspaceAssets));
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authMode,
      setAuthMode: handleSetAuthMode,
      authForm,
      authConsentAccepted,
      authStatus,
      authError,
      authMessage,
      authMessageKind,
      authActionUrl,
      authActionLabel,
      googleAuthStatus,
      googleAuthError,
      verificationStatus,
      bootStatus,
      handleAuthConsentChange,
      handleAuthChange,
      handleAuthSubmit,
      handleGoogleSignIn,
      requireSignupConsent,
      handleResendVerification,
      handleVerifyEmailToken,
      handlePasswordReset,
      handleLogout,
      profileMode,
      setProfileMode,
      sampleText,
      setSampleText,
      youtubeText,
      youtubeTranscriptText,
      profileStatus,
      profileError,
      voiceProfile,
      setYoutubeText,
      setYoutubeTranscriptText,
      handleSaveSamplesProfile,
      handleSaveYoutubeProfile,
      videoInput,
      generateTranscript,
      uploadedVideo,
      generateStatus,
      generateError,
      generateJob,
      targetAssets,
      selectedAssets,
      unavailableMessage,
      workspaceAssets,
      generationGroups,
      workspaceSaveStatus,
      rolloutPlans: campaignPlans,
      plannerSaveStatus,
      activeAssetId,
      activeBlockId,
      selectedAsset,
      lastGeneratedCount,
      setActiveAssetId,
      setActiveBlockId,
      handleAssetToggle,
      handleGenerate,
      handleBlockChange,
      handleAssetStatusChange,
      handleRevertBlock,
      handleDeleteAsset,
      handleCreateRolloutPlan,
      handleDeleteRolloutPlan,
      handleScheduleRolloutPlan,
      handleCreateCampaign,
      handleDeleteCampaign,
      handleToggleCampaignAsset,
      handlePublishLinkedInAsset,
      handlePublishXAsset,
      handlePublishInstagramAsset,
      handlePublishGhostAsset,
      handlePublishYouTubeAsset,
      refreshIntegrationStatus,
      refreshScheduledPosts,
      handleScheduleAsset,
      handleCancelScheduledPost,
      handleExportWorkspace,
      setGenerateTranscript,
      setVideoInput,
      setUploadedVideo,
      setGenerateError,
      linkedinPublishStatus,
      linkedinPublishError,
      linkedinPublishResult,
      xPublishStatus,
      xPublishError,
      xPublishResult,
      instagramPublishStatus,
      instagramPublishError,
      instagramPublishResult,
      ghostPublishStatus,
      ghostPublishError,
      ghostPublishResult,
      youtubePublishStatus,
      youtubePublishError,
      youtubePublishResult,
      connectedPlatformIds,
      integrationStatus,
      scheduledPosts,
      scheduledPostsStatus,
      scheduledPostsError,
      scheduleStatus,
      scheduleError,
      scheduleResult,
      rolloutScheduleStatus,
      rolloutScheduleError,
      rolloutScheduleResult,
      cancelScheduledPostId,
      cancelScheduledPostError,
      billingSummary,
      billingPlans,
      billingStatus,
      billingError,
      billingCheckoutStatus,
      billingCheckoutError,
      billingCancelStatus,
      billingCancelError,
      refreshBilling,
      handleStartBillingCheckout,
      handleCancelSubscription,
      setYoutubeProfileInput(value) {
        setYoutubeText(value);
        if (value.trim()) setYoutubeTranscriptText("");
      },
      setYoutubeProfileTranscript(value) {
        setYoutubeTranscriptText(value);
        if (value.trim()) setYoutubeText("");
      },
      setGenerateVideoInput(value) {
        setVideoInput(value);
        if (value.trim()) {
          setGenerateTranscript("");
          setUploadedVideo(null);
        }
      },
      setGenerateTranscriptInput(value) {
        setGenerateTranscript(value);
        if (value.trim()) {
          setVideoInput("");
          setUploadedVideo(null);
        }
      },
      setGenerateUploadedVideo(file) {
        setUploadedVideo(file || null);
        if (file) {
          setVideoInput("");
          setGenerateTranscript("");
        }
      },
    }),
    [
      activeAssetId,
      activeBlockId,
      authError,
      authForm,
      authActionLabel,
      authActionUrl,
      authConsentAccepted,
      authMessage,
      authMessageKind,
      authMode,
      authStatus,
      bootStatus,
      generateError,
      generateJob,
      generateStatus,
      generateTranscript,
      lastGeneratedCount,
      billingCheckoutError,
      billingCheckoutStatus,
      billingCancelError,
      billingCancelStatus,
      billingError,
      billingPlans,
      billingStatus,
      billingSummary,
      googleAuthError,
      googleAuthStatus,
      linkedinPublishError,
      linkedinPublishResult,
      linkedinPublishStatus,
      xPublishError,
      xPublishResult,
      xPublishStatus,
      instagramPublishError,
      instagramPublishResult,
      instagramPublishStatus,
      ghostPublishError,
      ghostPublishResult,
      ghostPublishStatus,
      youtubePublishError,
      youtubePublishResult,
      youtubePublishStatus,
      connectedPlatformIds,
      integrationStatus,
      scheduledPosts,
      scheduledPostsError,
      scheduledPostsStatus,
      scheduleError,
      scheduleResult,
      scheduleStatus,
      cancelScheduledPostId,
      cancelScheduledPostError,
      profileError,
      profileMode,
      profileStatus,
      sampleText,
      selectedAsset,
      selectedAssets,
      targetAssets,
      token,
      unavailableMessage,
      uploadedVideo,
      user,
      videoInput,
      voiceProfile,
      workspaceAssets,
      generationGroups,
      workspaceSaveStatus,
      campaignPlans,
      plannerSaveStatus,
      refreshIntegrationStatus,
      rolloutScheduleError,
      rolloutScheduleResult,
      rolloutScheduleStatus,
      youtubeText,
      youtubeTranscriptText,
      verificationStatus,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider.");
  }
  return context;
}
