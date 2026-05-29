"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import IntegrationsPage from "./IntegrationsPage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const AUTH_STORAGE_KEY = "contentos-auth";
const WORKSPACE_STORAGE_PREFIX = "contentos-workspace-v2";
const DEFAULT_ROUTE = "home";

const ASSET_STATUS_DRAFT = "draft";
const ASSET_STATUS_READY = "ready";
const ASSET_STATUS_PUBLISHED = "published";

const STATUS_CYCLE = [ASSET_STATUS_DRAFT, ASSET_STATUS_READY, ASSET_STATUS_PUBLISHED];

const STATUS_META = {
  [ASSET_STATUS_DRAFT]: {
    label: "Draft",
    icon: "○",
    next: ASSET_STATUS_READY,
    nextLabel: "Mark as Ready",
    color: "var(--status-draft-text)",
    bg: "var(--status-draft-bg)",
    border: "var(--status-draft-border)",
    dot: "var(--status-draft-dot)",
  },
  [ASSET_STATUS_READY]: {
    label: "Ready",
    icon: "◐",
    next: ASSET_STATUS_PUBLISHED,
    nextLabel: "Mark as Published",
    color: "var(--status-ready-text)",
    bg: "var(--status-ready-bg)",
    border: "var(--status-ready-border)",
    dot: "var(--status-ready-dot)",
  },
  [ASSET_STATUS_PUBLISHED]: {
    label: "Published",
    icon: "●",
    next: ASSET_STATUS_DRAFT,
    nextLabel: "Move back to Draft",
    color: "var(--status-published-text)",
    bg: "var(--status-published-bg)",
    border: "var(--status-published-border)",
    dot: "var(--status-published-dot)",
  },
};

function App() {
  const router = useRouter();
  const pathname = usePathname();
  const [route, setRoute] = useState(() => getRouteFromPathname(pathname));
  const [token, setToken] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}").token ?? "";
    } catch {
      return "";
    }
  });
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}").user ?? null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [authStatus, setAuthStatus] = useState("idle");
  const [authError, setAuthError] = useState("");
  const [bootStatus, setBootStatus] = useState(token ? "loading" : "ready");

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
  const navigateTo = (nextRoute) => {
    setRoute(nextRoute);
    if (nextRoute === "workspace") router.push("/workspace");
    else if (nextRoute === "integrations") router.push("/integrations");
    else router.push("/");
  };

  useEffect(() => {
    setRoute(getRouteFromPathname(pathname));
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function loadTargetAssets() {
      try {
        const response = await apiFetch("/target-assets", { method: "GET" });
        if (cancelled) return;
        const catalog = Array.isArray(response.target_assets) ? response.target_assets : [];
        // Separate disabled asset types and move them to the end
        const disabledTypes = ["tiktok_clip", "instagram_reel"];
        const enabled = catalog.filter((asset) => !disabledTypes.includes(asset.asset_type));
        const disabled = catalog.filter((asset) => disabledTypes.includes(asset.asset_type));
        const ordered = [...enabled, ...disabled];
        setTargetAssets(ordered);
        setSelectedAssets((current) => {
          if (current.length) return current;
          // select first three enabled assets by default
          return enabled.slice(0, 3).map((asset) => asset.asset_type);
        });
      } catch (error) {
        if (!cancelled) setGenerateError(error.message);
      }
    }

    loadTargetAssets();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!token) { setBootStatus("ready"); return; }
    let cancelled = false;

    async function bootstrap() {
      try {
        const me = await apiFetch("/me", { method: "GET" }, token);
        if (cancelled) return;
        setUser(me);
        persistAuth(token, me);
        try {
          const profile = await apiFetch("/me/voice-profile", { method: "GET" }, token);
          if (!cancelled) setVoiceProfile(profile);
        } catch (error) {
          if (!cancelled && error.status !== 404) setProfileError(error.message);
        }
      } catch (error) {
        if (!cancelled) { clearAuthState(); setAuthError(error.message); }
      } finally {
        if (!cancelled) setBootStatus("ready");
      }
    }

    bootstrap();
    return () => { cancelled = true; };
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
      writeWorkspace(user, { assets: workspaceAssets, savedAt: new Date().toISOString() });
      setWorkspaceSaveStatus("saved");
    }, 450);
    return () => window.clearTimeout(timeoutId);
  }, [user, workspaceAssets, workspaceLoaded]);

  useEffect(() => {
    if (!token || generateStatus !== "loading" || !generateJob?.id) return undefined;
    let cancelled = false;
    let completionTimeoutId;

    async function pollJob() {
      try {
        const job = await apiFetch(`/generation-jobs/${generateJob.id}`, { method: "GET" }, token);
        if (cancelled) return;
        setGenerateJob(job);

        if (job.status === "completed") {
          completionTimeoutId = window.setTimeout(() => {
            if (cancelled) return;
            const generatedResults = Array.isArray(job.result?.results) ? job.result.results : [];
            const source = pendingGenerationSourceRef.current || buildGenerationSource({ videoInput, generateTranscript, selectedAssets });
            const newAssets = buildWorkspaceAssets(generatedResults, source);
            setWorkspaceAssets((current) => [...newAssets, ...current]);
            setActiveAssetId(newAssets[0]?.id || "");
            setActiveBlockId("");
            setLastGeneratedCount(newAssets.length);
            setGenerateStatus("success");
            pendingGenerationSourceRef.current = "";
            navigateTo("workspace");
          }, 900);
          return;
        }

        if (job.status === "failed") {
          setGenerateStatus("error");
          setGenerateError(job.error || job.detail || "Generation failed.");
          return;
        }

        window.setTimeout(pollJob, 1200);
      } catch (error) {
        if (!cancelled) { setGenerateStatus("error"); setGenerateError(error.message); }
      }
    }

    pollJob();
    return () => {
      cancelled = true;
      if (completionTimeoutId) window.clearTimeout(completionTimeoutId);
    };
  }, [generateJob?.id, generateStatus, token]);

  useEffect(() => {
    if (!workspaceAssets.length) { setActiveAssetId(""); return; }
    const exists = workspaceAssets.some((asset) => asset.id === activeAssetId);
    if (!exists) setActiveAssetId(workspaceAssets[0].id);
  }, [workspaceAssets, activeAssetId]);

  const selectedAsset = workspaceAssets.find((asset) => asset.id === activeAssetId) ?? null;

  const handleAuthChange = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }));
  };

  const disabledTypes = ["tiktok_clip", "instagram_reel"];
  const isTemporarilyUnavailable = (assetType) => disabledTypes.includes(assetType);
  const handleAssetToggle = (assetType) => {
    if (disabledTypes.includes(assetType)) {
      const label = targetAssets.find((asset) => asset.asset_type === assetType)?.label ?? assetType.replaceAll("_", " ");
      setUnavailableMessage(`${label} is temporarily unavailable right now. We’ll re-enable it as soon as it’s ready.`);
      return;
    }
    setSelectedAssets((current) => {
      if (current.includes(assetType)) return current.filter((item) => item !== assetType);
      return [...current, assetType];
    });
    setUnavailableMessage("");
  };

  const handleGenerateVideoInputChange = (value) => {
    setVideoInput(value);
    if (value.trim()) {
      setGenerateTranscript("");
      setUploadedVideo(null);
    }
  };

  const handleGenerateTranscriptChange = (value) => {
    setGenerateTranscript(value);
    if (value.trim()) {
      setVideoInput("");
      setUploadedVideo(null);
    }
  };

  const handleGenerateUploadedVideoChange = (file) => {
    setUploadedVideo(file || null);
    if (file) {
      setVideoInput("");
      setGenerateTranscript("");
    }
  };

  const handleYoutubeProfileInputChange = (value) => {
    setYoutubeText(value);
    if (value.trim()) setYoutubeTranscriptText("");
  };

  const handleYoutubeProfileTranscriptChange = (value) => {
    setYoutubeTranscriptText(value);
    if (value.trim()) setYoutubeText("");
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
      const payload = { email: authForm.email.trim(), password: authForm.password };
      if (authMode === "register") payload.display_name = authForm.displayName.trim();
      const response = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
      persistAuth(response.access_token, response.user);
      setToken(response.access_token);
      setUser(response.user);
      setAuthStatus("success");
      setAuthForm({ email: authForm.email, password: "", displayName: "" });
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
    setGenerateError("");
    setWorkspaceAssets([]);
    setVoiceProfile(null);
    setUploadedVideo(null);
    pendingGenerationSourceRef.current = "";
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!videoInput.trim() && !generateTranscript.trim() && !uploadedVideo) {
      setGenerateError("Paste a YouTube URL/video ID, upload a video, or paste a transcript to generate content.");
      return;
    }
    if (!selectedAssets.length) { setGenerateError("Choose at least one asset type."); return; }
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
          throw new Error(`File too large. Maximum size is 100MB. Your file is ${(uploadedVideo.size / (1024 * 1024)).toFixed(1)}MB.`);
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
      const job = await apiFetch("/generation-jobs", { method: "POST", body: JSON.stringify(payload) }, token);
      setGenerateJob(job);
    } catch (error) {
      setGenerateStatus("error");
      setGenerateError(error.message);
    }
  };

  const handleSaveSamplesProfile = async (event) => {
    event.preventDefault();
    const samples = parseSampleBlocks(sampleText);
    if (!samples.length) { setProfileError("Add at least one writing sample or transcript block."); return; }
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

  const saveVoiceProfile = async (path, payload) => {
    setProfileStatus("loading");
    setProfileError("");
    try {
      const profile = await apiFetch(path, { method: "POST", body: JSON.stringify(payload) }, token);
      setVoiceProfile(profile);
      setProfileStatus("success");
    } catch (error) {
      setProfileStatus("error");
      setProfileError(error.message);
    }
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
                  ? { ...block, value, isDirty: normalizeBlockValue(value) !== normalizeBlockValue(block.originalValue) }
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
          ? { ...asset, status: newStatus, updatedAt: new Date().toISOString() }
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
    setWorkspaceAssets((current) => current.filter((asset) => asset.id !== assetId));
    if (activeAssetId === assetId) { setActiveAssetId(""); setActiveBlockId(""); }
  };

  const handleExportWorkspace = async () => {
    await navigator.clipboard.writeText(serializeWorkspace(workspaceAssets));
  };

  if (bootStatus === "loading") {
    return (
      <div className="app-shell">
        <main className="app app-loading">
          <div className="panel boot-panel">
            <p className="eyebrow">ContentOS</p>
            <h1>Loading your workspace</h1>
            <p className="muted-copy">Reconnecting your auth session and voice profile.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="app-shell">
        <div className="ambient ambient-1" />
        <div className="ambient ambient-2" />
        <main className="app auth-layout">
          <section className="hero hero-left">
            <p className="eyebrow">ContentOS</p>
            <h1>Build once.<span>Ship the right assets everywhere.</span></h1>
            <p className="hero-copy">
              Create an account, save your creator voice profile, and turn each generation
              into a persistent workspace instead of a disposable AI response.
            </p>
            <div className="hero-pills">
              <span>User auth</span>
              <span>Saved voice profile</span>
              <span>Persistent workspace</span>
            </div>
          </section>

          <section className="panel auth-panel">
            <div className="auth-toggle">
              <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")} type="button">Login</button>
              <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")} type="button">Register</button>
            </div>
            <div className="panel-heading">
              <h2>{authMode === "login" ? "Welcome back" : "Create your workspace"}</h2>
              <p className="muted-copy">
                {authMode === "login"
                  ? "Sign in to access your saved creator voice profile and asset library."
                  : "Create an account so your voice profile and workspace stay attached to you."}
              </p>
            </div>
            <form className="stack-form" onSubmit={handleAuthSubmit}>
              {authMode === "register" ? (
                <label className="field">
                  <span>Display name</span>
                  <input type="text" placeholder="Aman" value={authForm.displayName} onChange={(e) => handleAuthChange("displayName", e.target.value)} />
                </label>
              ) : null}
              <label className="field">
                <span>Email</span>
                <input type="email" placeholder="you@example.com" value={authForm.email} onChange={(e) => handleAuthChange("email", e.target.value)} />
              </label>
              <label className="field">
                <span>Password</span>
                <input type="password" placeholder="At least 8 characters" value={authForm.password} onChange={(e) => handleAuthChange("password", e.target.value)} />
              </label>
              <button className="primary-button" type="submit" disabled={authStatus === "loading"}>
                {authStatus === "loading"
                  ? authMode === "login" ? "Signing in..." : "Creating account..."
                  : authMode === "login" ? "Login" : "Create account"}
              </button>
            </form>
            {authError ? <p className="error">{authError}</p> : null}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <main className="app workspace-layout">
        <header className="header">
          <div className="header-brand">
            <div className="brand-mark">CO</div>
            <div className="brand-text">
              <span className="brand-name">ContentOS</span>
              <span className="brand-tagline">Content workspace</span>
            </div>
          </div>
          <div className="header-divider" />
          <div className="header-greeting">
            <p className="greeting-name">Hi, <span>{user.display_name}</span></p>
            <p className="greeting-sub">Create once. Repurpose everywhere.</p>
          </div>
          <nav className="header-nav">
            <button className={`nav-btn ${route === "home" ? "active" : ""}`} onClick={() => navigateTo("home")} type="button">Main page</button>
            <button className={`nav-btn ${route === "workspace" ? "active" : ""}`} onClick={() => navigateTo("workspace")} type="button">Workspace</button>
            <button className={`nav-btn ${route === "integrations" ? "active" : ""}`} onClick={() => navigateTo("integrations")} type="button">Integrations</button>
          </nav>
          <div className="header-right">
            <div className="user-pill">
              <div className="user-avatar">{user.display_name.slice(0, 2).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.display_name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} type="button">
              <svg className="logout-icon" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </header>

        {route === "workspace" ? (
          <WorkspacePage
            assets={workspaceAssets}
            activeAssetId={activeAssetId}
            activeBlockId={activeBlockId}
            onSelectAsset={setActiveAssetId}
            onSelectAssetStatus={handleAssetStatusChange}
            onSelectBlock={setActiveBlockId}
            onBlurBlock={() => setActiveBlockId("")}
            onBlockChange={handleBlockChange}
            onRevertBlock={handleRevertBlock}
            onDeleteAsset={handleDeleteAsset}
            onStatusChange={handleAssetStatusChange}
            onExportWorkspace={handleExportWorkspace}
            saveStatus={workspaceSaveStatus}
            selectedAsset={selectedAsset}
            lastGeneratedCount={lastGeneratedCount}
            onGoToMain={() => navigateTo("home")}
          />
        ) : route === "integrations" ? (
          <IntegrationsPage />
        ) : (
          <HomePage
            profileMode={profileMode}
            setProfileMode={setProfileMode}
            sampleText={sampleText}
            setSampleText={setSampleText}
            youtubeText={youtubeText}
            youtubeTranscriptText={youtubeTranscriptText}
            profileStatus={profileStatus}
            profileError={profileError}
            voiceProfile={voiceProfile}
            onYoutubeProfileInputChange={handleYoutubeProfileInputChange}
            onYoutubeProfileTranscriptChange={handleYoutubeProfileTranscriptChange}
            onSaveSamplesProfile={handleSaveSamplesProfile}
            onSaveYoutubeProfile={handleSaveYoutubeProfile}
            generateStatus={generateStatus}
            generateError={generateError}
            videoInput={videoInput}
            generateTranscript={generateTranscript}
            uploadedVideo={uploadedVideo}
            onGenerateVideoInputChange={handleGenerateVideoInputChange}
            onGenerateTranscriptChange={handleGenerateTranscriptChange}
            onGenerateUploadedVideoChange={handleGenerateUploadedVideoChange}
            targetAssets={targetAssets}
            selectedAssets={selectedAssets}
            onAssetToggle={handleAssetToggle}
            onGenerate={handleGenerate}
            unavailableMessage={unavailableMessage}
            workspaceAssets={workspaceAssets}
            onGoToWorkspace={() => navigateTo("workspace")}
          />
        )}
      </main>

      {generateStatus === "loading" ? (
        <GenerationLoader job={generateJob} selectedAssets={selectedAssets} targetAssets={targetAssets} />
      ) : null}
    </div>
  );
}

// ─── StatusPill: tap-to-cycle status with tooltip hint ───
function StatusPill({ status, onSelect, size = "md" }) {
  const [animating, setAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const meta = STATUS_META[status] || STATUS_META[ASSET_STATUS_DRAFT];

  const handleClick = (e) => {
    e.stopPropagation();
    if (animating) return;
    setAnimating(true);
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length];
    onSelect(next);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <div className="status-pill-wrapper" style={{ position: "relative", display: "inline-flex" }}>
      <button
        className={`status-pill status-pill-${status} status-pill-${size} ${animating ? "status-pill-animating" : ""}`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        type="button"
        aria-label={`Status: ${meta.label}. Click to change to ${meta.nextLabel}`}
      >
        <span className="status-pill-dot" aria-hidden="true" />
        <span className="status-pill-label">{meta.label}</span>
        <svg className="status-pill-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {showTooltip && (
        <div className="status-pill-tooltip" role="tooltip">
          Click to → <strong>{meta.nextLabel.replace("Mark as ", "").replace("Move back to ", "")}</strong>
        </div>
      )}
    </div>
  );
}

// ─── Drag-and-drop enabled asset lane ───
function StatusLane({ status, assets, activeAssetId, onSelectAsset, onStatusChange, isCollapsed, onToggleCollapse }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const meta = STATUS_META[status] || STATUS_META[ASSET_STATUS_DRAFT];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const assetId = e.dataTransfer.getData("text/plain");
    if (assetId) onStatusChange(assetId, status);
  };

  return (
    <section
      className={`status-lane status-lane-${status} ${isDragOver ? "status-lane-drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="status-lane-header">
        <button
          className="status-lane-toggle"
          onClick={onToggleCollapse}
          type="button"
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${meta.label}`}
        >
          <span className="status-lane-dot" style={{ background: meta.dot }} />
          <span className="status-lane-title">{meta.label}</span>
          <span className="status-lane-count">{assets.length}</span>
          <span className="status-lane-chevron">{isCollapsed ? "▸" : "▾"}</span>
        </button>
      </header>

      {!isCollapsed && (
        <div className="status-lane-body">
          {isDragOver && assets.length === 0 && (
            <div className="status-lane-drop-hint">
              <span>Drop here to mark as {meta.label}</span>
            </div>
          )}
          {assets.map((asset) => (
            <DraggableAssetCard
              key={asset.id}
              asset={asset}
              isActive={asset.id === activeAssetId}
              onSelect={() => onSelectAsset(asset.id)}
              onStatusChange={onStatusChange}
            />
          ))}
          {assets.length === 0 && !isDragOver && (
            <div className="status-lane-empty">
              <p>Drag assets here to mark as {meta.label.toLowerCase()}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Draggable asset card ───
function DraggableAssetCard({ asset, isActive, onSelect, onStatusChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const meta = STATUS_META[asset.status] || STATUS_META[ASSET_STATUS_DRAFT];

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", asset.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  return (
    <div
      className={`asset-card ${isActive ? "asset-card-active" : ""} ${isDragging ? "asset-card-dragging" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-label={`${asset.title}, ${asset.platformLabel}, ${meta.label}`}
    >
      <div className="asset-card-drag-handle" aria-hidden="true">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <circle cx="4" cy="4" r="1.5" fill="currentColor" opacity="0.4"/>
          <circle cx="8" cy="4" r="1.5" fill="currentColor" opacity="0.4"/>
          <circle cx="4" cy="8" r="1.5" fill="currentColor" opacity="0.4"/>
          <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.4"/>
          <circle cx="4" cy="12" r="1.5" fill="currentColor" opacity="0.4"/>
          <circle cx="8" cy="12" r="1.5" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
      <div className="asset-card-body">
        <div className="asset-card-main">
          <strong className="asset-card-title">{asset.title}</strong>
          <span className="asset-card-platform">{asset.platformLabel}</span>
        </div>
        <div className="asset-card-footer">
          <span className="asset-card-date">{formatWorkspaceDate(asset.updatedAt || asset.createdAt)}</span>
          <StatusPill status={asset.status} onSelect={(newStatus) => onStatusChange(asset.id, newStatus)} size="sm" />
        </div>
      </div>
    </div>
  );
}

function WorkspacePage({
  assets,
  activeAssetId,
  activeBlockId,
  onSelectAsset,
  onSelectAssetStatus,
  onSelectBlock,
  onBlurBlock,
  onBlockChange,
  onRevertBlock,
  onDeleteAsset,
  onStatusChange,
  onExportWorkspace,
  saveStatus,
  selectedAsset,
  lastGeneratedCount,
  onGoToMain,
}) {
  const [collapsedLanes, setCollapsedLanes] = useState({ published: true });

  const toggleLane = (status) => {
    setCollapsedLanes((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <section className="results-section">
      {assets.length ? (
        <>
          <div className="results-header workspace-results-header">
            <div>
              <p className="eyebrow">Asset workspace</p>
              <h2>Generate, refine, organize, reuse</h2>
              <p className="muted-copy">Drag assets between lanes to update their status, or click the pill on any card.</p>
            </div>
            <div className="workspace-results-actions">
              {lastGeneratedCount ? (
                <span className="summary-tag">{lastGeneratedCount} new {lastGeneratedCount === 1 ? "asset" : "assets"} added</span>
              ) : null}
              <button className="ghost-button small" onClick={onExportWorkspace} type="button">Export all</button>
              <span className={`save-indicator save-indicator-${saveStatus}`}>
                <span className="save-indicator-dot" />
                {getWorkspaceSaveLabel(saveStatus)}
              </span>
            </div>
          </div>

          <div className="asset-workspace">
            {/* Left sidebar: status lanes */}
            <div className="asset-group-section">
              <div className="workspace-sidebar-hint">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
                  <path d="M5 2.5h4M3 5h8M3 7.5h8M3 10h5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span>Drag cards to change status</span>
              </div>

              {STATUS_CYCLE.map((status) => (
                <StatusLane
                  key={status}
                  status={status}
                  assets={assets.filter((a) => a.status === status)}
                  activeAssetId={activeAssetId}
                  onSelectAsset={onSelectAsset}
                  onStatusChange={onSelectAssetStatus}
                  isCollapsed={!!collapsedLanes[status]}
                  onToggleCollapse={() => toggleLane(status)}
                />
              ))}
            </div>

            {/* Right panel: asset document */}
            {selectedAsset ? (
              <AssetDocument
                asset={selectedAsset}
                activeBlockId={activeBlockId}
                onSelectBlock={onSelectBlock}
                onBlurBlock={onBlurBlock}
                onBlockChange={onBlockChange}
                onRevertBlock={onRevertBlock}
                onDeleteAsset={onDeleteAsset}
                onStatusChange={onStatusChange}
              />
            ) : (
              <div className="asset-document workspace-document-empty">
                <div className="workspace-document-empty-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="6" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                    <path d="M11 11h10M11 15h10M11 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                  </svg>
                </div>
                <h3>Select an asset to edit</h3>
                <p>Click any card in the sidebar to open it here for editing.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-panel large">
          <h3>Your workspace is ready for its first asset</h3>
          <p>Generate content from the main page and every asset will be added here as a reusable editing library.</p>
          <button className="primary-button" onClick={onGoToMain} type="button">Go to main page</button>
        </div>
      )}
    </section>
  );
}

// ─── Carousel detection ────────────────────────────────────────────────────────

function isCarouselAsset(asset) {
  const type = (asset.assetType || "").toLowerCase();
  const title = (asset.title || "").toLowerCase();
  const platform = (asset.platformLabel || "").toLowerCase();
  if (type.includes("carousel") || title.includes("carousel")) return true;
  if (platform === "instagram" && asset.blocks.some((b) => {
    const key = (b.key || "").toLowerCase();
    return key.includes("slide") || key.includes("carousel") ||
      (Array.isArray(b.value) && b.value.length >= 2 && b.value.every(isStructuredObject));
  })) return true;
  return false;
}

// Extract slides LIVE from current block values (so edits flow through)
function extractLiveSlides(blocks) {
  const slidesBlock = blocks.find((block) => {
    if (!Array.isArray(block.value) || block.value.length < 2) return false;
    const key = String(block.key || "").toLowerCase();
    return key === "slides" || key.includes("slide") || key.includes("carousel");
  });
  if (slidesBlock) return slidesBlock.value;

  for (const block of blocks) {
    if (Array.isArray(block.value) && block.value.length >= 2) {
      const looksLikeSlides = block.value.every(
        (item) => (
          typeof item === "string" && item.trim()
        ) || (
          isStructuredObject(item) && (item.title || item.body || item.content || item.text || item.hook)
        )
      );
      if (looksLikeSlides) return block.value;
    }
  }
  // Fallback: treat each scalar block as one slide
  const scalar = blocks.filter((b) => !Array.isArray(b.value) && String(b.value || "").trim());
  if (scalar.length >= 2) {
    return scalar.map((b, i) => ({
      type: i === 0 ? "hook" : i === scalar.length - 1 ? "cta" : "content",
      title: String(b.value || "").slice(0, 120),
      body: "",
    }));
  }
  return null;
}

function splitSlideText(value) {
  const text = String(value || "").trim();
  if (!text) return { title: "", body: "", items: [] };

  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const bulletLines = lines
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);

  if (bulletLines.length >= 3) {
    return {
      title: bulletLines[0],
      body: "",
      items: bulletLines.slice(1, 5),
    };
  }

  if (lines.length >= 2) {
    return {
      title: lines[0],
      body: lines.slice(1).join(" "),
      items: [],
    };
  }

  if (text.length > 110) {
    const sentenceBreak = text.search(/[.!?]\s+/);
    if (sentenceBreak > 30) {
      return {
        title: text.slice(0, sentenceBreak + 1).trim(),
        body: text.slice(sentenceBreak + 1).trim(),
        items: [],
      };
    }
    const chunk = text.slice(0, 72);
    const lastSpace = chunk.lastIndexOf(" ");
    const splitAt = lastSpace > 24 ? lastSpace : 72;
    return {
      title: text.slice(0, splitAt).trim(),
      body: text.slice(splitAt).trim(),
      items: [],
    };
  }

  return { title: text, body: "", items: [] };
}

// Normalize any raw slide shape into a consistent object
function normalizeSlide(raw, index, total) {
  if (typeof raw === "string") {
    const parsed = splitSlideText(raw);
    return {
      type: index === 0 ? "hook" : index === total - 1 ? "cta" : "content",
      title: parsed.title,
      body: parsed.body,
      items: parsed.items,
      quote: parsed.title,
      cta: parsed.body || parsed.title,
      eyebrow: "",
    };
  }

  const normalized = {
    type: raw.type || (index === 0 ? "hook" : index === total - 1 ? "cta" : "content"),
    title: raw.title || raw.hook || raw.heading || raw.headline || "",
    body: raw.body || raw.content || raw.text || raw.description || raw.caption || "",
    items: Array.isArray(raw.items) ? raw.items : Array.isArray(raw.points) ? raw.points : Array.isArray(raw.tips) ? raw.tips : [],
    quote: raw.quote || raw.insight || raw.title || "",
    cta: raw.cta || raw.call_to_action || raw.action || raw.title || "",
    eyebrow: raw.eyebrow || raw.label || raw.meta || raw.kicker || raw.category || "",
  };

  if (!normalized.body && !normalized.items.length && normalized.title.length > 110) {
    const parsed = splitSlideText(normalized.title);
    normalized.title = parsed.title;
    normalized.body = parsed.body;
    normalized.items = parsed.items;
    if (!normalized.quote) normalized.quote = parsed.title;
    if (!normalized.cta) normalized.cta = parsed.body || parsed.title;
  }

  return normalized;
}

// ─── All available templates ───────────────────────────────────────────────────

const TEMPLATE_LIST = [
  { id: "hook",      label: "Hook",      desc: "Bold opener" },
  { id: "content",   label: "List",      desc: "Numbered points" },
  { id: "quote",     label: "Quote",     desc: "Dark pull quote" },
  { id: "breakdown", label: "Breakdown", desc: "2×2 grid" },
  { id: "cta",       label: "CTA",       desc: "Call to action" },
];

// ─── Slide renderers ───────────────────────────────────────────────────────────

function SlideHook({ slide, index, total }) {
  return (
    <div className="cs-slide cs-slide-hook">
      <div className="cs-slide-inner">
        <div className="cs-top-meta">{slide.eyebrow || "Carousel"}</div>
        <div className="cs-accent-bar" />
        <h2 className="cs-hook-title">{slide.title || "Hook goes here"}</h2>
        {slide.body && <p className="cs-hook-body">{slide.body}</p>}
        <div className="cs-slide-footer">
          <span>Swipe to read</span>
          <span className="cs-slide-num">{String(index + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function SlideContent({ slide, index, total }) {
  const hasItems = slide.items && slide.items.length > 0;
  return (
    <div className="cs-slide cs-slide-content">
      <div className="cs-slide-inner">
        <div className="cs-top-meta">{slide.eyebrow || `Slide ${index + 1}`}</div>
        {slide.title && <h2 className="cs-content-title">{slide.title}</h2>}
        {hasItems ? (
          <div className="cs-item-list">
            {slide.items.slice(0, 4).map((item, i) => (
              <div key={i} className="cs-item-row">
                <div className="cs-item-num">{i + 1}</div>
                <div className="cs-item-text">
                  <strong>{typeof item === "string" ? item : (item.title || item.text || item.point || String(item))}</strong>
                  {isStructuredObject(item) && (item.body || item.description) && (
                    <span>{item.body || item.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : slide.body ? (
          <p className="cs-content-body">{slide.body}</p>
        ) : null}
        <div className="cs-slide-footer">
          <span>{slide.eyebrow || "Key insight"}</span>
          <span className="cs-slide-num">{String(index + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function SlideQuote({ slide, index, total }) {
  return (
    <div className="cs-slide cs-slide-quote">
      <div className="cs-slide-inner">
        <div className="cs-top-meta" style={{ color: "rgba(255,255,255,0.45)" }}>{slide.eyebrow || "Insight"}</div>
        <div className="cs-quote-mark">"</div>
        <p className="cs-quote-text">{slide.quote || slide.title || "Key insight goes here."}</p>
        {slide.body && <p className="cs-quote-sub">{slide.body}</p>}
        <div className="cs-slide-footer" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span>Save this</span>
          <span className="cs-slide-num">{String(index + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function SlideBreakdown({ slide, index, total }) {
  const cells = slide.items && slide.items.length > 0
    ? slide.items.slice(0, 4)
    : slide.body ? [{ label: "Key point", value: slide.body }] : [];
  return (
    <div className="cs-slide cs-slide-breakdown">
      <div className="cs-slide-inner">
        <div className="cs-top-meta">{slide.eyebrow || "Breakdown"}</div>
        {slide.title && <h2 className="cs-content-title" style={{ fontSize: "20px" }}>{slide.title}</h2>}
        <div className="cs-breakdown-grid">
          {cells.map((cell, i) => {
            const label = isStructuredObject(cell) ? (cell.label || cell.kicker || `Point ${i + 1}`) : `Point ${i + 1}`;
            const value = isStructuredObject(cell) ? (cell.value || cell.title || cell.text || String(cell)) : String(cell);
            return (
              <div key={i} className="cs-mini-card">
                <div className="cs-mini-kicker">{label}</div>
                <div className="cs-mini-value">{value}</div>
              </div>
            );
          })}
        </div>
        <div className="cs-slide-footer">
          <span>Framework</span>
          <span className="cs-slide-num">{String(index + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function SlideCta({ slide, index, total }) {
  return (
    <div className="cs-slide cs-slide-cta">
      <div className="cs-slide-inner">
        <div className="cs-top-meta">{slide.eyebrow || "Final slide"}</div>
        <div className="cs-accent-bar" />
        {slide.title && <h2 className="cs-hook-title">{slide.title}</h2>}
        {slide.body && <p className="cs-hook-body">{slide.body}</p>}
        <div className="cs-cta-box">
          <p className="cs-cta-text">{slide.cta || slide.title || "Follow for more"}</p>
          <div className="cs-cta-pill">Save this post</div>
        </div>
      </div>
    </div>
  );
}

const SLIDE_RENDERERS = {
  hook: SlideHook, content: SlideContent, "content-list": SlideContent, list: SlideContent,
  quote: SlideQuote, insight: SlideQuote, breakdown: SlideBreakdown, framework: SlideBreakdown,
  cta: SlideCta, outro: SlideCta,
};

// ─── Single slide rendered into a hidden DOM node for download ─────────────────

function renderSlideToCanvas(slideEl) {
  return new Promise((resolve) => {
    // Use html2canvas if available, fallback gracefully
    if (window.html2canvas) {
      window.html2canvas(slideEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: slideEl.offsetWidth,
        height: slideEl.offsetHeight,
      }).then(resolve);
    } else {
      resolve(null);
    }
  });
}

// ─── Template picker panel ─────────────────────────────────────────────────────

function TemplatePicker({ currentType, onSelect, onClose }) {
  return (
    <div className="cs-template-picker">
      <div className="cs-tp-header">
        <span>Choose template for this slide</span>
        <button className="cs-tp-close" onClick={onClose} type="button" aria-label="Close">✕</button>
      </div>
      <div className="cs-tp-grid">
        {TEMPLATE_LIST.map((t) => (
          <button
            key={t.id}
            className={`cs-tp-option ${currentType === t.id ? "cs-tp-active" : ""}`}
            onClick={() => { onSelect(t.id); onClose(); }}
            type="button"
          >
            <span className="cs-tp-label">{t.label}</span>
            <span className="cs-tp-desc">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main carousel preview ─────────────────────────────────────────────────────

function CarouselPreview({ rawSlides, assetTitle }) {
  const total = rawSlides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  // Per-slide template overrides: { [index]: templateId }
  const [templateOverrides, setTemplateOverrides] = useState({});
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const touchStartX = useRef(null);
  const viewportRef = useRef(null);

  const goTo = (i) => { setActiveIndex(Math.max(0, Math.min(total - 1, i))); setShowTemplatePicker(false); };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goTo(activeIndex + (delta > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  // Normalize all slides from live data each render
  const slides = rawSlides.map((s, i) => {
    const norm = normalizeSlide(s, i, total);
    // Apply per-slide template override
    if (templateOverrides[i]) norm.type = templateOverrides[i];
    return norm;
  });

  const slide = slides[activeIndex];
  const Renderer = SLIDE_RENDERERS[slide.type] || SlideContent;

  const handleTemplateChange = (newType) => {
    setTemplateOverrides((prev) => ({ ...prev, [activeIndex]: newType }));
  };

  // Download all slides as PNGs
  const handleDownload = async () => {
    if (!window.html2canvas) {
      // Dynamically load html2canvas
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      document.head.appendChild(script);
      await new Promise((res) => { script.onload = res; script.onerror = res; });
    }

    if (!window.html2canvas) {
      alert("Could not load download library. Please try again.");
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);

    const previousIndex = activeIndex;

    try {
      for (let i = 0; i < slides.length; i++) {
        setDownloadProgress(Math.round((i / slides.length) * 100));
        setActiveIndex(i);

        // Wait for React state and layout to settle before capture.
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
        await new Promise((res) => setTimeout(res, 80));

        const exportNode = viewportRef.current;
        if (!exportNode) continue;
        const scale = Math.max(3, Math.ceil(1080 / exportNode.offsetWidth));

        const canvas = await window.html2canvas(exportNode, {
          scale,
          useCORS: true,
          backgroundColor: null,
          width: exportNode.offsetWidth,
          height: exportNode.offsetHeight,
          logging: false,
        });

        const link = document.createElement("a");
        const safeTitle = (assetTitle || "carousel").replace(/[^a-z0-9]/gi, "_").toLowerCase();
        link.download = `${safeTitle}_slide_${String(i + 1).padStart(2, "0")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        // Small delay between slides
        await new Promise((res) => setTimeout(res, 120));
      }
    } finally {
      setActiveIndex(previousIndex);
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="cs-wrap">
      {/* Top toolbar */}
      <div className="cs-toolbar">
        <span className="cs-toolbar-label">
          Slide {activeIndex + 1} of {total}
          <span className="cs-toolbar-type">{slide.type}</span>
        </span>
        <div className="cs-toolbar-actions">
          <button
            className={`cs-toolbar-btn ${showTemplatePicker ? "active" : ""}`}
            onClick={() => setShowTemplatePicker((v) => !v)}
            type="button"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="1" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="7.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/></svg>
            Template
          </button>
          <button
            className="cs-toolbar-btn cs-download-btn"
            onClick={handleDownload}
            disabled={downloading}
            type="button"
          >
            {downloading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ animation: "spin 1s linear infinite" }}><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="20 12"/></svg>
                {downloadProgress}%
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v7M3.5 5.5l3 3 3-3M2 10h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Download all
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template picker */}
      {showTemplatePicker && (
        <TemplatePicker
          currentType={slide.type}
          onSelect={handleTemplateChange}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* Slide viewport */}
      <div
        ref={viewportRef}
        className={`cs-viewport ${downloading ? "cs-viewport-exporting" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Renderer slide={slide} index={activeIndex} total={total} />
        {!downloading && activeIndex > 0 && (
          <button className="cs-arrow cs-arrow-prev" onClick={() => goTo(activeIndex - 1)} type="button" aria-label="Previous slide">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        {!downloading && activeIndex < total - 1 && (
          <button className="cs-arrow cs-arrow-next" onClick={() => goTo(activeIndex + 1)} type="button" aria-label="Next slide">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>

      {/* Dot nav */}
      <div className="cs-dots">
        {slides.map((_, i) => (
          <button key={i} className={`cs-dot ${i === activeIndex ? "cs-dot-active" : ""}`} onClick={() => goTo(i)} type="button" aria-label={`Go to slide ${i + 1}`} />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="cs-thumbnails">
        {slides.map((s, i) => (
          <button key={i} className={`cs-thumb ${i === activeIndex ? "cs-thumb-active" : ""}`} onClick={() => goTo(i)} type="button">
            <span className="cs-thumb-num">{i + 1}</span>
            <span className="cs-thumb-type">{templateOverrides[i] ? `★ ${s.type}` : s.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AssetDocument with live carousel ─────────────────────────────────────────

function AssetDocument({ asset, activeBlockId, onSelectBlock, onBlurBlock, onBlockChange, onRevertBlock, onDeleteAsset, onStatusChange }) {
  const dirtyCount = asset.blocks.filter((b) => b.isDirty).length;
  const [carouselView, setCarouselView] = useState("preview");

  // Extract slides live from current block values on every render
  const liveSlides = isCarouselAsset(asset) ? extractLiveSlides(asset.blocks) : null;

  return (
    <article className="asset-document">
        <div className="asset-document-top">
          <div>
            <p className="platform">{asset.platformLabel}</p>
            <h3>{asset.title}</h3>
            <p className="muted-copy asset-meta">{asset.sourceLabel}</p>
        </div>
        <div className="asset-controls">
          {liveSlides && (
            <div className="cs-view-toggle">
              <button className={carouselView === "preview" ? "active" : ""} onClick={() => setCarouselView("preview")} type="button">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 11v2M9 11v2M3 13h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Preview
              </button>
              <button className={carouselView === "edit" ? "active" : ""} onClick={() => setCarouselView("edit")} type="button">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10.5V12h1.5l5.06-5.06-1.5-1.5L2 10.5zM11.7 4.8a.4.4 0 000-.57l-.93-.93a.4.4 0 00-.57 0l-.73.73 1.5 1.5.73-.73z" fill="currentColor"/></svg>
                Edit text
              </button>
            </div>
          )}
          <StatusPill status={asset.status} onSelect={(newStatus) => onStatusChange(asset.id, newStatus)} size="md" />
          {dirtyCount > 0 && (
            <span className="asset-document-dirty-badge">{dirtyCount} unsaved edit{dirtyCount > 1 ? "s" : ""}</span>
          )}
          <button className="ghost-button small danger-button" onClick={() => onDeleteAsset(asset.id)} type="button">Delete asset</button>
          </div>
        </div>

        {asset.media?.kind === "video" ? (
          <div className="asset-media-card">
            <div className="asset-media-card-top">
              <div>
                <p className="content-label">Playable clip</p>
                <h4>{asset.media.label || "Generated clip"}</h4>
              </div>
              {asset.media.duration ? (
                <span className="summary-tag">{Math.round(asset.media.duration)}s</span>
              ) : null}
            </div>
            <video className="asset-video-player" controls preload="metadata" src={asset.media.videoUrl}>
              Your browser does not support video playback.
            </video>
            {/* {asset.media.rationale ? (
              <p className="muted-copy asset-media-note">{asset.media.rationale}</p>
            ) : null} */}
          </div>
        ) : null}

        {liveSlides && carouselView === "preview" ? (
          <div className="cs-container">
            <CarouselPreview rawSlides={liveSlides} assetTitle={asset.title} />
          </div>
      ) : (
        <div className="asset-blocks">
          {asset.blocks.map((block) => (
            <EditableBlock
              key={block.id}
              assetId={asset.id}
              block={block}
              isActive={activeBlockId === block.id}
              onActivate={() => onSelectBlock(block.id)}
              onBlur={onBlurBlock}
              onChange={onBlockChange}
              onRevert={onRevertBlock}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function HomePage({
  profileMode, setProfileMode, sampleText, setSampleText,
  youtubeText, youtubeTranscriptText,
  profileStatus, profileError, voiceProfile,
  onYoutubeProfileInputChange, onYoutubeProfileTranscriptChange,
  onSaveSamplesProfile, onSaveYoutubeProfile,
  generateStatus, generateError, videoInput, generateTranscript, uploadedVideo,
  onGenerateVideoInputChange, onGenerateTranscriptChange,
  onGenerateUploadedVideoChange,
  targetAssets, selectedAssets, onAssetToggle, onGenerate,
  unavailableMessage,
  workspaceAssets, onGoToWorkspace,
}) {
  const disabledTypes = ["tiktok_clip", "instagram_reel"];
  const isTemporarilyUnavailable = (assetType) => disabledTypes.includes(assetType);

  return (
    <>
      <section className="workspace-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Voice profile</p>
              <h2>Save the writing voice for this account</h2>
            </div>
            <StatusBadge status={profileStatus} />
          </div>

          <div className="mode-switch">
            <button className={profileMode === "samples" ? "active" : ""} type="button" onClick={() => setProfileMode("samples")}>Paste writing samples</button>
            <button className={profileMode === "youtube" ? "active" : ""} type="button" onClick={() => setProfileMode("youtube")}>Pull from YouTube</button>
          </div>

          {profileMode === "samples" ? (
            <form className="stack-form" onSubmit={onSaveSamplesProfile}>
              <label className="field">
                <span>Writing samples or transcripts</span>
                <textarea rows={10} placeholder="Paste one sample, leave a blank line, then paste the next sample." value={sampleText} onChange={(e) => setSampleText(e.target.value)} />
              </label>
              <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
                {profileStatus === "loading" ? "Refining..." : voiceProfile ? "Refine voice profile" : "Save voice profile"}
              </button>
            </form>
          ) : (
            <form className="stack-form" onSubmit={onSaveYoutubeProfile}>
              <label className="field">
                <span>YouTube URLs or video IDs</span>
                <textarea rows={5} placeholder="Paste one YouTube URL or video ID per line." value={youtubeText} onChange={(e) => onYoutubeProfileInputChange(e.target.value)} />
              </label>
              <label className="field">
                <span>Or paste YouTube transcripts</span>
                <textarea rows={7} placeholder="Paste one transcript, leave a blank line, then paste the next transcript." value={youtubeTranscriptText} onChange={(e) => onYoutubeProfileTranscriptChange(e.target.value)} />
              </label>
              <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
                {profileStatus === "loading" ? "Refining..." : voiceProfile ? "Refine from YouTube" : "Build from YouTube"}
              </button>
            </form>
          )}

          {profileError ? <p className="error">{profileError}</p> : null}

          {voiceProfile ? (
            <div className="profile-summary">
              <div className="summary-top">
                <div>
                  <p className="eyebrow">Current saved profile</p>
                  <h3>Version {voiceProfile.version}</h3>
                </div>
                <span className="summary-tag">{voiceProfile.voice_profile_json?.tone?.slice(0, 2).join(" / ") || "Saved"}</span>
              </div>
              <p className="summary-copy">{voiceProfile.style_summary || "Your saved voice profile will show here."}</p>
              <p className="muted-copy">New samples now refine this profile over time instead of replacing it outright.</p>
              <div className="summary-grid">
                <SummaryList title="Voice anchors" items={voiceProfile.voice_profile_json?.voice_anchors ?? []} />
                <SummaryList title="Preferred devices" items={voiceProfile.voice_profile_json?.preferred_devices ?? []} />
                <SummaryList title="Preferred phrases" items={voiceProfile.voice_profile_json?.preferred_phrases ?? []} />
              </div>
            </div>
          ) : (
            <div className="empty-panel">
              <h3>No saved voice profile yet</h3>
              <p>Save writing samples or YouTube transcripts once, and generation will reuse that profile for this account automatically.</p>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Generate</p>
              <h2>Create the exact assets you need</h2>
            </div>
            <StatusBadge status={generateStatus} />
          </div>

          <form className="stack-form" onSubmit={onGenerate}>
            <label className="field">
              <span>YouTube URL or video ID</span>
              <input type="text" placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ" value={videoInput} onChange={(e) => onGenerateVideoInputChange(e.target.value)} />
            </label>
            <div className="field">
              <span>Upload a video</span>
              <input
                type="file"
                accept="video/*,.mp4,.mov,.m4v,.avi,.mkv"
                onChange={(e) => onGenerateUploadedVideoChange(e.target.files?.[0] ?? null)}
              />
              {uploadedVideo ? (
                <div className="uploaded-file-pill">
                  <span>{uploadedVideo.name}</span>
                  <button type="button" onClick={() => onGenerateUploadedVideoChange(null)}>Clear</button>
                </div>
              ) : null}
            </div>
            <label className="field">
              <span>Or paste transcript</span>
              <textarea rows={6} placeholder="Paste the transcript here if the YouTube video cannot be fetched." value={generateTranscript} onChange={(e) => onGenerateTranscriptChange(e.target.value)} />
            </label>
            <div className="field">
              <span>Target assets</span>
              <div className="asset-grid">
                {targetAssets.map((asset) => (
                  <button
                    key={asset.asset_type}
                    type="button"
                    className={[
                      "asset-chip",
                      selectedAssets.includes(asset.asset_type) ? "selected" : "",
                      isTemporarilyUnavailable(asset.asset_type) ? "asset-chip-unavailable" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => onAssetToggle(asset.asset_type)}
                    title={isTemporarilyUnavailable(asset.asset_type) ? "Temporarily unavailable" : undefined}
                    aria-disabled={isTemporarilyUnavailable(asset.asset_type) ? "true" : undefined}
                  >
                    <strong>{asset.label}</strong>
                    <span>{asset.description}</span>
                    {isTemporarilyUnavailable(asset.asset_type) ? (
                      <span className="asset-chip-status" aria-hidden="true">
                        {/* <span className="asset-chip-status-icon">⏸</span> */}
                        Temporarily unavailable
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              {unavailableMessage ? (
                <p className="asset-unavailable-message" role="status" aria-live="polite">
                  <span className="asset-unavailable-message-icon" aria-hidden="true">⚠</span>
                  <span>{unavailableMessage}</span>
                </p>
              ) : null}
            </div>
            <button className="primary-button" type="submit" disabled={generateStatus === "loading"}>
              {generateStatus === "loading" ? "Generating..." : "Generate content"}
            </button>
          </form>

          {generateError ? <p className="error">{generateError}</p> : null}

          <div className="workspace-preview-card">
            <div className="panel-heading compact">
              <div>
                <p className="eyebrow">Workspace</p>
                <h3>Your persistent asset library</h3>
              </div>
              <span className="results-count">{workspaceAssets.length} assets</span>
            </div>
            <p className="muted-copy">Every generation gets added to your workspace instead of replacing the previous one. Open the workspace to edit, reuse, export, or delete any asset.</p>
            <button className="ghost-button" onClick={onGoToWorkspace} type="button">Open workspace</button>
          </div>
        </article>
      </section>
    </>
  );
}

function isStructuredObject(item) {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

function serializeStructuredItem(item) {
  const titleText = typeof item.title === "string" ? item.title.trim() : "";
  const bodyKey = ["body", "content", "text", "summary", "caption"].find((k) => typeof item[k] === "string" && item[k].trim());
  const bodyText = bodyKey ? item[bodyKey].trim() : "";
  const parts = [];
  if (titleText) parts.push(titleText);
  if (bodyText) parts.push(bodyText);
  return parts.join("\n");
}

function serializeListToText(list) {
  return list.map((item) => isStructuredObject(item) ? serializeStructuredItem(item) : String(item ?? "")).join("\n\n");
}

function EditableBlock({ assetId, block, isActive, onActivate, onBlur, onChange, onRevert }) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isActive]);

  const isList = Array.isArray(block.value);
  const hasStructuredItems = isList && block.value.some(isStructuredObject);

  const handleCopy = async () => {
    let content;
    if (isList) {
      content = hasStructuredItems ? serializeListToText(block.value) : block.value.join("\n");
    } else {
      content = String(block.value ?? "");
    }
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const textareaValue = isList ? serializeListToText(block.value) : String(block.value ?? "");
  const textareaRows = isList ? Math.max(6, textareaValue.split("\n").length + 1) : Math.max(5, estimateRows(block.value));

  return (
    <section className={`editable-block ${isActive ? "active" : ""} ${block.isDirty ? "dirty" : ""}`}>
      <div className="editable-block-top">
        <div>
          <p className="content-label">{block.label}</p>
          <span className="editable-block-hint">
            {block.kind === "list"
              ? hasStructuredItems ? `${block.value.length} sections` : `${block.value.length} lines`
              : "Inline editable"}
          </span>
        </div>
        <div className="editable-actions">
          {block.isDirty && <span className="dirty-indicator">Edited</span>}
          {!isActive ? <span className="edit-cue">Click to edit</span> : null}
          <button className="ghost-button small" onClick={handleCopy} type="button">{copied ? "Copied ✓" : "Copy"}</button>
          <button className="ghost-button small" onClick={() => onRevert(assetId, block.id)} type="button" disabled={!block.isDirty}>Revert</button>
        </div>
      </div>

      {isActive ? (
        <div className="editable-editor same-box-editor">
          <textarea
            ref={textareaRef}
            rows={textareaRows}
            value={textareaValue}
            onBlur={onBlur}
            onChange={(event) => {
              if (hasStructuredItems || isList) {
                onChange(assetId, block.id, splitEditableList(event.target.value));
              } else {
                onChange(assetId, block.id, event.target.value);
              }
            }}
          />
          <p className="muted-copy editor-note">
            {hasStructuredItems
              ? "Each section: title on first line, body below. Blank line separates sections."
              : "Autosave is on. Use one line per item for list blocks."}
          </p>
        </div>
      ) : (
        <button className="editable-preview" onClick={onActivate} type="button">
          <span className="editable-overlay-hint">Click to edit</span>
          {isList ? (
            hasStructuredItems ? (
              <div className="content-sections">
                {block.value.map((item, index) =>
                  isStructuredObject(item) ? (
                    <div key={`${block.id}-${index}`} className="content-section-item">
                      {item.title && <strong className="section-item-title">{item.title}</strong>}
                      {(item.body || item.content || item.text) && (
                        <p className="section-item-body">{item.body || item.content || item.text}</p>
                      )}
                    </div>
                  ) : (
                    <p key={`${block.id}-${index}`} className="content-section-plain">{String(item ?? "")}</p>
                  ),
                )}
              </div>
            ) : (
              <div className="content-list">
                {block.value.map((item, index) => (
                  <p key={`${block.id}-${index}`}><span>{index + 1}</span>{item}</p>
                ))}
              </div>
            )
          ) : (
            <p className="content-text">{String(block.value)}</p>
          )}
        </button>
      )}
    </section>
  );
}

function SummaryList({ title, items }) {
  return (
    <div className="summary-list">
      <p className="content-label">{title}</p>
      {items.length ? items.slice(0, 5).map((item) => <p key={item}>{item}</p>) : <p className="muted-copy">No items saved yet.</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const labelMap = { idle: "Ready", loading: "Working", success: "Saved", error: "Error" };
  return <span className={`status-badge status-${status}`}>{labelMap[status] ?? "Ready"}</span>;
}

function GenerationLoader({ job, selectedAssets, targetAssets }) {
  const stageLabel = getStageLabel(job?.stage);
  const elapsed = formatElapsed(job?.created_at);
  const steps = Array.isArray(job?.steps) && job.steps.length
    ? job.steps
    : [
        { key: "source", label: "Getting ready", status: "active" },
        { key: "moments", label: "Understanding input", status: "pending" },
        { key: "strategy", label: "Preparing content", status: "pending" },
        { key: "execution", label: "Creating results", status: "pending" },
        { key: "finalize", label: "Wrapping up", status: "pending" },
      ];
  const assetProgress = buildAssetProgress(job?.asset_progress, selectedAssets, targetAssets);
  const realProgress = getRealLoaderProgress(job, steps, assetProgress);
  const [displayProgress, setDisplayProgress] = useState(realProgress);
  const progressPercent = Math.round(displayProgress);
  const completedAssets = assetProgress.filter((a) => a.status === "completed").length;
  const totalAssets = assetProgress.length;

  useEffect(() => { setDisplayProgress(realProgress); }, [job?.id]);

  useEffect(() => {
    if (!job) return undefined;
    const intervalId = window.setInterval(() => {
      setDisplayProgress((current) => {
        const target = getRealLoaderProgress(job, steps, assetProgress);
        if (job.status === "completed") return Math.min(100, current + 3.5);
        if (job.status === "failed") return current;
        if (current < target) {
          const jump = Math.max(0.5, (target - current) * 0.28);
          return clampProgress(Math.min(target, current + jump));
        }
        if (current > target) return clampProgress(Math.max(target, current - 0.8));
        return current;
      });
    }, 180);
    return () => window.clearInterval(intervalId);
  }, [job?.id, job?.status, job?.stage, job?.progress_percent, job?.updated_at]);

  return (
    <div className="loader-overlay">
      <div className="loader-card">
        <div className="loader-orb" />
        <p className="loader-badge">ContentOS is generating</p>
        <h2>Building your asset pack</h2>
        <p className="loader-copy">{job?.detail || "Your request is in progress and the final content is on the way."}</p>
        <div className="loader-progress-shell">
          <div className="loader-progress-top">
            <strong>{stageLabel}</strong>
            <span>{progressPercent}%</span>
          </div>
          <div className="loader-progress-bar">
            <div className="loader-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="loader-progress-meta">
            <span>{job?.message || "Starting generation..."}</span>
            <span>{totalAssets ? `${completedAssets}/${totalAssets} ready` : elapsed}</span>
          </div>
        </div>
        <div className="loader-steps">
          {steps.map((step) => (
            <div key={step.key} className={`loader-step loader-step-${step.status || "pending"}`}>
              <span /><p>{step.label}</p>
            </div>
          ))}
        </div>
        <div className="loader-assets">
          {assetProgress.map((asset) => (
            <div key={asset.asset_type} className={`loader-asset loader-asset-${asset.status}`}>
              <div>
                <strong>{asset.label}</strong>
                <p>{getAssetStatusCopy(asset)}</p>
              </div>
              <span>{asset.status === "completed" ? "Done" : asset.status === "active" ? "Live" : "Next"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Utilities ───

async function apiFetch(path, options = {}, token = "") {
  const headers = { "Content-Type": "application/json", ...(options.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function getRouteFromPathname(pathname = "") {
  const cleaned = pathname.replace(/^\/+/, "");
  if (cleaned === "workspace") return "workspace";
  if (cleaned === "integrations") return "integrations";
  return DEFAULT_ROUTE;
}

function buildVideoPayload(value) {
  const trimmed = value.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("http")) return { video_url: trimmed };
  return { video_id: trimmed };
}

function parseSampleBlocks(value) {
  return value.split(/\n\s*\n/g).map((item) => item.trim()).filter(Boolean);
}

function parseLineItems(value) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function persistAuth(nextToken, nextUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
}

function clearAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.reload();
}

function safeParse(output) {
  try { return typeof output === "string" ? JSON.parse(output) : output; }
  catch { return { raw: output }; }
}

function formatLabel(label) { return label.replaceAll("_", " "); }
function formatAssetLabel(assetType) { return assetType.replaceAll("_", " "); }

function getPlatformHook(platform) {
  const hooks = { twitter: "Thread draft", tiktok: "Short-form script", youtube: "Video angle", linkedin: "Professional post", instagram: "Instagram asset", blog: "Blog draft", reddit: "Reddit post", email: "Newsletter draft" };
  return hooks[platform] ?? "Generated asset";
}

function buildGenerationSource({ videoInput, generateTranscript, selectedAssets }) {
  if (videoInput.trim()) return `Generated from ${truncateText(videoInput.trim(), 68)} for ${selectedAssets.length} selected asset types.`;
  return `Generated from pasted transcript for ${selectedAssets.length} selected asset types.`;
}

function resolveMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
}

function buildAssetMedia(result) {
  if (!result?.media || result.media.kind !== "video") return null;

  return {
    kind: "video",
    label: result.media.label || "Generated clip",
    videoUrl: resolveMediaUrl(result.media.video_url),
    videoPath: result.media.video_path || "",
    subtitleUrl: resolveMediaUrl(result.media.subtitle_url),
    duration: result.media.duration || 0,
    start: result.media.start || 0,
    end: result.media.end || 0,
    score: result.media.score || 0,
    rationale: result.media.rationale || "",
  };
}

function buildWorkspaceAssets(results, sourceLabel) {
  return results.map((result, index) => {
    const media = buildAssetMedia(result);
    const data = media ? {} : safeParse(result.output);
    const now = new Date().toISOString();
    const title = result.asset_type ? formatAssetLabel(result.asset_type) : getPlatformHook(result.platform);
    return {
      id: buildAssetId(result, index),
      title,
      platformLabel: capitalize(result.platform || "generated"),
      assetType: result.asset_type || "generic",
      sourceLabel,
      media,
      status: ASSET_STATUS_DRAFT,
      createdAt: now,
      updatedAt: now,
      blocks: buildBlocksFromOutput(data),
    };
  });
}

function buildBlocksFromOutput(data) {
  return Object.entries(data).map(([key, value], index) => ({
    id: `${key}-${index}-${generateLocalId()}`,
    key,
    label: formatLabel(key),
    kind: Array.isArray(value) ? "list" : "text",
    value: Array.isArray(value) ? value.map(formatListItemValue) : formatTextBlockValue(value),
    originalValue: Array.isArray(value) ? value.map(formatListItemValue) : formatTextBlockValue(value),
    isDirty: false,
  }));
}

function formatTextBlockValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(formatListItemValue).join("\n");
  const readable = extractReadableObjectText(value);
  if (readable) return readable;
  return safeStringify(value);
}

function formatListItemValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && !Array.isArray(value)) return value;
  const text = formatTextBlockValue(value);
  return text.split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
}

function extractReadableObjectText(value) {
  if (!value || typeof value !== "object") return "";
  const titleText = typeof value.title === "string" ? value.title.trim() : "";
  const bodyKey = ["body", "content", "text", "summary", "caption"].find((k) => typeof value[k] === "string" && value[k].trim());
  const bodyText = bodyKey ? value[bodyKey].trim() : "";
  if (titleText && bodyText) return `${titleText}\n${bodyText}`;
  if (titleText) return titleText;
  if (bodyText) return bodyText;
  for (const key of ["value"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  for (const key of ["paragraphs", "sections", "blocks", "items"]) {
    if (!Array.isArray(value[key])) continue;
    const combined = value[key].map(formatTextBlockValue).map((item) => item.trim()).filter(Boolean).join("\n\n");
    if (combined) return combined;
  }
  return "";
}

function safeStringify(value) {
  try { return JSON.stringify(value, null, 2); }
  catch { return String(value ?? ""); }
}

function buildAssetId(result, index) {
  return `${result.platform || "platform"}-${result.asset_type || "asset"}-${index}-${generateLocalId()}`;
}

function generateLocalId() { return Math.random().toString(36).slice(2, 9); }

function getWorkspaceStorageKey(user) {
  const identifier = user?.id || user?.email || "anonymous";
  return `${WORKSPACE_STORAGE_PREFIX}:${identifier}`;
}

function readWorkspace(user) {
  try { return JSON.parse(localStorage.getItem(getWorkspaceStorageKey(user)) ?? "{}"); }
  catch { return {}; }
}

function writeWorkspace(user, payload) {
  localStorage.setItem(getWorkspaceStorageKey(user), JSON.stringify(payload));
}

function serializeWorkspace(assets) { return assets.map(serializeAsset).join("\n\n"); }

function serializeAsset(asset) {
  const lines = [`${asset.title} (${asset.platformLabel})`, `Status: ${formatAssetStatus(asset.status)}`, `${asset.sourceLabel}`, ""];
  for (const block of asset.blocks) {
    lines.push(`${block.label}:`);
    if (Array.isArray(block.value)) {
      for (const item of block.value) {
        lines.push(isStructuredObject(item) ? `- ${serializeStructuredItem(item)}` : `- ${item}`);
      }
    } else {
      lines.push(String(block.value));
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

function normalizeBlockValue(value) {
  if (Array.isArray(value)) return value.map((item) => isStructuredObject(item) ? serializeStructuredItem(item) : String(item ?? "").trim()).join("\n");
  return String(value ?? "").trim();
}

function splitEditableList(value) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function estimateRows(value) { return String(value ?? "").split("\n").length + 1; }

function getWorkspaceSaveLabel(status) {
  if (status === "saving") return "Autosaving";
  if (status === "saved") return "Saved";
  if (status === "error") return "Save issue";
  return "Ready";
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatAssetStatus(status) {
  const labels = { [ASSET_STATUS_DRAFT]: "Draft", [ASSET_STATUS_READY]: "Ready", [ASSET_STATUS_PUBLISHED]: "Published" };
  return labels[status] || status;
}

function truncateText(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

function formatWorkspaceDate(value) {
  if (!value) return "Saved recently";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function buildAssetProgress(jobAssets, selectedAssets, targetAssets) {
  if (Array.isArray(jobAssets) && jobAssets.length) return jobAssets;
  const labelByAsset = Object.fromEntries(targetAssets.map((a) => [a.asset_type, a.label]));
  return selectedAssets.map((assetType) => ({
    asset_type: assetType,
    label: labelByAsset[assetType] || formatAssetLabel(assetType),
    status: "pending",
    attempt: 0,
  }));
}

function getStageLabel(stage) {
  const labels = { queued: "Queued", starting: "Starting", source: "Getting ready", moments: "Understanding input", strategy: "Preparing content", execution: "Creating results", execution_preparing: "Preparing creation", execution_writing: "Creating results", execution_review: "Improving results", execution_polish: "Finalizing results", execution_video: "Rendering clips", finalizing: "Wrapping up", finalize: "Wrapping up", completed: "Completed", failed: "Stopped" };
  return labels[stage] || "Generating";
}

function getAssetStatusCopy(asset) {
  if (asset.status === "completed") return "Finished and ready in your pack.";
  if (asset.status === "active") return "Currently being prepared for you.";
  return "Waiting to be completed next.";
}

function formatElapsed(isoValue) {
  if (!isoValue) return "Just started";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoValue).getTime()) / 1000));
  if (seconds < 5) return "Just started";
  if (seconds < 60) return `${seconds}s elapsed`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s elapsed`;
}

function clampProgress(value) { return Math.max(0, Math.min(100, Number(value) || 0)); }

function getRealLoaderProgress(job, steps, assetProgress) {
  if (!job) return 4;
  if (job.status === "completed") return 100;
  const stepWeight = { source: 8, moments: 10, strategy: 12, execution: 60, finalize: 10 };
  let progress = 2;
  for (const step of steps) {
    if (step.key === "execution") continue;
    const weight = stepWeight[step.key] ?? 0;
    if (step.status === "completed") progress += weight;
    else if (step.status === "active") progress += weight * 0.55;
  }
  const totalAssets = assetProgress.length;
  if (totalAssets) {
    const perAssetWeight = stepWeight.execution / totalAssets;
    const completedAssets = assetProgress.filter((a) => a.status === "completed").length;
    const activeAssets = assetProgress.filter((a) => a.status === "active").length;
    progress += completedAssets * perAssetWeight;
    if (activeAssets > 0) progress += getActiveAssetPartial(job, perAssetWeight) * activeAssets;
  } else {
    const executionStep = steps.find((s) => s.key === "execution");
    if (executionStep?.status === "completed") progress += stepWeight.execution;
    else if (executionStep?.status === "active") progress += stepWeight.execution * 0.4;
  }
  if (job.stage === "finalize" || job.stage === "finalizing") progress = Math.max(progress, 92);
  return clampProgress(progress);
}

function getActiveAssetPartial(job, perAssetWeight) {
  const lastUpdate = job?.updated_at ? new Date(job.updated_at).getTime() : Date.now();
  const secondsSinceUpdate = Math.max(0, (Date.now() - lastUpdate) / 1000);
  const eased = Math.min(0.92, 0.18 + secondsSinceUpdate / 28);
  return perAssetWeight * eased;
}

export default App;
