"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../../lib/appConstants";
import {
  apiFetch,
  buildLinkedInPostText,
  buildGenerationSource,
  buildVideoPayload,
  buildWorkspaceAssets,
  clearAuthState,
  ensurePaddleJs,
  isTemporarilyUnavailableAsset,
  normalizeBlockValue,
  openPaddleCheckout,
  orderTargetAssets,
  parseLineItems,
  parseSampleBlocks,
  persistAuth,
  readWorkspace,
  serializeWorkspace,
  writeWorkspace,
} from "../../lib/appUtils";

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
  const [authStatus, setAuthStatus] = useState("idle");
  const [authError, setAuthError] = useState("");
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
  const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState("idle");
  const [activeAssetId, setActiveAssetId] = useState("");
  const [activeBlockId, setActiveBlockId] = useState("");
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
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
  const [instagramPublishStatus, setInstagramPublishStatus] = useState("idle");
  const [instagramPublishError, setInstagramPublishError] = useState("");
  const [instagramPublishResult, setInstagramPublishResult] = useState(null);
  const [billingSummary, setBillingSummary] = useState(null);
  const [billingPlans, setBillingPlans] = useState([]);
  const [billingStatus, setBillingStatus] = useState("idle");
  const [billingError, setBillingError] = useState("");
  const [billingCheckoutStatus, setBillingCheckoutStatus] = useState("idle");
  const [billingCheckoutError, setBillingCheckoutError] = useState("");

  useEffect(() => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("contentos-auth") ?? "{}");
      const storedToken = storedAuth.token ?? "";
      const storedUser = storedAuth.user ?? null;
      setToken(storedToken);
      setUser(storedUser);
      setBootStatus(storedToken ? "loading" : "ready");
    } catch {
      setBootStatus("ready");
    }
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
          if (current.length) return current;
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
    if (!token) {
      setBootStatus("ready");
      setBillingSummary(null);
      setBillingStatus("idle");
      setBillingError("");
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        const me = await apiFetch("/me", { method: "GET" }, token);
        if (cancelled) return;
        setUser(me);
        persistAuth(token, me);
        const billing = await apiFetch("/billing/me", { method: "GET" }, token);
        if (!cancelled) {
          setBillingSummary(billing);
          setBillingStatus("success");
          setBillingError("");
        }
        try {
          const profile = await apiFetch("/me/voice-profile", { method: "GET" }, token);
          if (!cancelled) setVoiceProfile(profile);
        } catch (error) {
          if (!cancelled && error.status !== 404) setProfileError(error.message);
        }
      } catch (error) {
        if (!cancelled) {
          clearAuthState();
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
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const storedWorkspace = readWorkspace(user);
    if (Array.isArray(storedWorkspace.assets) && storedWorkspace.assets.length) {
      setWorkspaceAssets(storedWorkspace.assets);
      setActiveAssetId(storedWorkspace.assets[0].id);
      setWorkspaceSaveStatus("saved");
      setWorkspaceLoaded(true);
      return;
    }
    setWorkspaceAssets([]);
    setWorkspaceSaveStatus("idle");
    setWorkspaceLoaded(true);
  }, [user]);

  useEffect(() => {
    if (!user || !workspaceLoaded) return undefined;
    setWorkspaceSaveStatus("saving");
    const timeoutId = window.setTimeout(() => {
      writeWorkspace(user, {
        assets: workspaceAssets,
        savedAt: new Date().toISOString(),
      });
      setWorkspaceSaveStatus("saved");
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [user, workspaceAssets, workspaceLoaded]);

  useEffect(() => {
    if (!token || generateStatus !== "loading" || !generateJob?.id) {
      return undefined;
    }

    let cancelled = false;
    let completionTimeoutId;
    let pollTimeoutId;

    async function pollJob() {
      try {
        const job = await apiFetch(
          `/generation-jobs/${generateJob.id}`,
          { method: "GET" },
          token,
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
            const newAssets = buildWorkspaceAssets(generatedResults, source);
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

  const handleAuthChange = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthError("Enter your email and password.");
      return;
    }

    setAuthStatus("loading");
    setAuthError("");
    try {
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
      persistAuth(response.access_token, response.user);
      setToken(response.access_token);
      setUser(response.user);
      setAuthStatus("success");
      setAuthForm({
        email: authForm.email,
        password: "",
        displayName: "",
      });
    } catch (error) {
      setAuthStatus("error");
      setAuthError(error.message);
    }
  };

  const handleLogout = () => {
    clearAuthState();
    setAuthStatus("idle");
    setAuthError("");
    setProfileError("");
    setLinkedinPublishStatus("idle");
    setLinkedinPublishError("");
    setLinkedinPublishResult(null);
    setInstagramPublishStatus("idle");
    setInstagramPublishError("");
    setInstagramPublishResult(null);
    setBillingSummary(null);
    setBillingStatus("idle");
    setBillingError("");
    setBillingCheckoutStatus("idle");
    setBillingCheckoutError("");
    setGenerateError("");
    setWorkspaceAssets([]);
    setVoiceProfile(null);
    setUploadedVideo(null);
    pendingGenerationSourceRef.current = "";
  };

  const handleAssetToggle = (assetType) => {
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
        const maxSize = 100 * 1024 * 1024;
        if (uploadedVideo.size > maxSize) {
          throw new Error(
            `File too large. Maximum size is 100MB. Your file is ${(
              uploadedVideo.size /
              (1024 * 1024)
            ).toFixed(1)}MB.`,
          );
        }

        const formData = new FormData();
        formData.append("file", uploadedVideo);
        const response = await fetch(`${API_BASE_URL}/upload-video`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      const job = await apiFetch(
        "/generation-jobs",
        { method: "POST", body: JSON.stringify(payload) },
        token,
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
      const profile = await apiFetch(
        path,
        { method: "POST", body: JSON.stringify(payload) },
        token,
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
    if (activeAssetId === assetId) {
      setActiveAssetId("");
      setActiveBlockId("");
    }
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
      const response = await apiFetch(
        "/linkedin/publish",
        { method: "POST", body: JSON.stringify({ text }) },
        token,
      );
      setLinkedinPublishResult({ assetId: asset.id, ...response });
      setLinkedinPublishStatus("success");
    } catch (error) {
      setLinkedinPublishStatus("error");
      setLinkedinPublishError(error.message);
      setLinkedinPublishResult({ assetId: asset.id, error: error.message });
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
      const response = await apiFetch(
        "/instagram/publish",
        { method: "POST", body: JSON.stringify({ asset }) },
        token,
      );
      setInstagramPublishResult({ assetId: asset.id, ...response });
      setInstagramPublishStatus("success");
    } catch (error) {
      setInstagramPublishStatus("error");
      setInstagramPublishError(error.message);
      setInstagramPublishResult({ assetId: asset.id, error: error.message });
    }
  };

  const refreshBilling = async () => {
    if (!token) return null;

    setBillingStatus("loading");
    setBillingError("");
    try {
      const [summary, plans] = await Promise.all([
        apiFetch("/billing/me", { method: "GET" }, token),
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
      await ensurePaddleJs();
      const checkoutConfig = await apiFetch(
        "/billing/checkout",
        {
          method: "POST",
          body: JSON.stringify({ plan_code: planCode }),
        },
        token,
      );
      await openPaddleCheckout(checkoutConfig);
      setBillingCheckoutStatus("success");
    } catch (error) {
      setBillingCheckoutStatus("error");
      setBillingCheckoutError(error.message);
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
      setAuthMode,
      authForm,
      authStatus,
      authError,
      bootStatus,
      handleAuthChange,
      handleAuthSubmit,
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
      workspaceSaveStatus,
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
      handlePublishLinkedInAsset,
      handlePublishInstagramAsset,
      handleExportWorkspace,
      setGenerateTranscript,
      setVideoInput,
      setUploadedVideo,
      setGenerateError,
      linkedinPublishStatus,
      linkedinPublishError,
      linkedinPublishResult,
      instagramPublishStatus,
      instagramPublishError,
      instagramPublishResult,
      billingSummary,
      billingPlans,
      billingStatus,
      billingError,
      billingCheckoutStatus,
      billingCheckoutError,
      refreshBilling,
      handleStartBillingCheckout,
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
      billingError,
      billingPlans,
      billingStatus,
      billingSummary,
      linkedinPublishError,
      linkedinPublishResult,
      linkedinPublishStatus,
      instagramPublishError,
      instagramPublishResult,
      instagramPublishStatus,
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
      workspaceSaveStatus,
      youtubeText,
      youtubeTranscriptText,
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
