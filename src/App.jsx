import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const AUTH_STORAGE_KEY = "contentos-auth";

function App() {
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
  const [results, setResults] = useState([]);
  const [generateStatus, setGenerateStatus] = useState("idle");
  const [generateError, setGenerateError] = useState("");
  const [generateJob, setGenerateJob] = useState(null);
  const [targetAssets, setTargetAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);

  const [profileMode, setProfileMode] = useState("samples");
  const [sampleText, setSampleText] = useState("");
  const [youtubeText, setYoutubeText] = useState("");
  const [youtubeTranscriptText, setYoutubeTranscriptText] = useState("");
  const [profileStatus, setProfileStatus] = useState("idle");
  const [profileError, setProfileError] = useState("");
  const [voiceProfile, setVoiceProfile] = useState(null);
  const [generateTranscript, setGenerateTranscript] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTargetAssets() {
      try {
        const response = await apiFetch("/target-assets", { method: "GET" });
        if (cancelled) {
          return;
        }

        const catalog = Array.isArray(response.target_assets) ? response.target_assets : [];
        setTargetAssets(catalog);
        setSelectedAssets(catalog.slice(0, 3).map((asset) => asset.asset_type));
      } catch (error) {
        if (!cancelled) {
          setGenerateError(error.message);
        }
      }
    }

    loadTargetAssets();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setBootStatus("ready");
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        const me = await apiFetch("/me", { method: "GET" }, token);
        if (cancelled) return;

        setUser(me);
        persistAuth(token, me);

        try {
          const profile = await apiFetch("/me/voice-profile", { method: "GET" }, token);
          if (!cancelled) {
            setVoiceProfile(profile);
          }
        } catch (error) {
          if (!cancelled && error.status !== 404) {
            setProfileError(error.message);
          }
        }
      } catch (error) {
        if (!cancelled) {
          clearAuthState();
          setAuthError(error.message);
        }
      } finally {
        if (!cancelled) {
          setBootStatus("ready");
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || generateStatus !== "loading" || !generateJob?.id) {
      return undefined;
    }

    let cancelled = false;
    let completionTimeoutId;

    async function pollJob() {
      try {
        const job = await apiFetch(`/generation-jobs/${generateJob.id}`, { method: "GET" }, token);
        if (cancelled) {
          return;
        }

        setGenerateJob(job);

        if (job.status === "completed") {
          completionTimeoutId = window.setTimeout(() => {
            if (cancelled) {
              return;
            }

            setResults(Array.isArray(job.result?.results) ? job.result.results : []);
            setGenerateStatus("success");
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
        if (!cancelled) {
          setGenerateStatus("error");
          setGenerateError(error.message);
        }
      }
    }

    pollJob();

    return () => {
      cancelled = true;
      if (completionTimeoutId) {
        window.clearTimeout(completionTimeoutId);
      }
    };
  }, [generateJob?.id, generateStatus, token]);

  const handleAuthChange = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }));
  };

  const handleAssetToggle = (assetType) => {
    setSelectedAssets((current) => {
      if (current.includes(assetType)) {
        return current.filter((item) => item !== assetType);
      }

      return [...current, assetType];
    });
  };

  const handleGenerateVideoInputChange = (value) => {
    setVideoInput(value);
    if (value.trim()) {
      setGenerateTranscript("");
    }
  };

  const handleGenerateTranscriptChange = (value) => {
    setGenerateTranscript(value);
    if (value.trim()) {
      setVideoInput("");
    }
  };

  const handleYoutubeProfileInputChange = (value) => {
    setYoutubeText(value);
    if (value.trim()) {
      setYoutubeTranscriptText("");
    }
  };

  const handleYoutubeProfileTranscriptChange = (value) => {
    setYoutubeTranscriptText(value);
    if (value.trim()) {
      setYoutubeText("");
    }
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

      const response = await apiFetch(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

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
    setResults([]);
    setVoiceProfile(null);
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!videoInput.trim() && !generateTranscript.trim()) {
      setGenerateError("Paste a YouTube URL/video ID or a transcript to generate content.");
      return;
    }

    if (!selectedAssets.length) {
      setGenerateError("Choose at least one asset type.");
      return;
    }

    setGenerateStatus("loading");
    setGenerateError("");
    setGenerateJob(null);

    try {
      const payload = {
        ...buildVideoPayload(videoInput),
        transcript: generateTranscript.trim(),
        target_assets: selectedAssets,
      };

      const job = await apiFetch(
        "/generation-jobs",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token,
      );
      setGenerateJob(job);
      setResults([]);
    } catch (error) {
      setGenerateStatus("error");
      setGenerateError(error.message);
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

  const saveVoiceProfile = async (path, payload) => {
    setProfileStatus("loading");
    setProfileError("");

    try {
      const profile = await apiFetch(
        path,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token,
      );

      setVoiceProfile(profile);
      setProfileStatus("success");
    } catch (error) {
      setProfileStatus("error");
      setProfileError(error.message);
    }
  };

  if (bootStatus === "loading") {
    return (
      <div className="app-shell">
        <main className="app app-loading">
          <div className="panel boot-panel">
            <p className="eyebrow">ContentOS</p>
            <h1>Loading your workspace</h1>
            <p className="muted-copy">
              Reconnecting your auth session and voice profile.
            </p>
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
            <h1>
              Build once.
              <span>Ship the right assets everywhere.</span>
            </h1>
            <p className="hero-copy">
              Create an account, save your creator voice profile, and generate
              the exact asset types you need, from Twitter threads to Instagram carousels.
            </p>
            <div className="hero-pills">
              <span>User auth</span>
              <span>Saved voice profile</span>
              <span>Asset-first generation</span>
            </div>
          </section>

          <section className="panel auth-panel">
            <div className="auth-toggle">
              <button
                className={authMode === "login" ? "active" : ""}
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={authMode === "register" ? "active" : ""}
                onClick={() => setAuthMode("register")}
                type="button"
              >
                Register
              </button>
            </div>

            <div className="panel-heading">
              <h2>{authMode === "login" ? "Welcome back" : "Create your workspace"}</h2>
              <p className="muted-copy">
                {authMode === "login"
                  ? "Sign in to access your saved creator voice profile."
                  : "Create an account so every voice profile is stored per user."}
              </p>
            </div>

            <form className="stack-form" onSubmit={handleAuthSubmit}>
              {authMode === "register" ? (
                <label className="field">
                  <span>Display name</span>
                  <input
                    type="text"
                    placeholder="Aman"
                    value={authForm.displayName}
                    onChange={(event) => handleAuthChange("displayName", event.target.value)}
                  />
                </label>
              ) : null}

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={authForm.email}
                  onChange={(event) => handleAuthChange("email", event.target.value)}
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={authForm.password}
                  onChange={(event) => handleAuthChange("password", event.target.value)}
                />
              </label>

              <button className="primary-button" type="submit" disabled={authStatus === "loading"}>
                {authStatus === "loading"
                  ? authMode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : authMode === "login"
                    ? "Login"
                    : "Create account"}
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
        <header className="workspace-top">
          <div>
            <p className="eyebrow">ContentOS Workspace</p>
            <h1>
              Hi, {user.display_name}.
              <span>Choose assets, not just platforms.</span>
            </h1>
          </div>

          <div className="top-actions">
            <div className="user-chip">
              <strong>{user.display_name}</strong>
              <span>{user.email}</span>
            </div>
            <button className="ghost-button" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </header>

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
              <button
                className={profileMode === "samples" ? "active" : ""}
                type="button"
                onClick={() => setProfileMode("samples")}
              >
                Paste writing samples
              </button>
              <button
                className={profileMode === "youtube" ? "active" : ""}
                type="button"
                onClick={() => setProfileMode("youtube")}
              >
                Pull from YouTube
              </button>
            </div>

            {profileMode === "samples" ? (
              <form className="stack-form" onSubmit={handleSaveSamplesProfile}>
                <label className="field">
                  <span>Writing samples or transcripts</span>
                  <textarea
                    rows={10}
                    placeholder="Paste one sample, leave a blank line, then paste the next sample."
                    value={sampleText}
                    onChange={(event) => setSampleText(event.target.value)}
                  />
                </label>
                <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
                  {profileStatus === "loading"
                    ? "Refining..."
                    : voiceProfile
                      ? "Refine voice profile"
                      : "Save voice profile"}
                </button>
              </form>
            ) : (
              <form className="stack-form" onSubmit={handleSaveYoutubeProfile}>
                <label className="field">
                  <span>YouTube URLs or video IDs</span>
                  <textarea
                    rows={5}
                    placeholder="Paste one YouTube URL or video ID per line."
                    value={youtubeText}
                    onChange={(event) => handleYoutubeProfileInputChange(event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Or paste YouTube transcripts</span>
                  <textarea
                    rows={7}
                    placeholder="Paste one transcript, leave a blank line, then paste the next transcript."
                    value={youtubeTranscriptText}
                    onChange={(event) => handleYoutubeProfileTranscriptChange(event.target.value)}
                  />
                </label>
                <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
                  {profileStatus === "loading"
                    ? "Refining..."
                    : voiceProfile
                      ? "Refine from YouTube"
                      : "Build from YouTube"}
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
                  <span className="summary-tag">
                    {voiceProfile.voice_profile_json?.tone?.slice(0, 2).join(" / ") || "Saved"}
                  </span>
                </div>

                <p className="summary-copy">
                  {voiceProfile.style_summary || "Your saved voice profile will show here."}
                </p>
                <p className="muted-copy">
                  New samples now refine this profile over time instead of replacing it outright.
                </p>

                <div className="summary-grid">
                  <SummaryList
                    title="Voice anchors"
                    items={voiceProfile.voice_profile_json?.voice_anchors ?? []}
                  />
                  <SummaryList
                    title="Preferred devices"
                    items={voiceProfile.voice_profile_json?.preferred_devices ?? []}
                  />
                  <SummaryList
                    title="Preferred phrases"
                    items={voiceProfile.voice_profile_json?.preferred_phrases ?? []}
                  />
                </div>
              </div>
            ) : (
              <div className="empty-panel">
                <h3>No saved voice profile yet</h3>
                <p>
                  Save writing samples or YouTube transcripts once, and generation
                  will reuse that profile for this account automatically.
                </p>
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

            <form className="stack-form" onSubmit={handleGenerate}>
              <label className="field">
                <span>YouTube URL or video ID</span>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ"
                  value={videoInput}
                  onChange={(event) => handleGenerateVideoInputChange(event.target.value)}
                />
              </label>

              <label className="field">
                <span>Or paste transcript</span>
                <textarea
                  rows={6}
                  placeholder="Paste the transcript here if the YouTube video cannot be fetched."
                  value={generateTranscript}
                  onChange={(event) => handleGenerateTranscriptChange(event.target.value)}
                />
              </label>

              <div className="field">
                <span>Target assets</span>
                <div className="asset-grid">
                  {targetAssets.map((asset) => (
                    <button
                      key={asset.asset_type}
                      type="button"
                      className={`asset-chip ${selectedAssets.includes(asset.asset_type) ? "selected" : ""}`}
                      onClick={() => handleAssetToggle(asset.asset_type)}
                    >
                      <strong>{asset.label}</strong>
                      <span>{asset.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button className="primary-button" type="submit" disabled={generateStatus === "loading"}>
                {generateStatus === "loading" ? "Generating..." : "Generate content"}
              </button>
            </form>

            {generateError ? <p className="error">{generateError}</p> : null}

            
          </article>
        </section>

        <section className="results-section">
          {results.length ? (
            <>
              <div className="results-header">
                <div>
                  <p className="eyebrow">Generated assets</p>
                  <h2>Ready to publish</h2>
                </div>
                <span className="results-count">{results.length} assets</span>
              </div>

              <div className="results-grid">
                {results.map((result, index) => (
                  <ContentCard key={`${result.asset_type}-${index}`} result={result} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-panel large">
              <h3>Your generated assets will appear here</h3>
              <p>
                Save a voice profile, choose your asset types, and generate a
                targeted content pack instead of a generic platform dump.
              </p>
            </div>
          )}
        </section>
      </main>

      {generateStatus === "loading" ? (
        <GenerationLoader
          job={generateJob}
          selectedAssets={selectedAssets}
          targetAssets={targetAssets}
        />
      ) : null}
    </div>
  );
}

function ContentCard({ result }) {
  const data = safeParse(result.output);

  return (
    <article className="content-card">
      <div className="content-top">
        <div>
          <p className="platform">{result.platform}</p>
          <h3>{result.asset_type ? formatAssetLabel(result.asset_type) : getPlatformHook(result.platform)}</h3>
        </div>
        <CopyButton data={JSON.stringify(data, null, 2)} />
      </div>

      <div className="content-body">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="content-block">
            <p className="content-label">{formatLabel(key)}</p>

            {Array.isArray(value) ? (
              <div className="content-list">
                {value.map((item, index) => (
                  <p key={index}>
                    <span>{index + 1}</span>
                    {item}
                  </p>
                ))}
              </div>
            ) : (
              <p className="content-text">{String(value)}</p>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

function SummaryList({ title, items }) {
  return (
    <div className="summary-list">
      <p className="content-label">{title}</p>
      {items.length ? (
        items.slice(0, 5).map((item) => <p key={item}>{item}</p>)
      ) : (
        <p className="muted-copy">No items saved yet.</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const labelMap = {
    idle: "Ready",
    loading: "Working",
    success: "Saved",
    error: "Error",
  };

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
  const completedAssets = assetProgress.filter((asset) => asset.status === "completed").length;
  const totalAssets = assetProgress.length;

  useEffect(() => {
    setDisplayProgress(realProgress);
  }, [job?.id]);

  useEffect(() => {
    if (!job) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setDisplayProgress((current) => {
        const target = getRealLoaderProgress(job, steps, assetProgress);

        if (job.status === "completed") {
          return Math.min(100, current + 3.5);
        }

        if (job.status === "failed") {
          return current;
        }

        if (current < target) {
          const jump = Math.max(0.5, (target - current) * 0.28);
          return clampProgress(Math.min(target, current + jump));
        }

        if (current > target) {
          return clampProgress(Math.max(target, current - 0.8));
        }

        return current;
      });
    }, 180);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [job?.id, job?.status, job?.stage, job?.progress_percent, job?.updated_at]);

  return (
    <div className="loader-overlay">
      <div className="loader-card">
        <div className="loader-orb" />
        <p className="loader-badge">ContentOS is generating</p>
        <h2>Building your asset pack</h2>
        <p className="loader-copy">
          {job?.detail || "Your request is in progress and the final content is on the way."}
        </p>

        <div className="loader-progress-shell">
          <div className="loader-progress-top">
            <strong>{stageLabel}</strong>
            <span>{progressPercent}%</span>
          </div>
          <div className="loader-progress-bar">
            <div
              className="loader-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="loader-progress-meta">
            <span>{job?.message || "Starting generation..."}</span>
            <span>{totalAssets ? `${completedAssets}/${totalAssets} ready` : elapsed}</span>
          </div>
        </div>

        <div className="loader-steps">
          {steps.map((step) => (
            <div
              key={step.key}
              className={`loader-step loader-step-${step.status || "pending"}`}
            >
              <span />
              <p>{step.label}</p>
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
              <span>{getAssetStatusBadge(asset.status)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className="ghost-button small" onClick={handleCopy} type="button">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

async function apiFetch(path, options = {}, token = "") {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.detail || "Request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
}

function buildVideoPayload(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }
  if (trimmed.startsWith("http")) {
    return { video_url: trimmed };
  }
  return { video_id: trimmed };
}

function parseSampleBlocks(value) {
  return value
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLineItems(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function persistAuth(nextToken, nextUser) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ token: nextToken, user: nextUser }),
  );
}

function clearAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.reload();
}

function safeParse(output) {
  try {
    return typeof output === "string" ? JSON.parse(output) : output;
  } catch {
    return { raw: output };
  }
}

function formatLabel(label) {
  return label.replaceAll("_", " ");
}

function formatAssetLabel(assetType) {
  return assetType.replaceAll("_", " ");
}

function getPlatformHook(platform) {
  const hooks = {
    twitter: "Thread draft",
    tiktok: "Short-form script",
    youtube: "Video angle",
    linkedin: "Professional post",
    instagram: "Instagram asset",
    blog: "Blog draft",
    email: "Newsletter draft",
  };

  return hooks[platform] ?? "Generated asset";
}

function buildAssetProgress(jobAssets, selectedAssets, targetAssets) {
  if (Array.isArray(jobAssets) && jobAssets.length) {
    return jobAssets;
  }

  const labelByAsset = Object.fromEntries(
    targetAssets.map((asset) => [asset.asset_type, asset.label]),
  );

  return selectedAssets.map((assetType) => ({
    asset_type: assetType,
    label: labelByAsset[assetType] || formatAssetLabel(assetType),
    status: "pending",
    attempt: 0,
  }));
}

function getStageLabel(stage) {
  const labels = {
    queued: "Queued",
    starting: "Starting",
    source: "Getting ready",
    moments: "Understanding input",
    strategy: "Preparing content",
    execution: "Creating results",
    execution_preparing: "Preparing creation",
    execution_writing: "Creating results",
    execution_review: "Improving results",
    execution_polish: "Finalizing results",
    finalizing: "Wrapping up",
    finalize: "Wrapping up",
    completed: "Completed",
    failed: "Stopped",
  };

  return labels[stage] || "Generating";
}

function getAssetStatusCopy(asset) {
  if (asset.status === "completed") {
    return "Finished and ready in your pack.";
  }

  if (asset.status === "active") {
    return "Currently being prepared for you.";
  }

  return "Waiting to be completed next.";
}

function getAssetStatusBadge(status) {
  if (status === "completed") {
    return "Done";
  }
  if (status === "active") {
    return "Live";
  }
  return "Next";
}

function formatElapsed(isoValue) {
  if (!isoValue) {
    return "Just started";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoValue).getTime()) / 1000));
  if (seconds < 5) {
    return "Just started";
  }
  if (seconds < 60) {
    return `${seconds}s elapsed`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s elapsed`;
}

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function getRealLoaderProgress(job, steps, assetProgress) {
  if (!job) {
    return 4;
  }

  if (job.status === "completed") {
    return 100;
  }

  const stepWeight = {
    source: 8,
    moments: 10,
    strategy: 12,
    execution: 60,
    finalize: 10,
  };

  let progress = 2;
  for (const step of steps) {
    if (step.key === "execution") {
      continue;
    }

    const weight = stepWeight[step.key] ?? 0;
    if (step.status === "completed") {
      progress += weight;
    } else if (step.status === "active") {
      progress += weight * 0.55;
    }
  }

  const totalAssets = assetProgress.length;
  if (totalAssets) {
    const perAssetWeight = stepWeight.execution / totalAssets;
    const completedAssets = assetProgress.filter((asset) => asset.status === "completed").length;
    const activeAssets = assetProgress.filter((asset) => asset.status === "active").length;
    progress += completedAssets * perAssetWeight;

    if (activeAssets > 0) {
      progress += getActiveAssetPartial(job, perAssetWeight) * activeAssets;
    }
  } else {
    const executionStep = steps.find((step) => step.key === "execution");
    if (executionStep?.status === "completed") {
      progress += stepWeight.execution;
    } else if (executionStep?.status === "active") {
      progress += stepWeight.execution * 0.4;
    }
  }

  if (job.stage === "finalize" || job.stage === "finalizing") {
    progress = Math.max(progress, 92);
  }

  return clampProgress(progress);
}

function getActiveAssetPartial(job, perAssetWeight) {
  const lastUpdate = job?.updated_at ? new Date(job.updated_at).getTime() : Date.now();
  const secondsSinceUpdate = Math.max(0, (Date.now() - lastUpdate) / 1000);
  const eased = Math.min(0.92, 0.18 + secondsSinceUpdate / 28);
  return perAssetWeight * eased;
}

export default App;
