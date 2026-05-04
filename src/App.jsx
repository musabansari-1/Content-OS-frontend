// // import { useEffect, useRef, useState } from "react";

// // const API_BASE_URL =
// //   import.meta.env.VITE_API_URL ?? "http://localhost:8000";
// // const AUTH_STORAGE_KEY = "contentos-auth";
// // const WORKSPACE_STORAGE_PREFIX = "contentos-workspace-v2";
// // const DEFAULT_ROUTE = "home";

// // function App() {
// //   const [route, setRoute] = useState(() => getRouteFromHash());
// //   const [token, setToken] = useState(() => {
// //     try {
// //       return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}").token ?? "";
// //     } catch {
// //       return "";
// //     }
// //   });
// //   const [user, setUser] = useState(() => {
// //     try {
// //       return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}").user ?? null;
// //     } catch {
// //       return null;
// //     }
// //   });
// //   const [authMode, setAuthMode] = useState("login");
// //   const [authForm, setAuthForm] = useState({
// //     email: "",
// //     password: "",
// //     displayName: "",
// //   });
// //   const [authStatus, setAuthStatus] = useState("idle");
// //   const [authError, setAuthError] = useState("");
// //   const [bootStatus, setBootStatus] = useState(token ? "loading" : "ready");

// //   const [videoInput, setVideoInput] = useState("");
// //   const [generateTranscript, setGenerateTranscript] = useState("");
// //   const [generateStatus, setGenerateStatus] = useState("idle");
// //   const [generateError, setGenerateError] = useState("");
// //   const [generateJob, setGenerateJob] = useState(null);
// //   const [lastGeneratedCount, setLastGeneratedCount] = useState(0);
// //   const [targetAssets, setTargetAssets] = useState([]);
// //   const [selectedAssets, setSelectedAssets] = useState([]);

// //   const [workspaceAssets, setWorkspaceAssets] = useState([]);
// //   const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState("idle");
// //   const [activeAssetId, setActiveAssetId] = useState("");
// //   const [activeBlockId, setActiveBlockId] = useState("");
// //   const [workspaceLoaded, setWorkspaceLoaded] = useState(false);

// //   const [profileMode, setProfileMode] = useState("samples");
// //   const [sampleText, setSampleText] = useState("");
// //   const [youtubeText, setYoutubeText] = useState("");
// //   const [youtubeTranscriptText, setYoutubeTranscriptText] = useState("");
// //   const [profileStatus, setProfileStatus] = useState("idle");
// //   const [profileError, setProfileError] = useState("");
// //   const [voiceProfile, setVoiceProfile] = useState(null);

// //   useEffect(() => {
// //     const syncRoute = () => setRoute(getRouteFromHash());
// //     window.addEventListener("hashchange", syncRoute);
// //     return () => window.removeEventListener("hashchange", syncRoute);
// //   }, []);

// //   useEffect(() => {
// //     let cancelled = false;

// //     async function loadTargetAssets() {
// //       try {
// //         const response = await apiFetch("/target-assets", { method: "GET" });
// //         if (cancelled) {
// //           return;
// //         }

// //         const catalog = Array.isArray(response.target_assets) ? response.target_assets : [];
// //         setTargetAssets(catalog);
// //         setSelectedAssets((current) =>
// //           current.length ? current : catalog.slice(0, 3).map((asset) => asset.asset_type),
// //         );
// //       } catch (error) {
// //         if (!cancelled) {
// //           setGenerateError(error.message);
// //         }
// //       }
// //     }

// //     loadTargetAssets();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, []);

// //   useEffect(() => {
// //     if (!token) {
// //       setBootStatus("ready");
// //       return;
// //     }

// //     let cancelled = false;

// //     async function bootstrap() {
// //       try {
// //         const me = await apiFetch("/me", { method: "GET" }, token);
// //         if (cancelled) {
// //           return;
// //         }

// //         setUser(me);
// //         persistAuth(token, me);

// //         try {
// //           const profile = await apiFetch("/me/voice-profile", { method: "GET" }, token);
// //           if (!cancelled) {
// //             setVoiceProfile(profile);
// //           }
// //         } catch (error) {
// //           if (!cancelled && error.status !== 404) {
// //             setProfileError(error.message);
// //           }
// //         }
// //       } catch (error) {
// //         if (!cancelled) {
// //           clearAuthState();
// //           setAuthError(error.message);
// //         }
// //       } finally {
// //         if (!cancelled) {
// //           setBootStatus("ready");
// //         }
// //       }
// //     }

// //     bootstrap();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [token]);

// //   useEffect(() => {
// //     if (!user) {
// //       return;
// //     }

// //     const storedWorkspace = readWorkspace(user);
// //     if (Array.isArray(storedWorkspace.assets) && storedWorkspace.assets.length) {
// //       setWorkspaceAssets(storedWorkspace.assets);
// //       setActiveAssetId(storedWorkspace.assets[0].id);
// //       setWorkspaceSaveStatus("saved");
// //       setWorkspaceLoaded(true);
// //       return;
// //     }

// //     setWorkspaceAssets([]);
// //     setWorkspaceSaveStatus("idle");
// //     setWorkspaceLoaded(true);
// //   }, [user]);

// //   useEffect(() => {
// //     if (!user || !workspaceLoaded) {
// //       return undefined;
// //     }

// //     setWorkspaceSaveStatus("saving");
// //     const timeoutId = window.setTimeout(() => {
// //       writeWorkspace(user, {
// //         assets: workspaceAssets,
// //         savedAt: new Date().toISOString(),
// //       });
// //       setWorkspaceSaveStatus("saved");
// //     }, 450);

// //     return () => {
// //       window.clearTimeout(timeoutId);
// //     };
// //   }, [user, workspaceAssets, workspaceLoaded]);

// //   useEffect(() => {
// //     if (!token || generateStatus !== "loading" || !generateJob?.id) {
// //       return undefined;
// //     }

// //     let cancelled = false;
// //     let completionTimeoutId;

// //     async function pollJob() {
// //       try {
// //         const job = await apiFetch(`/generation-jobs/${generateJob.id}`, { method: "GET" }, token);
// //         if (cancelled) {
// //           return;
// //         }

// //         setGenerateJob(job);

// //         if (job.status === "completed") {
// //           completionTimeoutId = window.setTimeout(() => {
// //             if (cancelled) {
// //               return;
// //             }

// //             const generatedResults = Array.isArray(job.result?.results) ? job.result.results : [];
// //             const source = buildGenerationSource({
// //               videoInput,
// //               generateTranscript,
// //               selectedAssets,
// //             });
// //             const newAssets = buildWorkspaceAssets(generatedResults, source);

// //             setWorkspaceAssets((current) => [...newAssets, ...current]);
// //             setActiveAssetId(newAssets[0]?.id || "");
// //             setActiveBlockId("");
// //             setLastGeneratedCount(newAssets.length);
// //             setGenerateStatus("success");
// //             navigateTo("workspace");
// //           }, 900);
// //           return;
// //         }

// //         if (job.status === "failed") {
// //           setGenerateStatus("error");
// //           setGenerateError(job.error || job.detail || "Generation failed.");
// //           return;
// //         }

// //         window.setTimeout(pollJob, 1200);
// //       } catch (error) {
// //         if (!cancelled) {
// //           setGenerateStatus("error");
// //           setGenerateError(error.message);
// //         }
// //       }
// //     }

// //     pollJob();

// //     return () => {
// //       cancelled = true;
// //       if (completionTimeoutId) {
// //         window.clearTimeout(completionTimeoutId);
// //       }
// //     };
// //   }, [generateJob?.id, generateStatus, token]);

// //   useEffect(() => {
// //     if (!workspaceAssets.length) {
// //       setActiveAssetId("");
// //       return;
// //     }

// //     const exists = workspaceAssets.some((asset) => asset.id === activeAssetId);
// //     if (!exists) {
// //       setActiveAssetId(workspaceAssets[0].id);
// //     }
// //   }, [workspaceAssets, activeAssetId]);

// //   const selectedAsset = workspaceAssets.find((asset) => asset.id === activeAssetId) ?? null;

// //   const handleAuthChange = (field, value) => {
// //     setAuthForm((current) => ({ ...current, [field]: value }));
// //   };

// //   const handleAssetToggle = (assetType) => {
// //     setSelectedAssets((current) => {
// //       if (current.includes(assetType)) {
// //         return current.filter((item) => item !== assetType);
// //       }

// //       return [...current, assetType];
// //     });
// //   };

// //   const handleGenerateVideoInputChange = (value) => {
// //     setVideoInput(value);
// //     if (value.trim()) {
// //       setGenerateTranscript("");
// //     }
// //   };

// //   const handleGenerateTranscriptChange = (value) => {
// //     setGenerateTranscript(value);
// //     if (value.trim()) {
// //       setVideoInput("");
// //     }
// //   };

// //   const handleYoutubeProfileInputChange = (value) => {
// //     setYoutubeText(value);
// //     if (value.trim()) {
// //       setYoutubeTranscriptText("");
// //     }
// //   };

// //   const handleYoutubeProfileTranscriptChange = (value) => {
// //     setYoutubeTranscriptText(value);
// //     if (value.trim()) {
// //       setYoutubeText("");
// //     }
// //   };

// //   const handleAuthSubmit = async (event) => {
// //     event.preventDefault();

// //     if (!authForm.email.trim() || !authForm.password.trim()) {
// //       setAuthError("Enter your email and password.");
// //       return;
// //     }

// //     setAuthStatus("loading");
// //     setAuthError("");

// //     try {
// //       const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
// //       const payload = {
// //         email: authForm.email.trim(),
// //         password: authForm.password,
// //       };

// //       if (authMode === "register") {
// //         payload.display_name = authForm.displayName.trim();
// //       }

// //       const response = await apiFetch(
// //         endpoint,
// //         {
// //           method: "POST",
// //           body: JSON.stringify(payload),
// //         },
// //       );

// //       persistAuth(response.access_token, response.user);
// //       setToken(response.access_token);
// //       setUser(response.user);
// //       setAuthStatus("success");
// //       setAuthForm({ email: authForm.email, password: "", displayName: "" });
// //     } catch (error) {
// //       setAuthStatus("error");
// //       setAuthError(error.message);
// //     }
// //   };

// //   const handleLogout = () => {
// //     clearAuthState();
// //     setAuthStatus("idle");
// //     setAuthError("");
// //     setProfileError("");
// //     setGenerateError("");
// //     setWorkspaceAssets([]);
// //     setVoiceProfile(null);
// //   };

// //   const handleGenerate = async (event) => {
// //     event.preventDefault();

// //     if (!videoInput.trim() && !generateTranscript.trim()) {
// //       setGenerateError("Paste a YouTube URL/video ID or a transcript to generate content.");
// //       return;
// //     }

// //     if (!selectedAssets.length) {
// //       setGenerateError("Choose at least one asset type.");
// //       return;
// //     }

// //     setGenerateStatus("loading");
// //     setGenerateError("");
// //     setGenerateJob(null);
// //     setLastGeneratedCount(0);

// //     try {
// //       const payload = {
// //         ...buildVideoPayload(videoInput),
// //         transcript: generateTranscript.trim(),
// //         target_assets: selectedAssets,
// //       };

// //       const job = await apiFetch(
// //         "/generation-jobs",
// //         {
// //           method: "POST",
// //           body: JSON.stringify(payload),
// //         },
// //         token,
// //       );
// //       setGenerateJob(job);
// //     } catch (error) {
// //       setGenerateStatus("error");
// //       setGenerateError(error.message);
// //     }
// //   };

// //   const handleSaveSamplesProfile = async (event) => {
// //     event.preventDefault();

// //     const samples = parseSampleBlocks(sampleText);
// //     if (!samples.length) {
// //       setProfileError("Add at least one writing sample or transcript block.");
// //       return;
// //     }

// //     await saveVoiceProfile("/me/voice-profile", { samples });
// //   };

// //   const handleSaveYoutubeProfile = async (event) => {
// //     event.preventDefault();

// //     const youtubeUrls = parseLineItems(youtubeText);
// //     const transcripts = parseSampleBlocks(youtubeTranscriptText);
// //     if (!youtubeUrls.length && !transcripts.length) {
// //       setProfileError("Paste at least one YouTube URL, video ID, or transcript.");
// //       return;
// //     }

// //     await saveVoiceProfile("/me/voice-profile/from-youtube", {
// //       youtube_urls: youtubeUrls.filter((item) => item.startsWith("http")),
// //       youtube_video_ids: youtubeUrls.filter((item) => !item.startsWith("http")),
// //       transcripts,
// //     });
// //   };

// //   const saveVoiceProfile = async (path, payload) => {
// //     setProfileStatus("loading");
// //     setProfileError("");

// //     try {
// //       const profile = await apiFetch(
// //         path,
// //         {
// //           method: "POST",
// //           body: JSON.stringify(payload),
// //         },
// //         token,
// //       );

// //       setVoiceProfile(profile);
// //       setProfileStatus("success");
// //     } catch (error) {
// //       setProfileStatus("error");
// //       setProfileError(error.message);
// //     }
// //   };

// //   const handleBlockChange = (assetId, blockId, value) => {
// //     setWorkspaceAssets((current) =>
// //       current.map((asset) =>
// //         asset.id === assetId
// //           ? {
// //               ...asset,
// //               updatedAt: new Date().toISOString(),
// //               blocks: asset.blocks.map((block) =>
// //                 block.id === blockId
// //                   ? {
// //                       ...block,
// //                       value,
// //                       isDirty: normalizeBlockValue(value) !== normalizeBlockValue(block.originalValue),
// //                     }
// //                   : block,
// //               ),
// //             }
// //           : asset,
// //       ),
// //     );
// //   };

// //   const handleRevertBlock = (assetId, blockId) => {
// //     setWorkspaceAssets((current) =>
// //       current.map((asset) =>
// //         asset.id === assetId
// //           ? {
// //               ...asset,
// //               updatedAt: new Date().toISOString(),
// //               blocks: asset.blocks.map((block) =>
// //                 block.id === blockId
// //                   ? { ...block, value: block.originalValue, isDirty: false }
// //                   : block,
// //               ),
// //             }
// //           : asset,
// //       ),
// //     );
// //   };

// //   const handleDeleteAsset = (assetId) => {
// //     setWorkspaceAssets((current) => current.filter((asset) => asset.id !== assetId));
// //     if (activeAssetId === assetId) {
// //       setActiveAssetId("");
// //       setActiveBlockId("");
// //     }
// //   };

// //   const handleExportWorkspace = async () => {
// //     await navigator.clipboard.writeText(serializeWorkspace(workspaceAssets));
// //   };

// //   if (bootStatus === "loading") {
// //     return (
// //       <div className="app-shell">
// //         <main className="app app-loading">
// //           <div className="panel boot-panel">
// //             <p className="eyebrow">ContentOS</p>
// //             <h1>Loading your workspace</h1>
// //             <p className="muted-copy">
// //               Reconnecting your auth session and voice profile.
// //             </p>
// //           </div>
// //         </main>
// //       </div>
// //     );
// //   }

// //   if (!token || !user) {
// //     return (
// //       <div className="app-shell">
// //         <div className="ambient ambient-1" />
// //         <div className="ambient ambient-2" />

// //         <main className="app auth-layout">
// //           <section className="hero hero-left">
// //             <p className="eyebrow">ContentOS</p>
// //             <h1>
// //               Build once.
// //               <span>Ship the right assets everywhere.</span>
// //             </h1>
// //             <p className="hero-copy">
// //               Create an account, save your creator voice profile, and turn each generation
// //               into a persistent workspace instead of a disposable AI response.
// //             </p>
// //             <div className="hero-pills">
// //               <span>User auth</span>
// //               <span>Saved voice profile</span>
// //               <span>Persistent workspace</span>
// //             </div>
// //           </section>

// //           <section className="panel auth-panel">
// //             <div className="auth-toggle">
// //               <button
// //                 className={authMode === "login" ? "active" : ""}
// //                 onClick={() => setAuthMode("login")}
// //                 type="button"
// //               >
// //                 Login
// //               </button>
// //               <button
// //                 className={authMode === "register" ? "active" : ""}
// //                 onClick={() => setAuthMode("register")}
// //                 type="button"
// //               >
// //                 Register
// //               </button>
// //             </div>

// //             <div className="panel-heading">
// //               <h2>{authMode === "login" ? "Welcome back" : "Create your workspace"}</h2>
// //               <p className="muted-copy">
// //                 {authMode === "login"
// //                   ? "Sign in to access your saved creator voice profile and asset library."
// //                   : "Create an account so your voice profile and workspace stay attached to you."}
// //               </p>
// //             </div>

// //             <form className="stack-form" onSubmit={handleAuthSubmit}>
// //               {authMode === "register" ? (
// //                 <label className="field">
// //                   <span>Display name</span>
// //                   <input
// //                     type="text"
// //                     placeholder="Aman"
// //                     value={authForm.displayName}
// //                     onChange={(event) => handleAuthChange("displayName", event.target.value)}
// //                   />
// //                 </label>
// //               ) : null}

// //               <label className="field">
// //                 <span>Email</span>
// //                 <input
// //                   type="email"
// //                   placeholder="you@example.com"
// //                   value={authForm.email}
// //                   onChange={(event) => handleAuthChange("email", event.target.value)}
// //                 />
// //               </label>

// //               <label className="field">
// //                 <span>Password</span>
// //                 <input
// //                   type="password"
// //                   placeholder="At least 8 characters"
// //                   value={authForm.password}
// //                   onChange={(event) => handleAuthChange("password", event.target.value)}
// //                 />
// //               </label>

// //               <button className="primary-button" type="submit" disabled={authStatus === "loading"}>
// //                 {authStatus === "loading"
// //                   ? authMode === "login"
// //                     ? "Signing in..."
// //                     : "Creating account..."
// //                   : authMode === "login"
// //                     ? "Login"
// //                     : "Create account"}
// //               </button>
// //             </form>

// //             {authError ? <p className="error">{authError}</p> : null}
// //           </section>
// //         </main>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="app-shell">
// //       <div className="ambient ambient-1" />
// //       <div className="ambient ambient-2" />

// //       <main className="app workspace-layout">
// //         {/* <header className="workspace-top">
// //           <div>
// //             <p className="eyebrow">ContentOS</p>
// //             <h1>
// //               Hi, {user.display_name}.
// //               <span>Build a reusable content workspace.</span>
// //             </h1>
// //           </div>

// //           <div className="top-actions">
// //             <nav className="workspace-nav">
// //               <button
// //                 className={`ghost-button ${route === "home" ? "nav-active" : ""}`}
// //                 onClick={() => navigateTo("home")}
// //                 type="button"
// //               >
// //                 Main page
// //               </button>
// //               <button
// //                 className={`ghost-button ${route === "workspace" ? "nav-active" : ""}`}
// //                 onClick={() => navigateTo("workspace")}
// //                 type="button"
// //               >
// //                 Workspace
// //               </button>
// //             </nav>
// //             <div className="user-chip">
// //               <strong>{user.display_name}</strong>
// //               <span>{user.email}</span>
// //             </div>
// //             <button className="ghost-button" onClick={handleLogout} type="button">
// //               Logout
// //             </button>
// //           </div>
// //         </header> */}

// //         <header className="header">
// //   <div className="header-brand">
// //     <div className="brand-mark">CO</div>
// //     <div className="brand-text">
// //       <span className="brand-name">ContentOS</span>
// //       <span className="brand-tagline">Content workspace</span>
// //     </div>
// //   </div>

// //   <div className="header-divider" />

// //   <div className="header-greeting">
// //     <p className="greeting-name">
// //       Hi, <span>{user.display_name}</span>
// //     </p>
// //     <p className="greeting-sub">Create once. Repurpose everywhere.</p>

    
// //   </div>

// //   <nav className="header-nav">
// //     <button
// //       className={`nav-btn ${route === "home" ? "active" : ""}`}
// //       onClick={() => navigateTo("home")}
// //       type="button"
// //     >
// //       Main page
// //     </button>
// //     <button
// //       className={`nav-btn ${route === "workspace" ? "active" : ""}`}
// //       onClick={() => navigateTo("workspace")}
// //       type="button"
// //     >
// //       Workspace
// //     </button>
// //   </nav>

// //   <div className="header-right">
// //     <div className="user-pill">
// //       <div className="user-avatar">
// //         {user.display_name.slice(0, 2).toUpperCase()}
// //       </div>
// //       <div className="user-info">
// //         <span className="user-name">{user.display_name}</span>
// //         <span className="user-email">{user.email}</span>
// //       </div>
// //     </div>

// //     <button className="logout-btn" onClick={handleLogout} type="button">
// //       <svg className="logout-icon" viewBox="0 0 16 16" fill="none">
// //         <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6"
// //           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
// //       </svg>
// //       Logout
// //     </button>
// //   </div>
// // </header>

// //         {route === "workspace" ? (
// //           <WorkspacePage
// //             assets={workspaceAssets}
// //             activeAssetId={activeAssetId}
// //             activeBlockId={activeBlockId}
// //             onSelectAsset={setActiveAssetId}
// //             onSelectBlock={setActiveBlockId}
// //             onBlurBlock={() => setActiveBlockId("")}
// //             onBlockChange={handleBlockChange}
// //             onRevertBlock={handleRevertBlock}
// //             onDeleteAsset={handleDeleteAsset}
// //             onExportWorkspace={handleExportWorkspace}
// //             saveStatus={workspaceSaveStatus}
// //             selectedAsset={selectedAsset}
// //             lastGeneratedCount={lastGeneratedCount}
// //             onGoToMain={() => navigateTo("home")}
// //           />
// //         ) : (
// //           <HomePage
// //             profileMode={profileMode}
// //             setProfileMode={setProfileMode}
// //             sampleText={sampleText}
// //             setSampleText={setSampleText}
// //             youtubeText={youtubeText}
// //             youtubeTranscriptText={youtubeTranscriptText}
// //             profileStatus={profileStatus}
// //             profileError={profileError}
// //             voiceProfile={voiceProfile}
// //             onYoutubeProfileInputChange={handleYoutubeProfileInputChange}
// //             onYoutubeProfileTranscriptChange={handleYoutubeProfileTranscriptChange}
// //             onSaveSamplesProfile={handleSaveSamplesProfile}
// //             onSaveYoutubeProfile={handleSaveYoutubeProfile}
// //             generateStatus={generateStatus}
// //             generateError={generateError}
// //             videoInput={videoInput}
// //             generateTranscript={generateTranscript}
// //             onGenerateVideoInputChange={handleGenerateVideoInputChange}
// //             onGenerateTranscriptChange={handleGenerateTranscriptChange}
// //             targetAssets={targetAssets}
// //             selectedAssets={selectedAssets}
// //             onAssetToggle={handleAssetToggle}
// //             onGenerate={handleGenerate}
// //             workspaceAssets={workspaceAssets}
// //             onGoToWorkspace={() => navigateTo("workspace")}
// //           />
// //         )}
// //       </main>

// //       {generateStatus === "loading" ? (
// //         <GenerationLoader
// //           job={generateJob}
// //           selectedAssets={selectedAssets}
// //           targetAssets={targetAssets}
// //         />
// //       ) : null}
// //     </div>
// //   );
// // }

// // function HomePage({
// //   profileMode,
// //   setProfileMode,
// //   sampleText,
// //   setSampleText,
// //   youtubeText,
// //   youtubeTranscriptText,
// //   profileStatus,
// //   profileError,
// //   voiceProfile,
// //   onYoutubeProfileInputChange,
// //   onYoutubeProfileTranscriptChange,
// //   onSaveSamplesProfile,
// //   onSaveYoutubeProfile,
// //   generateStatus,
// //   generateError,
// //   videoInput,
// //   generateTranscript,
// //   onGenerateVideoInputChange,
// //   onGenerateTranscriptChange,
// //   targetAssets,
// //   selectedAssets,
// //   onAssetToggle,
// //   onGenerate,
// //   workspaceAssets,
// //   onGoToWorkspace,
// // }) {
// //   return (
// //     <>
// //       <section className="workspace-grid">
// //         <article className="panel">
// //           <div className="panel-heading">
// //             <div>
// //               <p className="eyebrow">Voice profile</p>
// //               <h2>Save the writing voice for this account</h2>
// //             </div>
// //             <StatusBadge status={profileStatus} />
// //           </div>

// //           <div className="mode-switch">
// //             <button
// //               className={profileMode === "samples" ? "active" : ""}
// //               type="button"
// //               onClick={() => setProfileMode("samples")}
// //             >
// //               Paste writing samples
// //             </button>
// //             <button
// //               className={profileMode === "youtube" ? "active" : ""}
// //               type="button"
// //               onClick={() => setProfileMode("youtube")}
// //             >
// //               Pull from YouTube
// //             </button>
// //           </div>

// //           {profileMode === "samples" ? (
// //             <form className="stack-form" onSubmit={onSaveSamplesProfile}>
// //               <label className="field">
// //                 <span>Writing samples or transcripts</span>
// //                 <textarea
// //                   rows={10}
// //                   placeholder="Paste one sample, leave a blank line, then paste the next sample."
// //                   value={sampleText}
// //                   onChange={(event) => setSampleText(event.target.value)}
// //                 />
// //               </label>
// //               <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
// //                 {profileStatus === "loading"
// //                   ? "Refining..."
// //                   : voiceProfile
// //                     ? "Refine voice profile"
// //                     : "Save voice profile"}
// //               </button>
// //             </form>
// //           ) : (
// //             <form className="stack-form" onSubmit={onSaveYoutubeProfile}>
// //               <label className="field">
// //                 <span>YouTube URLs or video IDs</span>
// //                 <textarea
// //                   rows={5}
// //                   placeholder="Paste one YouTube URL or video ID per line."
// //                   value={youtubeText}
// //                   onChange={(event) => onYoutubeProfileInputChange(event.target.value)}
// //                 />
// //               </label>
// //               <label className="field">
// //                 <span>Or paste YouTube transcripts</span>
// //                 <textarea
// //                   rows={7}
// //                   placeholder="Paste one transcript, leave a blank line, then paste the next transcript."
// //                   value={youtubeTranscriptText}
// //                   onChange={(event) => onYoutubeProfileTranscriptChange(event.target.value)}
// //                 />
// //               </label>
// //               <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
// //                 {profileStatus === "loading"
// //                   ? "Refining..."
// //                   : voiceProfile
// //                     ? "Refine from YouTube"
// //                     : "Build from YouTube"}
// //               </button>
// //             </form>
// //           )}

// //           {profileError ? <p className="error">{profileError}</p> : null}

// //           {voiceProfile ? (
// //             <div className="profile-summary">
// //               <div className="summary-top">
// //                 <div>
// //                   <p className="eyebrow">Current saved profile</p>
// //                   <h3>Version {voiceProfile.version}</h3>
// //                 </div>
// //                 <span className="summary-tag">
// //                   {voiceProfile.voice_profile_json?.tone?.slice(0, 2).join(" / ") || "Saved"}
// //                 </span>
// //               </div>

// //               <p className="summary-copy">
// //                 {voiceProfile.style_summary || "Your saved voice profile will show here."}
// //               </p>
// //               <p className="muted-copy">
// //                 New samples now refine this profile over time instead of replacing it outright.
// //               </p>

// //               <div className="summary-grid">
// //                 <SummaryList
// //                   title="Voice anchors"
// //                   items={voiceProfile.voice_profile_json?.voice_anchors ?? []}
// //                 />
// //                 <SummaryList
// //                   title="Preferred devices"
// //                   items={voiceProfile.voice_profile_json?.preferred_devices ?? []}
// //                 />
// //                 <SummaryList
// //                   title="Preferred phrases"
// //                   items={voiceProfile.voice_profile_json?.preferred_phrases ?? []}
// //                 />
// //               </div>
// //             </div>
// //           ) : (
// //             <div className="empty-panel">
// //               <h3>No saved voice profile yet</h3>
// //               <p>
// //                 Save writing samples or YouTube transcripts once, and generation
// //                 will reuse that profile for this account automatically.
// //               </p>
// //             </div>
// //           )}
// //         </article>

// //         <article className="panel">
// //           <div className="panel-heading">
// //             <div>
// //               <p className="eyebrow">Generate</p>
// //               <h2>Create the exact assets you need</h2>
// //             </div>
// //             <StatusBadge status={generateStatus} />
// //           </div>

// //           <form className="stack-form" onSubmit={onGenerate}>
// //             <label className="field">
// //               <span>YouTube URL or video ID</span>
// //               <input
// //                 type="text"
// //                 placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ"
// //                 value={videoInput}
// //                 onChange={(event) => onGenerateVideoInputChange(event.target.value)}
// //               />
// //             </label>

// //             <label className="field">
// //               <span>Or paste transcript</span>
// //               <textarea
// //                 rows={6}
// //                 placeholder="Paste the transcript here if the YouTube video cannot be fetched."
// //                 value={generateTranscript}
// //                 onChange={(event) => onGenerateTranscriptChange(event.target.value)}
// //               />
// //             </label>

// //             <div className="field">
// //               <span>Target assets</span>
// //               <div className="asset-grid">
// //                 {targetAssets.map((asset) => (
// //                   <button
// //                     key={asset.asset_type}
// //                     type="button"
// //                     className={`asset-chip ${selectedAssets.includes(asset.asset_type) ? "selected" : ""}`}
// //                     onClick={() => onAssetToggle(asset.asset_type)}
// //                   >
// //                     <strong>{asset.label}</strong>
// //                     <span>{asset.description}</span>
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             <button className="primary-button" type="submit" disabled={generateStatus === "loading"}>
// //               {generateStatus === "loading" ? "Generating..." : "Generate content"}
// //             </button>
// //           </form>

// //           {generateError ? <p className="error">{generateError}</p> : null}

// //           <div className="workspace-preview-card">
// //             <div className="panel-heading compact">
// //               <div>
// //                 <p className="eyebrow">Workspace</p>
// //                 <h3>Your persistent asset library</h3>
// //               </div>
// //               <span className="results-count">{workspaceAssets.length} assets</span>
// //             </div>
// //             <p className="muted-copy">
// //               Every generation gets added to your workspace instead of replacing the previous one.
// //               Open the workspace to edit, reuse, export, or delete any asset.
// //             </p>
// //             <button className="ghost-button" onClick={onGoToWorkspace} type="button">
// //               Open workspace
// //             </button>
// //           </div>
// //         </article>
// //       </section>
// //     </>
// //   );
// // }

// // function WorkspacePage({
// //   assets,
// //   activeAssetId,
// //   activeBlockId,
// //   onSelectAsset,
// //   onSelectBlock,
// //   onBlurBlock,
// //   onBlockChange,
// //   onRevertBlock,
// //   onDeleteAsset,
// //   onExportWorkspace,
// //   saveStatus,
// //   selectedAsset,
// //   lastGeneratedCount,
// //   onGoToMain,
// // }) {
// //   return (
// //     <section className="results-section">
// //       {assets.length ? (
// //         <>
// //           <div className="results-header workspace-results-header">
// //             <div>
// //               <p className="eyebrow">Asset workspace</p>
// //               <h2>Generate, refine, organize, reuse</h2>
// //               <p className="muted-copy">
// //                 This workspace keeps your current and previous generations together in one place.
// //               </p>
// //             </div>
// //             <div className="workspace-results-actions">
// //               {lastGeneratedCount ? (
// //                 <span className="summary-tag">
// //                   {lastGeneratedCount} new {lastGeneratedCount === 1 ? "asset" : "assets"} added
// //                 </span>
// //               ) : null}
// //               <span className={`status-badge status-${saveStatus}`}>
// //                 {getWorkspaceSaveLabel(saveStatus)}
// //               </span>
// //               {/* <button className="ghost-button small" onClick={onExportWorkspace} type="button">
// //                 Copy workspace
// //               </button> */}
// //             </div>
// //           </div>

// //           <div className="workspace-callout">
// //             <strong>Click any content block to edit it.</strong>
// //             <span>Each block autosaves as you type, and you can still copy or revert it anytime.</span>
// //           </div>

// //           <div className="asset-workspace">
// //             <aside className="asset-sidebar">
// //               {assets.map((asset, index) => (
// //                 <button
// //                   key={asset.id}
// //                   className={`asset-outline-item ${asset.id === activeAssetId ? "active" : ""}`}
// //                   onClick={() => onSelectAsset(asset.id)}
// //                   type="button"
// //                 >
// //                   <span className="asset-outline-index">{String(index + 1).padStart(2, "0")}</span>
// //                   <div className="asset-outline-copy">
// //                     <strong>{asset.title}</strong>
// //                     <p>{asset.platformLabel}</p>
// //                     <span>{formatWorkspaceDate(asset.updatedAt || asset.createdAt)}</span>
// //                   </div>
// //                 </button>
// //               ))}
// //             </aside>

// //             {selectedAsset ? (
// //               <article className="asset-document">
// //                 <div className="asset-document-top">
// //                   <div>
// //                     <p className="eyebrow">{selectedAsset.platformLabel}</p>
// //                     <h3>{selectedAsset.title}</h3>
// //                     <p className="muted-copy asset-meta">
// //                       {selectedAsset.sourceLabel}
// //                     </p>
// //                   </div>
// //                   <div className="editable-actions">
// //                     {/* <button
// //                       className="ghost-button small"
// //                       onClick={() => navigator.clipboard.writeText(serializeAsset(selectedAsset))}
// //                       type="button"
// //                     >
// //                       Copy asset
// //                     </button> */}
// //                     <button
// //                       className="ghost-button small danger-button"
// //                       onClick={() => onDeleteAsset(selectedAsset.id)}
// //                       type="button"
// //                     >
// //                       Delete asset
// //                     </button>
// //                   </div>
// //                 </div>

// //                 <div className="asset-blocks">
// //                   {selectedAsset.blocks.map((block) => (
// //                     <EditableBlock
// //                       key={block.id}
// //                       assetId={selectedAsset.id}
// //                       block={block}
// //                       isActive={activeBlockId === block.id}
// //                       onActivate={() => onSelectBlock(block.id)}
// //                       onBlur={onBlurBlock}
// //                       onChange={onBlockChange}
// //                       onRevert={onRevertBlock}
// //                     />
// //                   ))}
// //                 </div>
// //               </article>
// //             ) : null}
// //           </div>
// //         </>
// //       ) : (
// //         <div className="empty-panel large">
// //           <h3>Your workspace is ready for its first asset</h3>
// //           <p>
// //             Generate content from the main page and every asset will be added here as a reusable
// //             editing library.
// //           </p>
// //           <button className="primary-button" onClick={onGoToMain} type="button">
// //             Go to main page
// //           </button>
// //         </div>
// //       )}
// //     </section>
// //   );
// // }

// // function EditableBlock({
// //   assetId,
// //   block,
// //   isActive,
// //   onActivate,
// //   onBlur,
// //   onChange,
// //   onRevert,
// // }) {
// //   const [copied, setCopied] = useState(false);
// //   const textareaRef = useRef(null);

// //   useEffect(() => {
// //     if (isActive && textareaRef.current) {
// //       textareaRef.current.focus();
// //       textareaRef.current.setSelectionRange(
// //         textareaRef.current.value.length,
// //         textareaRef.current.value.length,
// //       );
// //     }
// //   }, [isActive]);

// //   const isList = Array.isArray(block.value);

// //   const handleCopy = async () => {
// //     const content = isList ? block.value.join("\n") : String(block.value ?? "");
// //     await navigator.clipboard.writeText(content);
// //     setCopied(true);
// //     window.setTimeout(() => setCopied(false), 1400);
// //   };

// //   return (
// //     <section className={`editable-block ${isActive ? "active" : ""} ${block.isDirty ? "dirty" : ""}`}>
// //       <div className="editable-block-top">
// //         <div>
// //           <p className="content-label">{block.label}</p>
// //           <span className="editable-block-hint">
// //             {block.kind === "list" ? `${block.value.length} lines` : "Inline editable"}
// //           </span>
// //         </div>
// //         <div className="editable-actions">
// //           {!isActive ? <span className="edit-cue">Click to edit</span> : null}
// //           <button className="ghost-button small" onClick={handleCopy} type="button">
// //             {copied ? "Copied" : "Copy block"}
// //           </button>
// //           <button
// //             className="ghost-button small"
// //             onClick={() => onRevert(assetId, block.id)}
// //             type="button"
// //             disabled={!block.isDirty}
// //           >
// //             Revert
// //           </button>
// //         </div>
// //       </div>

// //       {isActive ? (
// //         <div className="editable-editor same-box-editor">
// //           <textarea
// //             ref={textareaRef}
// //             rows={isList ? Math.max(6, block.value.length + 1) : Math.max(5, estimateRows(block.value))}
// //             value={isList ? block.value.join("\n") : String(block.value ?? "")}
// //             onBlur={onBlur}
// //             onChange={(event) =>
// //               onChange(
// //                 assetId,
// //                 block.id,
// //                 isList ? splitEditableList(event.target.value) : event.target.value,
// //               )
// //             }
// //           />
// //           <p className="muted-copy editor-note">
// //             Autosave is on. Use one line per item for list blocks.
// //           </p>
// //         </div>
// //       ) : (
// //         <button className="editable-preview" onClick={onActivate} type="button">
// //           <span className="editable-overlay-hint">Click to edit</span>
// //           {isList ? (
// //             <div className="content-list">
// //               {block.value.map((item, index) => (
// //                 <p key={`${block.id}-${index}`}>
// //                   <span>{index + 1}</span>
// //                   {item}
// //                 </p>
// //               ))}
// //             </div>
// //           ) : (
// //             <p className="content-text">{String(block.value)}</p>
// //           )}
// //         </button>
// //       )}
// //     </section>
// //   );
// // }

// // function SummaryList({ title, items }) {
// //   return (
// //     <div className="summary-list">
// //       <p className="content-label">{title}</p>
// //       {items.length ? (
// //         items.slice(0, 5).map((item) => <p key={item}>{item}</p>)
// //       ) : (
// //         <p className="muted-copy">No items saved yet.</p>
// //       )}
// //     </div>
// //   );
// // }

// // function StatusBadge({ status }) {
// //   const labelMap = {
// //     idle: "Ready",
// //     loading: "Working",
// //     success: "Saved",
// //     error: "Error",
// //   };

// //   return <span className={`status-badge status-${status}`}>{labelMap[status] ?? "Ready"}</span>;
// // }

// // function GenerationLoader({ job, selectedAssets, targetAssets }) {
// //   const stageLabel = getStageLabel(job?.stage);
// //   const elapsed = formatElapsed(job?.created_at);
// //   const steps = Array.isArray(job?.steps) && job.steps.length
// //     ? job.steps
// //     : [
// //         { key: "source", label: "Getting ready", status: "active" },
// //         { key: "moments", label: "Understanding input", status: "pending" },
// //         { key: "strategy", label: "Preparing content", status: "pending" },
// //         { key: "execution", label: "Creating results", status: "pending" },
// //         { key: "finalize", label: "Wrapping up", status: "pending" },
// //       ];
// //   const assetProgress = buildAssetProgress(job?.asset_progress, selectedAssets, targetAssets);
// //   const realProgress = getRealLoaderProgress(job, steps, assetProgress);
// //   const [displayProgress, setDisplayProgress] = useState(realProgress);
// //   const progressPercent = Math.round(displayProgress);
// //   const completedAssets = assetProgress.filter((asset) => asset.status === "completed").length;
// //   const totalAssets = assetProgress.length;

// //   useEffect(() => {
// //     setDisplayProgress(realProgress);
// //   }, [job?.id]);

// //   useEffect(() => {
// //     if (!job) {
// //       return undefined;
// //     }

// //     const intervalId = window.setInterval(() => {
// //       setDisplayProgress((current) => {
// //         const target = getRealLoaderProgress(job, steps, assetProgress);

// //         if (job.status === "completed") {
// //           return Math.min(100, current + 3.5);
// //         }

// //         if (job.status === "failed") {
// //           return current;
// //         }

// //         if (current < target) {
// //           const jump = Math.max(0.5, (target - current) * 0.28);
// //           return clampProgress(Math.min(target, current + jump));
// //         }

// //         if (current > target) {
// //           return clampProgress(Math.max(target, current - 0.8));
// //         }

// //         return current;
// //       });
// //     }, 180);

// //     return () => {
// //       window.clearInterval(intervalId);
// //     };
// //   }, [job?.id, job?.status, job?.stage, job?.progress_percent, job?.updated_at]);

// //   return (
// //     <div className="loader-overlay">
// //       <div className="loader-card">
// //         <div className="loader-orb" />
// //         <p className="loader-badge">ContentOS is generating</p>
// //         <h2>Building your asset pack</h2>
// //         <p className="loader-copy">
// //           {job?.detail || "Your request is in progress and the final content is on the way."}
// //         </p>

// //         <div className="loader-progress-shell">
// //           <div className="loader-progress-top">
// //             <strong>{stageLabel}</strong>
// //             <span>{progressPercent}%</span>
// //           </div>
// //           <div className="loader-progress-bar">
// //             <div
// //               className="loader-progress-fill"
// //               style={{ width: `${progressPercent}%` }}
// //             />
// //           </div>
// //           <div className="loader-progress-meta">
// //             <span>{job?.message || "Starting generation..."}</span>
// //             <span>{totalAssets ? `${completedAssets}/${totalAssets} ready` : elapsed}</span>
// //           </div>
// //         </div>

// //         <div className="loader-steps">
// //           {steps.map((step) => (
// //             <div
// //               key={step.key}
// //               className={`loader-step loader-step-${step.status || "pending"}`}
// //             >
// //               <span />
// //               <p>{step.label}</p>
// //             </div>
// //           ))}
// //         </div>

// //         <div className="loader-assets">
// //           {assetProgress.map((asset) => (
// //             <div key={asset.asset_type} className={`loader-asset loader-asset-${asset.status}`}>
// //               <div>
// //                 <strong>{asset.label}</strong>
// //                 <p>{getAssetStatusCopy(asset)}</p>
// //               </div>
// //               <span>{getAssetStatusBadge(asset.status)}</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // async function apiFetch(path, options = {}, token = "") {
// //   const headers = {
// //     "Content-Type": "application/json",
// //     ...(options.headers ?? {}),
// //   };

// //   if (token) {
// //     headers.Authorization = `Bearer ${token}`;
// //   }

// //   const response = await fetch(`${API_BASE_URL}${path}`, {
// //     ...options,
// //     headers,
// //   });

// //   const data = await response.json().catch(() => ({}));

// //   if (!response.ok) {
// //     const error = new Error(data.detail || "Request failed.");
// //     error.status = response.status;
// //     throw error;
// //   }

// //   return data;
// // }

// // function getRouteFromHash() {
// //   const hash = window.location.hash.replace(/^#/, "");
// //   return hash === "/workspace" ? "workspace" : DEFAULT_ROUTE;
// // }

// // function navigateTo(nextRoute) {
// //   const nextHash = nextRoute === "workspace" ? "#/workspace" : "#/";
// //   if (window.location.hash !== nextHash) {
// //     window.location.hash = nextHash;
// //   }
// // }

// // function buildVideoPayload(value) {
// //   const trimmed = value.trim();
// //   if (!trimmed) {
// //     return {};
// //   }
// //   if (trimmed.startsWith("http")) {
// //     return { video_url: trimmed };
// //   }
// //   return { video_id: trimmed };
// // }

// // function parseSampleBlocks(value) {
// //   return value
// //     .split(/\n\s*\n/g)
// //     .map((item) => item.trim())
// //     .filter(Boolean);
// // }

// // function parseLineItems(value) {
// //   return value
// //     .split("\n")
// //     .map((item) => item.trim())
// //     .filter(Boolean);
// // }

// // function persistAuth(nextToken, nextUser) {
// //   localStorage.setItem(
// //     AUTH_STORAGE_KEY,
// //     JSON.stringify({ token: nextToken, user: nextUser }),
// //   );
// // }

// // function clearAuthState() {
// //   localStorage.removeItem(AUTH_STORAGE_KEY);
// //   window.location.reload();
// // }

// // function safeParse(output) {
// //   try {
// //     return typeof output === "string" ? JSON.parse(output) : output;
// //   } catch {
// //     return { raw: output };
// //   }
// // }

// // function formatLabel(label) {
// //   return label.replaceAll("_", " ");
// // }

// // function formatAssetLabel(assetType) {
// //   return assetType.replaceAll("_", " ");
// // }

// // function getPlatformHook(platform) {
// //   const hooks = {
// //     twitter: "Thread draft",
// //     tiktok: "Short-form script",
// //     youtube: "Video angle",
// //     linkedin: "Professional post",
// //     instagram: "Instagram asset",
// //     blog: "Blog draft",
// //     reddit: "Reddit post",
// //     email: "Newsletter draft",
// //   };

// //   return hooks[platform] ?? "Generated asset";
// // }

// // function buildGenerationSource({ videoInput, generateTranscript, selectedAssets }) {
// //   if (videoInput.trim()) {
// //     return `Generated from ${truncateText(videoInput.trim(), 68)} for ${selectedAssets.length} selected asset types.`;
// //   }

// //   return `Generated from pasted transcript for ${selectedAssets.length} selected asset types.`;
// // }

// // function buildWorkspaceAssets(results, sourceLabel) {
// //   return results.map((result, index) => {
// //     const data = safeParse(result.output);
// //     const now = new Date().toISOString();
// //     const title = result.asset_type
// //       ? formatAssetLabel(result.asset_type)
// //       : getPlatformHook(result.platform);

// //     return {
// //       id: buildAssetId(result, index),
// //       title,
// //       platformLabel: capitalize(result.platform || "generated"),
// //       assetType: result.asset_type || "generic",
// //       sourceLabel,
// //       createdAt: now,
// //       updatedAt: now,
// //       blocks: buildBlocksFromOutput(data),
// //     };
// //   });
// // }

// // function buildBlocksFromOutput(data) {
// //   return Object.entries(data).map(([key, value], index) => ({
// //     id: `${key}-${index}-${generateLocalId()}`,
// //     key,
// //     label: formatLabel(key),
// //     kind: Array.isArray(value) ? "list" : "text",
// //     value: Array.isArray(value) ? value.map(formatListItemValue) : formatTextBlockValue(value),
// //     originalValue: Array.isArray(value) ? value.map(formatListItemValue) : formatTextBlockValue(value),
// //     isDirty: false,
// //   }));
// // }

// // function formatTextBlockValue(value) {
// //   if (value === null || value === undefined) {
// //     return "";
// //   }

// //   if (typeof value === "string") {
// //     return value;
// //   }

// //   if (typeof value === "number" || typeof value === "boolean") {
// //     return String(value);
// //   }

// //   if (Array.isArray(value)) {
// //     return value.map(formatListItemValue).join("\n");
// //   }

// //   const readable = extractReadableObjectText(value);
// //   if (readable) {
// //     return readable;
// //   }

// //   return safeStringify(value);
// // }

// // function formatListItemValue(value) {
// //   const text = formatTextBlockValue(value);
// //   return text
// //     .split("\n")
// //     .map((line) => line.trim())
// //     .filter(Boolean)
// //     .join(" ");
// // }

// // function extractReadableObjectText(value) {
// //   if (!value || typeof value !== "object") {
// //     return "";
// //   }

// //   const preferredKeys = [
// //     "text",
// //     "content",
// //     "body",
// //     "summary",
// //     "caption",
// //     "title",
// //     "value",
// //   ];

// //   for (const key of preferredKeys) {
// //     const candidate = value[key];
// //     if (typeof candidate === "string" && candidate.trim()) {
// //       return candidate.trim();
// //     }
// //   }

// //   const nestedCollections = ["paragraphs", "sections", "blocks", "items"];
// //   for (const key of nestedCollections) {
// //     if (!Array.isArray(value[key])) {
// //       continue;
// //     }

// //     const combined = value[key]
// //       .map(formatTextBlockValue)
// //       .map((item) => item.trim())
// //       .filter(Boolean)
// //       .join("\n\n");

// //     if (combined) {
// //       return combined;
// //     }
// //   }

// //   return "";
// // }

// // function safeStringify(value) {
// //   try {
// //     return JSON.stringify(value, null, 2);
// //   } catch {
// //     return String(value ?? "");
// //   }
// // }

// // function buildAssetId(result, index) {
// //   return `${result.platform || "platform"}-${result.asset_type || "asset"}-${index}-${generateLocalId()}`;
// // }

// // function generateLocalId() {
// //   return Math.random().toString(36).slice(2, 9);
// // }

// // function getWorkspaceStorageKey(user) {
// //   const identifier = user?.id || user?.email || "anonymous";
// //   return `${WORKSPACE_STORAGE_PREFIX}:${identifier}`;
// // }

// // function readWorkspace(user) {
// //   try {
// //     return JSON.parse(localStorage.getItem(getWorkspaceStorageKey(user)) ?? "{}");
// //   } catch {
// //     return {};
// //   }
// // }

// // function writeWorkspace(user, payload) {
// //   localStorage.setItem(getWorkspaceStorageKey(user), JSON.stringify(payload));
// // }

// // function serializeWorkspace(assets) {
// //   return assets.map(serializeAsset).join("\n\n");
// // }

// // function serializeAsset(asset) {
// //   const lines = [`${asset.title} (${asset.platformLabel})`, `${asset.sourceLabel}`, ""];

// //   for (const block of asset.blocks) {
// //     lines.push(`${block.label}:`);
// //     if (Array.isArray(block.value)) {
// //       for (const item of block.value) {
// //         lines.push(`- ${item}`);
// //       }
// //     } else {
// //       lines.push(String(block.value));
// //     }
// //     lines.push("");
// //   }

// //   return lines.join("\n").trim();
// // }

// // function normalizeBlockValue(value) {
// //   return Array.isArray(value)
// //     ? value.map((item) => item.trim()).join("\n")
// //     : String(value ?? "").trim();
// // }

// // function splitEditableList(value) {
// //   return value
// //     .split("\n")
// //     .map((item) => item.trim())
// //     .filter(Boolean);
// // }

// // function estimateRows(value) {
// //   return String(value ?? "").split("\n").length + 1;
// // }

// // function getWorkspaceSaveLabel(status) {
// //   if (status === "saving") {
// //     return "Autosaving";
// //   }
// //   if (status === "saved") {
// //     return "Saved locally";
// //   }
// //   if (status === "error") {
// //     return "Save issue";
// //   }
// //   return "Ready";
// // }

// // function capitalize(value) {
// //   if (!value) {
// //     return "";
// //   }

// //   return value.charAt(0).toUpperCase() + value.slice(1);
// // }

// // function truncateText(value, maxLength) {
// //   if (value.length <= maxLength) {
// //     return value;
// //   }

// //   return `${value.slice(0, maxLength - 1)}…`;
// // }

// // function formatWorkspaceDate(value) {
// //   if (!value) {
// //     return "Saved recently";
// //   }

// //   return new Intl.DateTimeFormat(undefined, {
// //     month: "short",
// //     day: "numeric",
// //     hour: "numeric",
// //     minute: "2-digit",
// //   }).format(new Date(value));
// // }

// // function buildAssetProgress(jobAssets, selectedAssets, targetAssets) {
// //   if (Array.isArray(jobAssets) && jobAssets.length) {
// //     return jobAssets;
// //   }

// //   const labelByAsset = Object.fromEntries(
// //     targetAssets.map((asset) => [asset.asset_type, asset.label]),
// //   );

// //   return selectedAssets.map((assetType) => ({
// //     asset_type: assetType,
// //     label: labelByAsset[assetType] || formatAssetLabel(assetType),
// //     status: "pending",
// //     attempt: 0,
// //   }));
// // }

// // function getStageLabel(stage) {
// //   const labels = {
// //     queued: "Queued",
// //     starting: "Starting",
// //     source: "Getting ready",
// //     moments: "Understanding input",
// //     strategy: "Preparing content",
// //     execution: "Creating results",
// //     execution_preparing: "Preparing creation",
// //     execution_writing: "Creating results",
// //     execution_review: "Improving results",
// //     execution_polish: "Finalizing results",
// //     finalizing: "Wrapping up",
// //     finalize: "Wrapping up",
// //     completed: "Completed",
// //     failed: "Stopped",
// //   };

// //   return labels[stage] || "Generating";
// // }

// // function getAssetStatusCopy(asset) {
// //   if (asset.status === "completed") {
// //     return "Finished and ready in your pack.";
// //   }

// //   if (asset.status === "active") {
// //     return "Currently being prepared for you.";
// //   }

// //   return "Waiting to be completed next.";
// // }

// // function getAssetStatusBadge(status) {
// //   if (status === "completed") {
// //     return "Done";
// //   }
// //   if (status === "active") {
// //     return "Live";
// //   }
// //   return "Next";
// // }

// // function formatElapsed(isoValue) {
// //   if (!isoValue) {
// //     return "Just started";
// //   }

// //   const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoValue).getTime()) / 1000));
// //   if (seconds < 5) {
// //     return "Just started";
// //   }
// //   if (seconds < 60) {
// //     return `${seconds}s elapsed`;
// //   }

// //   const minutes = Math.floor(seconds / 60);
// //   const remainder = seconds % 60;
// //   return `${minutes}m ${remainder}s elapsed`;
// // }

// // function clampProgress(value) {
// //   return Math.max(0, Math.min(100, Number(value) || 0));
// // }

// // function getRealLoaderProgress(job, steps, assetProgress) {
// //   if (!job) {
// //     return 4;
// //   }

// //   if (job.status === "completed") {
// //     return 100;
// //   }

// //   const stepWeight = {
// //     source: 8,
// //     moments: 10,
// //     strategy: 12,
// //     execution: 60,
// //     finalize: 10,
// //   };

// //   let progress = 2;
// //   for (const step of steps) {
// //     if (step.key === "execution") {
// //       continue;
// //     }

// //     const weight = stepWeight[step.key] ?? 0;
// //     if (step.status === "completed") {
// //       progress += weight;
// //     } else if (step.status === "active") {
// //       progress += weight * 0.55;
// //     }
// //   }

// //   const totalAssets = assetProgress.length;
// //   if (totalAssets) {
// //     const perAssetWeight = stepWeight.execution / totalAssets;
// //     const completedAssets = assetProgress.filter((asset) => asset.status === "completed").length;
// //     const activeAssets = assetProgress.filter((asset) => asset.status === "active").length;
// //     progress += completedAssets * perAssetWeight;

// //     if (activeAssets > 0) {
// //       progress += getActiveAssetPartial(job, perAssetWeight) * activeAssets;
// //     }
// //   } else {
// //     const executionStep = steps.find((step) => step.key === "execution");
// //     if (executionStep?.status === "completed") {
// //       progress += stepWeight.execution;
// //     } else if (executionStep?.status === "active") {
// //       progress += stepWeight.execution * 0.4;
// //     }
// //   }

// //   if (job.stage === "finalize" || job.stage === "finalizing") {
// //     progress = Math.max(progress, 92);
// //   }

// //   return clampProgress(progress);
// // }

// // function getActiveAssetPartial(job, perAssetWeight) {
// //   const lastUpdate = job?.updated_at ? new Date(job.updated_at).getTime() : Date.now();
// //   const secondsSinceUpdate = Math.max(0, (Date.now() - lastUpdate) / 1000);
// //   const eased = Math.min(0.92, 0.18 + secondsSinceUpdate / 28);
// //   return perAssetWeight * eased;
// // }

// // export default App;




// // import { useEffect, useRef, useState } from "react";

// // const API_BASE_URL =
// //   import.meta.env.VITE_API_URL ?? "http://localhost:8000";
// // const AUTH_STORAGE_KEY = "contentos-auth";
// // const WORKSPACE_STORAGE_PREFIX = "contentos-workspace-v2";
// // const DEFAULT_ROUTE = "home";

// // function App() {
// //   const [route, setRoute] = useState(() => getRouteFromHash());
// //   const [token, setToken] = useState(() => {
// //     try {
// //       return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}").token ?? "";
// //     } catch {
// //       return "";
// //     }
// //   });
// //   const [user, setUser] = useState(() => {
// //     try {
// //       return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}").user ?? null;
// //     } catch {
// //       return null;
// //     }
// //   });
// //   const [authMode, setAuthMode] = useState("login");
// //   const [authForm, setAuthForm] = useState({
// //     email: "",
// //     password: "",
// //     displayName: "",
// //   });
// //   const [authStatus, setAuthStatus] = useState("idle");
// //   const [authError, setAuthError] = useState("");
// //   const [bootStatus, setBootStatus] = useState(token ? "loading" : "ready");

// //   const [videoInput, setVideoInput] = useState("");
// //   const [generateTranscript, setGenerateTranscript] = useState("");
// //   const [generateStatus, setGenerateStatus] = useState("idle");
// //   const [generateError, setGenerateError] = useState("");
// //   const [generateJob, setGenerateJob] = useState(null);
// //   const [lastGeneratedCount, setLastGeneratedCount] = useState(0);
// //   const [targetAssets, setTargetAssets] = useState([]);
// //   const [selectedAssets, setSelectedAssets] = useState([]);

// //   const [workspaceAssets, setWorkspaceAssets] = useState([]);
// //   const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState("idle");
// //   const [activeAssetId, setActiveAssetId] = useState("");
// //   const [activeBlockId, setActiveBlockId] = useState("");
// //   const [workspaceLoaded, setWorkspaceLoaded] = useState(false);

// //   const [profileMode, setProfileMode] = useState("samples");
// //   const [sampleText, setSampleText] = useState("");
// //   const [youtubeText, setYoutubeText] = useState("");
// //   const [youtubeTranscriptText, setYoutubeTranscriptText] = useState("");
// //   const [profileStatus, setProfileStatus] = useState("idle");
// //   const [profileError, setProfileError] = useState("");
// //   const [voiceProfile, setVoiceProfile] = useState(null);

// //   useEffect(() => {
// //     const syncRoute = () => setRoute(getRouteFromHash());
// //     window.addEventListener("hashchange", syncRoute);
// //     return () => window.removeEventListener("hashchange", syncRoute);
// //   }, []);

// //   useEffect(() => {
// //     let cancelled = false;

// //     async function loadTargetAssets() {
// //       try {
// //         const response = await apiFetch("/target-assets", { method: "GET" });
// //         if (cancelled) {
// //           return;
// //         }

// //         const catalog = Array.isArray(response.target_assets) ? response.target_assets : [];
// //         setTargetAssets(catalog);
// //         setSelectedAssets((current) =>
// //           current.length ? current : catalog.slice(0, 3).map((asset) => asset.asset_type),
// //         );
// //       } catch (error) {
// //         if (!cancelled) {
// //           setGenerateError(error.message);
// //         }
// //       }
// //     }

// //     loadTargetAssets();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, []);

// //   useEffect(() => {
// //     if (!token) {
// //       setBootStatus("ready");
// //       return;
// //     }

// //     let cancelled = false;

// //     async function bootstrap() {
// //       try {
// //         const me = await apiFetch("/me", { method: "GET" }, token);
// //         if (cancelled) {
// //           return;
// //         }

// //         setUser(me);
// //         persistAuth(token, me);

// //         try {
// //           const profile = await apiFetch("/me/voice-profile", { method: "GET" }, token);
// //           if (!cancelled) {
// //             setVoiceProfile(profile);
// //           }
// //         } catch (error) {
// //           if (!cancelled && error.status !== 404) {
// //             setProfileError(error.message);
// //           }
// //         }
// //       } catch (error) {
// //         if (!cancelled) {
// //           clearAuthState();
// //           setAuthError(error.message);
// //         }
// //       } finally {
// //         if (!cancelled) {
// //           setBootStatus("ready");
// //         }
// //       }
// //     }

// //     bootstrap();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [token]);

// //   useEffect(() => {
// //     if (!user) {
// //       return;
// //     }

// //     const storedWorkspace = readWorkspace(user);
// //     if (Array.isArray(storedWorkspace.assets) && storedWorkspace.assets.length) {
// //       setWorkspaceAssets(storedWorkspace.assets);
// //       setActiveAssetId(storedWorkspace.assets[0].id);
// //       setWorkspaceSaveStatus("saved");
// //       setWorkspaceLoaded(true);
// //       return;
// //     }

// //     setWorkspaceAssets([]);
// //     setWorkspaceSaveStatus("idle");
// //     setWorkspaceLoaded(true);
// //   }, [user]);

// //   useEffect(() => {
// //     if (!user || !workspaceLoaded) {
// //       return undefined;
// //     }

// //     setWorkspaceSaveStatus("saving");
// //     const timeoutId = window.setTimeout(() => {
// //       writeWorkspace(user, {
// //         assets: workspaceAssets,
// //         savedAt: new Date().toISOString(),
// //       });
// //       setWorkspaceSaveStatus("saved");
// //     }, 450);

// //     return () => {
// //       window.clearTimeout(timeoutId);
// //     };
// //   }, [user, workspaceAssets, workspaceLoaded]);

// //   useEffect(() => {
// //     if (!token || generateStatus !== "loading" || !generateJob?.id) {
// //       return undefined;
// //     }

// //     let cancelled = false;
// //     let completionTimeoutId;

// //     async function pollJob() {
// //       try {
// //         const job = await apiFetch(`/generation-jobs/${generateJob.id}`, { method: "GET" }, token);
// //         if (cancelled) {
// //           return;
// //         }

// //         setGenerateJob(job);

// //         if (job.status === "completed") {
// //           completionTimeoutId = window.setTimeout(() => {
// //             if (cancelled) {
// //               return;
// //             }

// //             const generatedResults = Array.isArray(job.result?.results) ? job.result.results : [];
// //             const source = buildGenerationSource({
// //               videoInput,
// //               generateTranscript,
// //               selectedAssets,
// //             });
// //             const newAssets = buildWorkspaceAssets(generatedResults, source);

// //             setWorkspaceAssets((current) => [...newAssets, ...current]);
// //             setActiveAssetId(newAssets[0]?.id || "");
// //             setActiveBlockId("");
// //             setLastGeneratedCount(newAssets.length);
// //             setGenerateStatus("success");
// //             navigateTo("workspace");
// //           }, 900);
// //           return;
// //         }

// //         if (job.status === "failed") {
// //           setGenerateStatus("error");
// //           setGenerateError(job.error || job.detail || "Generation failed.");
// //           return;
// //         }

// //         window.setTimeout(pollJob, 1200);
// //       } catch (error) {
// //         if (!cancelled) {
// //           setGenerateStatus("error");
// //           setGenerateError(error.message);
// //         }
// //       }
// //     }

// //     pollJob();

// //     return () => {
// //       cancelled = true;
// //       if (completionTimeoutId) {
// //         window.clearTimeout(completionTimeoutId);
// //       }
// //     };
// //   }, [generateJob?.id, generateStatus, token]);

// //   useEffect(() => {
// //     if (!workspaceAssets.length) {
// //       setActiveAssetId("");
// //       return;
// //     }

// //     const exists = workspaceAssets.some((asset) => asset.id === activeAssetId);
// //     if (!exists) {
// //       setActiveAssetId(workspaceAssets[0].id);
// //     }
// //   }, [workspaceAssets, activeAssetId]);

// //   const selectedAsset = workspaceAssets.find((asset) => asset.id === activeAssetId) ?? null;

// //   const handleAuthChange = (field, value) => {
// //     setAuthForm((current) => ({ ...current, [field]: value }));
// //   };

// //   const handleAssetToggle = (assetType) => {
// //     setSelectedAssets((current) => {
// //       if (current.includes(assetType)) {
// //         return current.filter((item) => item !== assetType);
// //       }

// //       return [...current, assetType];
// //     });
// //   };

// //   const handleGenerateVideoInputChange = (value) => {
// //     setVideoInput(value);
// //     if (value.trim()) {
// //       setGenerateTranscript("");
// //     }
// //   };

// //   const handleGenerateTranscriptChange = (value) => {
// //     setGenerateTranscript(value);
// //     if (value.trim()) {
// //       setVideoInput("");
// //     }
// //   };

// //   const handleYoutubeProfileInputChange = (value) => {
// //     setYoutubeText(value);
// //     if (value.trim()) {
// //       setYoutubeTranscriptText("");
// //     }
// //   };

// //   const handleYoutubeProfileTranscriptChange = (value) => {
// //     setYoutubeTranscriptText(value);
// //     if (value.trim()) {
// //       setYoutubeText("");
// //     }
// //   };

// //   const handleAuthSubmit = async (event) => {
// //     event.preventDefault();

// //     if (!authForm.email.trim() || !authForm.password.trim()) {
// //       setAuthError("Enter your email and password.");
// //       return;
// //     }

// //     setAuthStatus("loading");
// //     setAuthError("");

// //     try {
// //       const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
// //       const payload = {
// //         email: authForm.email.trim(),
// //         password: authForm.password,
// //       };

// //       if (authMode === "register") {
// //         payload.display_name = authForm.displayName.trim();
// //       }

// //       const response = await apiFetch(
// //         endpoint,
// //         {
// //           method: "POST",
// //           body: JSON.stringify(payload),
// //         },
// //       );

// //       persistAuth(response.access_token, response.user);
// //       setToken(response.access_token);
// //       setUser(response.user);
// //       setAuthStatus("success");
// //       setAuthForm({ email: authForm.email, password: "", displayName: "" });
// //     } catch (error) {
// //       setAuthStatus("error");
// //       setAuthError(error.message);
// //     }
// //   };

// //   const handleLogout = () => {
// //     clearAuthState();
// //     setAuthStatus("idle");
// //     setAuthError("");
// //     setProfileError("");
// //     setGenerateError("");
// //     setWorkspaceAssets([]);
// //     setVoiceProfile(null);
// //   };

// //   const handleGenerate = async (event) => {
// //     event.preventDefault();

// //     if (!videoInput.trim() && !generateTranscript.trim()) {
// //       setGenerateError("Paste a YouTube URL/video ID or a transcript to generate content.");
// //       return;
// //     }

// //     if (!selectedAssets.length) {
// //       setGenerateError("Choose at least one asset type.");
// //       return;
// //     }

// //     setGenerateStatus("loading");
// //     setGenerateError("");
// //     setGenerateJob(null);
// //     setLastGeneratedCount(0);

// //     try {
// //       const payload = {
// //         ...buildVideoPayload(videoInput),
// //         transcript: generateTranscript.trim(),
// //         target_assets: selectedAssets,
// //       };

// //       const job = await apiFetch(
// //         "/generation-jobs",
// //         {
// //           method: "POST",
// //           body: JSON.stringify(payload),
// //         },
// //         token,
// //       );
// //       setGenerateJob(job);
// //     } catch (error) {
// //       setGenerateStatus("error");
// //       setGenerateError(error.message);
// //     }
// //   };

// //   const handleSaveSamplesProfile = async (event) => {
// //     event.preventDefault();

// //     const samples = parseSampleBlocks(sampleText);
// //     if (!samples.length) {
// //       setProfileError("Add at least one writing sample or transcript block.");
// //       return;
// //     }

// //     await saveVoiceProfile("/me/voice-profile", { samples });
// //   };

// //   const handleSaveYoutubeProfile = async (event) => {
// //     event.preventDefault();

// //     const youtubeUrls = parseLineItems(youtubeText);
// //     const transcripts = parseSampleBlocks(youtubeTranscriptText);
// //     if (!youtubeUrls.length && !transcripts.length) {
// //       setProfileError("Paste at least one YouTube URL, video ID, or transcript.");
// //       return;
// //     }

// //     await saveVoiceProfile("/me/voice-profile/from-youtube", {
// //       youtube_urls: youtubeUrls.filter((item) => item.startsWith("http")),
// //       youtube_video_ids: youtubeUrls.filter((item) => !item.startsWith("http")),
// //       transcripts,
// //     });
// //   };

// //   const saveVoiceProfile = async (path, payload) => {
// //     setProfileStatus("loading");
// //     setProfileError("");

// //     try {
// //       const profile = await apiFetch(
// //         path,
// //         {
// //           method: "POST",
// //           body: JSON.stringify(payload),
// //         },
// //         token,
// //       );

// //       setVoiceProfile(profile);
// //       setProfileStatus("success");
// //     } catch (error) {
// //       setProfileStatus("error");
// //       setProfileError(error.message);
// //     }
// //   };

// //   const handleBlockChange = (assetId, blockId, value) => {
// //     setWorkspaceAssets((current) =>
// //       current.map((asset) =>
// //         asset.id === assetId
// //           ? {
// //               ...asset,
// //               updatedAt: new Date().toISOString(),
// //               blocks: asset.blocks.map((block) =>
// //                 block.id === blockId
// //                   ? {
// //                       ...block,
// //                       value,
// //                       isDirty: normalizeBlockValue(value) !== normalizeBlockValue(block.originalValue),
// //                     }
// //                   : block,
// //               ),
// //             }
// //           : asset,
// //       ),
// //     );
// //   };

// //   const handleAssetStatusChange = (assetId, newStatus) => {
// //     setWorkspaceAssets((current) =>
// //       current.map((asset) =>
// //         asset.id === assetId
// //           ? {
// //               ...asset,
// //               status: newStatus,
// //               updatedAt: new Date().toISOString(),
// //             }
// //           : asset,
// //       ),
// //     );
// //   };

// //   const handleRevertBlock = (assetId, blockId) => {
// //     setWorkspaceAssets((current) =>
// //       current.map((asset) =>
// //         asset.id === assetId
// //           ? {
// //               ...asset,
// //               updatedAt: new Date().toISOString(),
// //               blocks: asset.blocks.map((block) =>
// //                 block.id === blockId
// //                   ? { ...block, value: block.originalValue, isDirty: false }
// //                   : block,
// //               ),
// //             }
// //           : asset,
// //       ),
// //     );
// //   };

// //   const handleDeleteAsset = (assetId) => {
// //     setWorkspaceAssets((current) => current.filter((asset) => asset.id !== assetId));
// //     if (activeAssetId === assetId) {
// //       setActiveAssetId("");
// //       setActiveBlockId("");
// //     }
// //   };

// //   const handleExportWorkspace = async () => {
// //     await navigator.clipboard.writeText(serializeWorkspace(workspaceAssets));
// //   };

// //   if (bootStatus === "loading") {
// //     return (
// //       <div className="app-shell">
// //         <main className="app app-loading">
// //           <div className="panel boot-panel">
// //             <p className="eyebrow">ContentOS</p>
// //             <h1>Loading your workspace</h1>
// //             <p className="muted-copy">
// //               Reconnecting your auth session and voice profile.
// //             </p>
// //           </div>
// //         </main>
// //       </div>
// //     );
// //   }

// //   if (!token || !user) {
// //     return (
// //       <div className="app-shell">
// //         <div className="ambient ambient-1" />
// //         <div className="ambient ambient-2" />

// //         <main className="app auth-layout">
// //           <section className="hero hero-left">
// //             <p className="eyebrow">ContentOS</p>
// //             <h1>
// //               Build once.
// //               <span>Ship the right assets everywhere.</span>
// //             </h1>
// //             <p className="hero-copy">
// //               Create an account, save your creator voice profile, and turn each generation
// //               into a persistent workspace instead of a disposable AI response.
// //             </p>
// //             <div className="hero-pills">
// //               <span>User auth</span>
// //               <span>Saved voice profile</span>
// //               <span>Persistent workspace</span>
// //             </div>
// //           </section>

// //           <section className="panel auth-panel">
// //             <div className="auth-toggle">
// //               <button
// //                 className={authMode === "login" ? "active" : ""}
// //                 onClick={() => setAuthMode("login")}
// //                 type="button"
// //               >
// //                 Login
// //               </button>
// //               <button
// //                 className={authMode === "register" ? "active" : ""}
// //                 onClick={() => setAuthMode("register")}
// //                 type="button"
// //               >
// //                 Register
// //               </button>
// //             </div>

// //             <div className="panel-heading">
// //               <h2>{authMode === "login" ? "Welcome back" : "Create your workspace"}</h2>
// //               <p className="muted-copy">
// //                 {authMode === "login"
// //                   ? "Sign in to access your saved creator voice profile and asset library."
// //                   : "Create an account so your voice profile and workspace stay attached to you."}
// //               </p>
// //             </div>

// //             <form className="stack-form" onSubmit={handleAuthSubmit}>
// //               {authMode === "register" ? (
// //                 <label className="field">
// //                   <span>Display name</span>
// //                   <input
// //                     type="text"
// //                     placeholder="Aman"
// //                     value={authForm.displayName}
// //                     onChange={(event) => handleAuthChange("displayName", event.target.value)}
// //                   />
// //                 </label>
// //               ) : null}

// //               <label className="field">
// //                 <span>Email</span>
// //                 <input
// //                   type="email"
// //                   placeholder="you@example.com"
// //                   value={authForm.email}
// //                   onChange={(event) => handleAuthChange("email", event.target.value)}
// //                 />
// //               </label>

// //               <label className="field">
// //                 <span>Password</span>
// //                 <input
// //                   type="password"
// //                   placeholder="At least 8 characters"
// //                   value={authForm.password}
// //                   onChange={(event) => handleAuthChange("password", event.target.value)}
// //                 />
// //               </label>

// //               <button className="primary-button" type="submit" disabled={authStatus === "loading"}>
// //                 {authStatus === "loading"
// //                   ? authMode === "login"
// //                     ? "Signing in..."
// //                     : "Creating account..."
// //                   : authMode === "login"
// //                     ? "Login"
// //                     : "Create account"}
// //               </button>
// //             </form>

// //             {authError ? <p className="error">{authError}</p> : null}
// //           </section>
// //         </main>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="app-shell">
// //       <div className="ambient ambient-1" />
// //       <div className="ambient ambient-2" />

// //       <main className="app workspace-layout">
// //         <header className="header">
// //           <div className="header-brand">
// //             <div className="brand-mark">CO</div>
// //             <div className="brand-text">
// //               <span className="brand-name">ContentOS</span>
// //               <span className="brand-tagline">Content workspace</span>
// //             </div>
// //           </div>

// //           <div className="header-divider" />

// //           <div className="header-greeting">
// //             <p className="greeting-name">
// //               Hi, <span>{user.display_name}</span>
// //             </p>
// //             <p className="greeting-sub">Create once. Repurpose everywhere.</p>
// //           </div>

// //           <nav className="header-nav">
// //             <button
// //               className={`nav-btn ${route === "home" ? "active" : ""}`}
// //               onClick={() => navigateTo("home")}
// //               type="button"
// //             >
// //               Main page
// //             </button>
// //             <button
// //               className={`nav-btn ${route === "workspace" ? "active" : ""}`}
// //               onClick={() => navigateTo("workspace")}
// //               type="button"
// //             >
// //               Workspace
// //             </button>
// //           </nav>

// //           <div className="header-right">
// //             <div className="user-pill">
// //               <div className="user-avatar">
// //                 {user.display_name.slice(0, 2).toUpperCase()}
// //               </div>
// //               <div className="user-info">
// //                 <span className="user-name">{user.display_name}</span>
// //                 <span className="user-email">{user.email}</span>
// //               </div>
// //             </div>

// //             <button className="logout-btn" onClick={handleLogout} type="button">
// //               <svg className="logout-icon" viewBox="0 0 16 16" fill="none">
// //                 <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6"
// //                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
// //               </svg>
// //               Logout
// //             </button>
// //           </div>
// //         </header>

// //         {route === "workspace" ? (
// //           <WorkspacePage
// //             assets={workspaceAssets}
// //             activeAssetId={activeAssetId}
// //             activeBlockId={activeBlockId}
// //             onSelectAsset={setActiveAssetId}
// //             onSelectAssetStatus={handleAssetStatusChange}
// //             onSelectBlock={setActiveBlockId}
// //             onBlurBlock={() => setActiveBlockId("")}
// //             onBlockChange={handleBlockChange}
// //             onRevertBlock={handleRevertBlock}
// //             onDeleteAsset={handleDeleteAsset}
// //             onStatusChange={handleAssetStatusChange}
// //             onExportWorkspace={handleExportWorkspace}
// //             saveStatus={workspaceSaveStatus}
// //             selectedAsset={selectedAsset}
// //             lastGeneratedCount={lastGeneratedCount}
// //             onGoToMain={() => navigateTo("home")}
// //           />
// //         ) : (
// //           <HomePage
// //             profileMode={profileMode}
// //             setProfileMode={setProfileMode}
// //             sampleText={sampleText}
// //             setSampleText={setSampleText}
// //             youtubeText={youtubeText}
// //             youtubeTranscriptText={youtubeTranscriptText}
// //             profileStatus={profileStatus}
// //             profileError={profileError}
// //             voiceProfile={voiceProfile}
// //             onYoutubeProfileInputChange={handleYoutubeProfileInputChange}
// //             onYoutubeProfileTranscriptChange={handleYoutubeProfileTranscriptChange}
// //             onSaveSamplesProfile={handleSaveSamplesProfile}
// //             onSaveYoutubeProfile={handleSaveYoutubeProfile}
// //             generateStatus={generateStatus}
// //             generateError={generateError}
// //             videoInput={videoInput}
// //             generateTranscript={generateTranscript}
// //             onGenerateVideoInputChange={handleGenerateVideoInputChange}
// //             onGenerateTranscriptChange={handleGenerateTranscriptChange}
// //             targetAssets={targetAssets}
// //             selectedAssets={selectedAssets}
// //             onAssetToggle={handleAssetToggle}
// //             onGenerate={handleGenerate}
// //             workspaceAssets={workspaceAssets}
// //             onGoToWorkspace={() => navigateTo("workspace")}
// //           />
// //         )}
// //       </main>

// //       {generateStatus === "loading" ? (
// //         <GenerationLoader
// //           job={generateJob}
// //           selectedAssets={selectedAssets}
// //           targetAssets={targetAssets}
// //         />
// //       ) : null}
// //     </div>
// //   );
// // }

// // function HomePage({
// //   profileMode,
// //   setProfileMode,
// //   sampleText,
// //   setSampleText,
// //   youtubeText,
// //   youtubeTranscriptText,
// //   profileStatus,
// //   profileError,
// //   voiceProfile,
// //   onYoutubeProfileInputChange,
// //   onYoutubeProfileTranscriptChange,
// //   onSaveSamplesProfile,
// //   onSaveYoutubeProfile,
// //   generateStatus,
// //   generateError,
// //   videoInput,
// //   generateTranscript,
// //   onGenerateVideoInputChange,
// //   onGenerateTranscriptChange,
// //   targetAssets,
// //   selectedAssets,
// //   onAssetToggle,
// //   onGenerate,
// //   workspaceAssets,
// //   onGoToWorkspace,
// // }) {
// //   return (
// //     <>
// //       <section className="workspace-grid">
// //         <article className="panel">
// //           <div className="panel-heading">
// //             <div>
// //               <p className="eyebrow">Voice profile</p>
// //               <h2>Save the writing voice for this account</h2>
// //             </div>
// //             <StatusBadge status={profileStatus} />
// //           </div>

// //           <div className="mode-switch">
// //             <button
// //               className={profileMode === "samples" ? "active" : ""}
// //               type="button"
// //               onClick={() => setProfileMode("samples")}
// //             >
// //               Paste writing samples
// //             </button>
// //             <button
// //               className={profileMode === "youtube" ? "active" : ""}
// //               type="button"
// //               onClick={() => setProfileMode("youtube")}
// //             >
// //               Pull from YouTube
// //             </button>
// //           </div>

// //           {profileMode === "samples" ? (
// //             <form className="stack-form" onSubmit={onSaveSamplesProfile}>
// //               <label className="field">
// //                 <span>Writing samples or transcripts</span>
// //                 <textarea
// //                   rows={10}
// //                   placeholder="Paste one sample, leave a blank line, then paste the next sample."
// //                   value={sampleText}
// //                   onChange={(event) => setSampleText(event.target.value)}
// //                 />
// //               </label>
// //               <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
// //                 {profileStatus === "loading"
// //                   ? "Refining..."
// //                   : voiceProfile
// //                     ? "Refine voice profile"
// //                     : "Save voice profile"}
// //               </button>
// //             </form>
// //           ) : (
// //             <form className="stack-form" onSubmit={onSaveYoutubeProfile}>
// //               <label className="field">
// //                 <span>YouTube URLs or video IDs</span>
// //                 <textarea
// //                   rows={5}
// //                   placeholder="Paste one YouTube URL or video ID per line."
// //                   value={youtubeText}
// //                   onChange={(event) => onYoutubeProfileInputChange(event.target.value)}
// //                 />
// //               </label>
// //               <label className="field">
// //                 <span>Or paste YouTube transcripts</span>
// //                 <textarea
// //                   rows={7}
// //                   placeholder="Paste one transcript, leave a blank line, then paste the next transcript."
// //                   value={youtubeTranscriptText}
// //                   onChange={(event) => onYoutubeProfileTranscriptChange(event.target.value)}
// //                 />
// //               </label>
// //               <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
// //                 {profileStatus === "loading"
// //                   ? "Refining..."
// //                   : voiceProfile
// //                     ? "Refine from YouTube"
// //                     : "Build from YouTube"}
// //               </button>
// //             </form>
// //           )}

// //           {profileError ? <p className="error">{profileError}</p> : null}

// //           {voiceProfile ? (
// //             <div className="profile-summary">
// //               <div className="summary-top">
// //                 <div>
// //                   <p className="eyebrow">Current saved profile</p>
// //                   <h3>Version {voiceProfile.version}</h3>
// //                 </div>
// //                 <span className="summary-tag">
// //                   {voiceProfile.voice_profile_json?.tone?.slice(0, 2).join(" / ") || "Saved"}
// //                 </span>
// //               </div>

// //               <p className="summary-copy">
// //                 {voiceProfile.style_summary || "Your saved voice profile will show here."}
// //               </p>
// //               <p className="muted-copy">
// //                 New samples now refine this profile over time instead of replacing it outright.
// //               </p>

// //               <div className="summary-grid">
// //                 <SummaryList
// //                   title="Voice anchors"
// //                   items={voiceProfile.voice_profile_json?.voice_anchors ?? []}
// //                 />
// //                 <SummaryList
// //                   title="Preferred devices"
// //                   items={voiceProfile.voice_profile_json?.preferred_devices ?? []}
// //                 />
// //                 <SummaryList
// //                   title="Preferred phrases"
// //                   items={voiceProfile.voice_profile_json?.preferred_phrases ?? []}
// //                 />
// //               </div>
// //             </div>
// //           ) : (
// //             <div className="empty-panel">
// //               <h3>No saved voice profile yet</h3>
// //               <p>
// //                 Save writing samples or YouTube transcripts once, and generation
// //                 will reuse that profile for this account automatically.
// //               </p>
// //             </div>
// //           )}
// //         </article>

// //         <article className="panel">
// //           <div className="panel-heading">
// //             <div>
// //               <p className="eyebrow">Generate</p>
// //               <h2>Create the exact assets you need</h2>
// //             </div>
// //             <StatusBadge status={generateStatus} />
// //           </div>

// //           <form className="stack-form" onSubmit={onGenerate}>
// //             <label className="field">
// //               <span>YouTube URL or video ID</span>
// //               <input
// //                 type="text"
// //                 placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ"
// //                 value={videoInput}
// //                 onChange={(event) => onGenerateVideoInputChange(event.target.value)}
// //               />
// //             </label>

// //             <label className="field">
// //               <span>Or paste transcript</span>
// //               <textarea
// //                 rows={6}
// //                 placeholder="Paste the transcript here if the YouTube video cannot be fetched."
// //                 value={generateTranscript}
// //                 onChange={(event) => onGenerateTranscriptChange(event.target.value)}
// //               />
// //             </label>

// //             <div className="field">
// //               <span>Target assets</span>
// //               <div className="asset-grid">
// //                 {targetAssets.map((asset) => (
// //                   <button
// //                     key={asset.asset_type}
// //                     type="button"
// //                     className={`asset-chip ${selectedAssets.includes(asset.asset_type) ? "selected" : ""}`}
// //                     onClick={() => onAssetToggle(asset.asset_type)}
// //                   >
// //                     <strong>{asset.label}</strong>
// //                     <span>{asset.description}</span>
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             <button className="primary-button" type="submit" disabled={generateStatus === "loading"}>
// //               {generateStatus === "loading" ? "Generating..." : "Generate content"}
// //             </button>
// //           </form>

// //           {generateError ? <p className="error">{generateError}</p> : null}

// //           <div className="workspace-preview-card">
// //             <div className="panel-heading compact">
// //               <div>
// //                 <p className="eyebrow">Workspace</p>
// //                 <h3>Your persistent asset library</h3>
// //               </div>
// //               <span className="results-count">{workspaceAssets.length} assets</span>
// //             </div>
// //             <p className="muted-copy">
// //               Every generation gets added to your workspace instead of replacing the previous one.
// //               Open the workspace to edit, reuse, export, or delete any asset.
// //             </p>
// //             <button className="ghost-button" onClick={onGoToWorkspace} type="button">
// //               Open workspace
// //             </button>
// //           </div>
// //         </article>
// //       </section>
// //     </>
// //   );
// // }

// // // ─── StatusDropdown: lightweight status selector ───
// // function StatusDropdown({ status, onSelect }) {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const dropdownRef = useRef(null);

// //   useEffect(() => {
// //     function handleClickOutside(event) {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// //         setIsOpen(false);
// //       }
// //     }
// //     if (isOpen) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     }
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, [isOpen]);

// //   const statusOptions = [
// //     { value: ASSET_STATUS_DRAFT, label: "Draft", description: "Needs review or edits" },
// //     { value: ASSET_STATUS_READY, label: "Ready", description: "Approved and publish-ready" },
// //     { value: ASSET_STATUS_PUBLISHED, label: "Published", description: "Already used" },
// //   ];

// //   const currentOption = statusOptions.find((s) => s.value === status) || statusOptions[0];

// //   return (
// //     <div className="status-dropdown" ref={dropdownRef}>
// //       <button
// //         className={`status-dropdown-toggle status-${status}`}
// //         onClick={() => setIsOpen(!isOpen)}
// //         type="button"
// //         aria-label={`Set status to ${currentOption.label}`}
// //       >
// //         <span className="status-label">{currentOption.label}</span>
// //       </button>
// //       {isOpen && (
// //         <ul className="status-dropdown-menu">
// //           {statusOptions.map((option) => (
// //             <li key={option.value}>
// //               <button
// //                 className={`status-menu-item ${option.value === status ? "active" : ""}`}
// //                 onClick={() => {
// //                   onSelect(option.value);
// //                   setIsOpen(false);
// //                 }}
// //                 type="button"
// //               >
// //                 <span className="status-menu-label">{option.label}</span>
// //                 <span className="status-menu-desc">{option.description}</span>
// //               </button>
// //             </li>
// //           ))}
// //         </ul>
// //       )}
// //     </div>
// //   );
// // }

// // // ─── AssetOutlineItem: asset item with inline status dropdown ───
// // function AssetOutlineItem({ asset, isActive, onSelectAsset, onSelectAssetStatus }) {
// //   const [isStatusOpen, setIsStatusOpen] = useState(false);
// //   const statusDropdownRef = useRef(null);

// //   useEffect(() => {
// //     function handleClickOutside(event) {
// //       if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
// //         setIsStatusOpen(false);
// //       }
// //     }
// //     if (isStatusOpen) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     }
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, [isStatusOpen]);

// //   const statusOptions = [
// //     { value: ASSET_STATUS_DRAFT, label: "Draft", icon: "○" },
// //     { value: ASSET_STATUS_READY, label: "Ready", icon: "◐" },
// //     { value: ASSET_STATUS_PUBLISHED, label: "Published", icon: "●" },
// //   ];

// //   return (
// //     <button
// //       key={asset.id}
// //       className={`asset-outline-item status-${asset.status} ${isActive ? "active" : ""}`}
// //       onClick={() => onSelectAsset(asset.id)}
// //       type="button"
// //     >
// //       <div className="asset-outline-header">
// //         <div className="asset-outline-info">
// //           <strong>{asset.title}</strong>
// //           <p>{asset.platformLabel}</p>
// //         </div>
// //         <div className="asset-outline-status-dropdown" ref={statusDropdownRef}>
// //           <button
// //             type="button"
// //             className={`asset-status-dropdown-btn status-${asset.status}`}
// //             onClick={(e) => {
// //               e.stopPropagation();
// //               setIsStatusOpen(!isStatusOpen);
// //             }}
// //             title="Click to change status"
// //           >
// //             <span className="asset-status-badge">{formatAssetStatus(asset.status)}</span>
// //             <span className="asset-status-chevron" aria-hidden="true">
// //               {isStatusOpen ? "▲" : "▼"}
// //             </span>
// //           </button>
// //           {isStatusOpen && (
// //             <div className="asset-status-inline-menu">
// //               {statusOptions.map((option) => (
// //                 <button
// //                   key={option.value}
// //                   type="button"
// //                   className={`asset-status-menu-option ${asset.status === option.value ? "active" : ""}`}
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     onSelectAssetStatus(asset.id, option.value);
// //                     setIsStatusOpen(false);
// //                   }}
// //                   title={`Mark as ${option.label}`}
// //                 >
// //                   <span className="asset-status-option-icon">{option.icon}</span>
// //                   <span>{option.label}</span>
// //                 </button>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //       <span className="asset-outline-date">{formatWorkspaceDate(asset.updatedAt || asset.createdAt)}</span>
// //     </button>
// //   );
// // }

// // function AssetGroup({
// //   title,
// //   assets,
// //   activeAssetId,
// //   onSelectAsset,
// //   onSelectAssetStatus,
// //   showCollapsedByDefault = false,
// // }) {
// //   const [isCollapsed, setIsCollapsed] = useState(showCollapsedByDefault);

// //   useEffect(() => {
// //     setIsCollapsed(showCollapsedByDefault);
// //   }, [showCollapsedByDefault]);

// //   const count = assets.length;
// //   const groupStatus =
// //     title === "Draft"
// //       ? ASSET_STATUS_DRAFT
// //       : title === "Ready to Publish"
// //         ? ASSET_STATUS_READY
// //         : ASSET_STATUS_PUBLISHED;

// //   return (
// //     <section className={`asset-group asset-group-${groupStatus}`}>
// //       <header className="asset-group-header">
// //         <button
// //           className="asset-group-toggle"
// //           type="button"
// //           onClick={() => setIsCollapsed((current) => !current)}
// //           aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${title}`}
// //         >
// //           <span className={`asset-group-dot status-${groupStatus}`} aria-hidden="true" />
// //           <strong className="asset-group-title">{title}</strong>
// //           <span className="asset-group-count">{count}</span>
// //           <span className="asset-group-chevron" aria-hidden="true">
// //             {isCollapsed ? "▸" : "▾"}
// //           </span>
// //         </button>
// //       </header>

// //       {!isCollapsed ? (
// //         <div className="asset-group-list">
// //           {count ? (
// //             assets.map((asset) => (
// //               <AssetOutlineItem
// //                 key={asset.id}
// //                 asset={asset}
// //                 isActive={asset.id === activeAssetId}
// //                 onSelectAsset={onSelectAsset}
// //                 onSelectAssetStatus={onSelectAssetStatus}
// //               />
// //             ))
// //           ) : (
// //             <div className="asset-group-empty">
// //               <p className="muted-copy">No assets in this section yet.</p>
// //             </div>
// //           )}
// //         </div>
// //       ) : null}
// //     </section>
// //   );
// // }

// // function WorkspacePage({
// //   assets,
// //   activeAssetId,
// //   activeBlockId,
// //   onSelectAsset,
// //   onSelectAssetStatus,
// //   onSelectBlock,
// //   onBlurBlock,
// //   onBlockChange,
// //   onRevertBlock,
// //   onDeleteAsset,
// //   onStatusChange,
// //   onExportWorkspace,
// //   saveStatus,
// //   selectedAsset,
// //   lastGeneratedCount,
// //   onGoToMain,
// // }) {
// //   return (
// //     <section className="results-section">
// //       {assets.length ? (
// //         <>
// //           <div className="results-header workspace-results-header">
// //             <div>
// //               <p className="eyebrow">Asset workspace</p>
// //               <h2>Generate, refine, organize, reuse</h2>
// //               <p className="muted-copy">
// //                 This workspace keeps your current and previous generations together in one place.
// //               </p>
// //             </div>
// //             <div className="workspace-results-actions">
// //               {lastGeneratedCount ? (
// //                 <span className="summary-tag">
// //                   {lastGeneratedCount} new {lastGeneratedCount === 1 ? "asset" : "assets"} added
// //                 </span>
// //               ) : null}
// //               <span className={`status-badge status-${saveStatus}`}>
// //                 {getWorkspaceSaveLabel(saveStatus)}
// //               </span>
// //             </div>
// //           </div>

// //           <div className="workspace-callout">
// //             <strong>Click any content block to edit it.</strong>
// //             <span>Each block autosaves as you type, and you can still copy or revert it anytime.</span>
// //           </div>

// //           <div className="asset-workspace">
// //             <div className="asset-group-section">
// //               {/* Draft Assets */}
// //               <AssetGroup
// //                 title="Draft"
// //                 assets={assets.filter((a) => a.status === ASSET_STATUS_DRAFT)}
// //                 activeAssetId={activeAssetId}
// //                 onSelectAsset={onSelectAsset}
// //                 onSelectAssetStatus={onSelectAssetStatus}
// //               />
// //               {/* Ready Assets */}
// //               <AssetGroup
// //                 title="Ready to Publish"
// //                 assets={assets.filter((a) => a.status === ASSET_STATUS_READY)}
// //                 activeAssetId={activeAssetId}
// //                 onSelectAsset={onSelectAsset}
// //                 onSelectAssetStatus={onSelectAssetStatus}
// //               />
// //               {/* Published Assets */}
// //               <AssetGroup
// //                 title="Published"
// //                 assets={assets.filter((a) => a.status === ASSET_STATUS_PUBLISHED)}
// //                 activeAssetId={activeAssetId}
// //                 onSelectAsset={onSelectAsset}
// //                 onSelectAssetStatus={onSelectAssetStatus}
// //                 showCollapsedByDefault={true}
// //               />
// //             </div>

// //             {selectedAsset ? (
// //               <article className="asset-document">
// //                 <div className="asset-document-top">
// //                   <div>
// //                     <p className="eyebrow">{selectedAsset.platformLabel}</p>
// //                     <h3>{selectedAsset.title}</h3>
// //                     <p className="muted-copy asset-meta">
// //                       {selectedAsset.sourceLabel}
// //                     </p>
// //                   </div>
// //                   <div className="asset-controls">
// //                     <StatusDropdown
// //                       status={selectedAsset.status}
// //                       onSelect={(newStatus) => onStatusChange(selectedAsset.id, newStatus)}
// //                     />
// //                     <button
// //                       className="ghost-button small danger-button"
// //                       onClick={() => onDeleteAsset(selectedAsset.id)}
// //                       type="button"
// //                     >
// //                       Delete asset
// //                     </button>
// //                   </div>
// //                 </div>

// //                 <div className="asset-blocks">
// //                   {selectedAsset.blocks.map((block) => (
// //                     <EditableBlock
// //                       key={block.id}
// //                       assetId={selectedAsset.id}
// //                       block={block}
// //                       isActive={activeBlockId === block.id}
// //                       onActivate={() => onSelectBlock(block.id)}
// //                       onBlur={onBlurBlock}
// //                       onChange={onBlockChange}
// //                       onRevert={onRevertBlock}
// //                     />
// //                   ))}
// //                 </div>
// //               </article>
// //             ) : null}
// //           </div>
// //         </>
// //       ) : (
// //         <div className="empty-panel large">
// //           <h3>Your workspace is ready for its first asset</h3>
// //           <p>
// //             Generate content from the main page and every asset will be added here as a reusable
// //             editing library.
// //           </p>
// //           <button className="primary-button" onClick={onGoToMain} type="button">
// //             Go to main page
// //           </button>
// //         </div>
// //       )}
// //     </section>
// //   );
// // }

// // // ─── Helper: check if a list item is a structured object (e.g. blog section) ───
// // function isStructuredObject(item) {
// //   return item !== null && typeof item === "object" && !Array.isArray(item);
// // }

// // // ─── Helper: serialize a structured object to editable text ───
// // function serializeStructuredItem(item) {
// //   const titleText = typeof item.title === "string" ? item.title.trim() : "";
// //   const bodyKey = ["body", "content", "text", "summary", "caption"].find(
// //     (k) => typeof item[k] === "string" && item[k].trim(),
// //   );
// //   const bodyText = bodyKey ? item[bodyKey].trim() : "";
// //   const parts = [];
// //   if (titleText) parts.push(titleText);
// //   if (bodyText) parts.push(bodyText);
// //   return parts.join("\n");
// // }

// // // ─── Helper: serialize a full list (mixed strings and objects) to textarea text ───
// // function serializeListToText(list) {
// //   return list
// //     .map((item) =>
// //       isStructuredObject(item) ? serializeStructuredItem(item) : String(item ?? ""),
// //     )
// //     .join("\n\n");
// // }

// // function EditableBlock({
// //   assetId,
// //   block,
// //   isActive,
// //   onActivate,
// //   onBlur,
// //   onChange,
// //   onRevert,
// // }) {
// //   const [copied, setCopied] = useState(false);
// //   const textareaRef = useRef(null);

// //   useEffect(() => {
// //     if (isActive && textareaRef.current) {
// //       textareaRef.current.focus();
// //       textareaRef.current.setSelectionRange(
// //         textareaRef.current.value.length,
// //         textareaRef.current.value.length,
// //       );
// //     }
// //   }, [isActive]);

// //   const isList = Array.isArray(block.value);

// //   // Detect whether any list item is a structured object (e.g. blog sections)
// //   const hasStructuredItems = isList && block.value.some(isStructuredObject);

// //   const handleCopy = async () => {
// //     let content;
// //     if (isList) {
// //       content = hasStructuredItems
// //         ? serializeListToText(block.value)
// //         : block.value.join("\n");
// //     } else {
// //       content = String(block.value ?? "");
// //     }
// //     await navigator.clipboard.writeText(content);
// //     setCopied(true);
// //     window.setTimeout(() => setCopied(false), 1400);
// //   };

// //   // Textarea value: structured objects get serialized to "title\nbody" blocks
// //   const textareaValue = isList
// //     ? serializeListToText(block.value)
// //     : String(block.value ?? "");

// //   // Row estimate for textarea
// //   const textareaRows = isList
// //     ? Math.max(6, textareaValue.split("\n").length + 1)
// //     : Math.max(5, estimateRows(block.value));

// //   return (
// //     <section className={`editable-block ${isActive ? "active" : ""} ${block.isDirty ? "dirty" : ""}`}>
// //       <div className="editable-block-top">
// //         <div>
// //           <p className="content-label">{block.label}</p>
// //           <span className="editable-block-hint">
// //             {block.kind === "list"
// //               ? hasStructuredItems
// //                 ? `${block.value.length} sections`
// //                 : `${block.value.length} lines`
// //               : "Inline editable"}
// //           </span>
// //         </div>
// //         <div className="editable-actions">
// //           {!isActive ? <span className="edit-cue">Click to edit</span> : null}
// //           <button className="ghost-button small" onClick={handleCopy} type="button">
// //             {copied ? "Copied" : "Copy block"}
// //           </button>
// //           <button
// //             className="ghost-button small"
// //             onClick={() => onRevert(assetId, block.id)}
// //             type="button"
// //             disabled={!block.isDirty}
// //           >
// //             Revert
// //           </button>
// //         </div>
// //       </div>

// //       {isActive ? (
// //         <div className="editable-editor same-box-editor">
// //           <textarea
// //             ref={textareaRef}
// //             rows={textareaRows}
// //             value={textareaValue}
// //             onBlur={onBlur}
// //             onChange={(event) => {
// //               if (hasStructuredItems) {
// //                 // Keep as plain string list when user edits structured content
// //                 onChange(assetId, block.id, splitEditableList(event.target.value));
// //               } else if (isList) {
// //                 onChange(assetId, block.id, splitEditableList(event.target.value));
// //               } else {
// //                 onChange(assetId, block.id, event.target.value);
// //               }
// //             }}
// //           />
// //           <p className="muted-copy editor-note">
// //             {hasStructuredItems
// //               ? "Each section: title on first line, body below. Blank line separates sections."
// //               : "Autosave is on. Use one line per item for list blocks."}
// //           </p>
// //         </div>
// //       ) : (
// //         <button className="editable-preview" onClick={onActivate} type="button">
// //           <span className="editable-overlay-hint">Click to edit</span>
// //           {isList ? (
// //             hasStructuredItems ? (
// //               // ── Structured list: render each item as heading + body ──
// //               <div className="content-sections">
// //                 {block.value.map((item, index) =>
// //                   isStructuredObject(item) ? (
// //                     <div key={`${block.id}-${index}`} className="content-section-item">
// //                       {item.title && (
// //                         <strong className="section-item-title">{item.title}</strong>
// //                       )}
// //                       {(item.body || item.content || item.text) && (
// //                         <p className="section-item-body">
// //                           {item.body || item.content || item.text}
// //                         </p>
// //                       )}
// //                     </div>
// //                   ) : (
// //                     <p key={`${block.id}-${index}`} className="content-section-plain">
// //                       {String(item ?? "")}
// //                     </p>
// //                   ),
// //                 )}
// //               </div>
// //             ) : (
// //               // ── Plain list: original numbered rendering ──
// //               <div className="content-list">
// //                 {block.value.map((item, index) => (
// //                   <p key={`${block.id}-${index}`}>
// //                     <span>{index + 1}</span>
// //                     {item}
// //                   </p>
// //                 ))}
// //               </div>
// //             )
// //           ) : (
// //             <p className="content-text">{String(block.value)}</p>
// //           )}
// //         </button>
// //       )}
// //     </section>
// //   );
// // }

// // function SummaryList({ title, items }) {
// //   return (
// //     <div className="summary-list">
// //       <p className="content-label">{title}</p>
// //       {items.length ? (
// //         items.slice(0, 5).map((item) => <p key={item}>{item}</p>)
// //       ) : (
// //         <p className="muted-copy">No items saved yet.</p>
// //       )}
// //     </div>
// //   );
// // }

// // function StatusBadge({ status }) {
// //   const labelMap = {
// //     idle: "Ready",
// //     loading: "Working",
// //     success: "Saved",
// //     error: "Error",
// //   };

// //   return <span className={`status-badge status-${status}`}>{labelMap[status] ?? "Ready"}</span>;
// // }

// // function GenerationLoader({ job, selectedAssets, targetAssets }) {
// //   const stageLabel = getStageLabel(job?.stage);
// //   const elapsed = formatElapsed(job?.created_at);
// //   const steps = Array.isArray(job?.steps) && job.steps.length
// //     ? job.steps
// //     : [
// //         { key: "source", label: "Getting ready", status: "active" },
// //         { key: "moments", label: "Understanding input", status: "pending" },
// //         { key: "strategy", label: "Preparing content", status: "pending" },
// //         { key: "execution", label: "Creating results", status: "pending" },
// //         { key: "finalize", label: "Wrapping up", status: "pending" },
// //       ];
// //   const assetProgress = buildAssetProgress(job?.asset_progress, selectedAssets, targetAssets);
// //   const realProgress = getRealLoaderProgress(job, steps, assetProgress);
// //   const [displayProgress, setDisplayProgress] = useState(realProgress);
// //   const progressPercent = Math.round(displayProgress);
// //   const completedAssets = assetProgress.filter((asset) => asset.status === "completed").length;
// //   const totalAssets = assetProgress.length;

// //   useEffect(() => {
// //     setDisplayProgress(realProgress);
// //   }, [job?.id]);

// //   useEffect(() => {
// //     if (!job) {
// //       return undefined;
// //     }

// //     const intervalId = window.setInterval(() => {
// //       setDisplayProgress((current) => {
// //         const target = getRealLoaderProgress(job, steps, assetProgress);

// //         if (job.status === "completed") {
// //           return Math.min(100, current + 3.5);
// //         }

// //         if (job.status === "failed") {
// //           return current;
// //         }

// //         if (current < target) {
// //           const jump = Math.max(0.5, (target - current) * 0.28);
// //           return clampProgress(Math.min(target, current + jump));
// //         }

// //         if (current > target) {
// //           return clampProgress(Math.max(target, current - 0.8));
// //         }

// //         return current;
// //       });
// //     }, 180);

// //     return () => {
// //       window.clearInterval(intervalId);
// //     };
// //   }, [job?.id, job?.status, job?.stage, job?.progress_percent, job?.updated_at]);

// //   return (
// //     <div className="loader-overlay">
// //       <div className="loader-card">
// //         <div className="loader-orb" />
// //         <p className="loader-badge">ContentOS is generating</p>
// //         <h2>Building your asset pack</h2>
// //         <p className="loader-copy">
// //           {job?.detail || "Your request is in progress and the final content is on the way."}
// //         </p>

// //         <div className="loader-progress-shell">
// //           <div className="loader-progress-top">
// //             <strong>{stageLabel}</strong>
// //             <span>{progressPercent}%</span>
// //           </div>
// //           <div className="loader-progress-bar">
// //             <div
// //               className="loader-progress-fill"
// //               style={{ width: `${progressPercent}%` }}
// //             />
// //           </div>
// //           <div className="loader-progress-meta">
// //             <span>{job?.message || "Starting generation..."}</span>
// //             <span>{totalAssets ? `${completedAssets}/${totalAssets} ready` : elapsed}</span>
// //           </div>
// //         </div>

// //         <div className="loader-steps">
// //           {steps.map((step) => (
// //             <div
// //               key={step.key}
// //               className={`loader-step loader-step-${step.status || "pending"}`}
// //             >
// //               <span />
// //               <p>{step.label}</p>
// //             </div>
// //           ))}
// //         </div>

// //         <div className="loader-assets">
// //           {assetProgress.map((asset) => (
// //             <div key={asset.asset_type} className={`loader-asset loader-asset-${asset.status}`}>
// //               <div>
// //                 <strong>{asset.label}</strong>
// //                 <p>{getAssetStatusCopy(asset)}</p>
// //               </div>
// //               <span>
// //                 {asset.status === "completed" ? "Done" : asset.status === "active" ? "Live" : "Next"}
// //               </span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // async function apiFetch(path, options = {}, token = "") {
// //   const headers = {
// //     "Content-Type": "application/json",
// //     ...(options.headers ?? {}),
// //   };

// //   if (token) {
// //     headers.Authorization = `Bearer ${token}`;
// //   }

// //   const response = await fetch(`${API_BASE_URL}${path}`, {
// //     ...options,
// //     headers,
// //   });

// //   const data = await response.json().catch(() => ({}));

// //   if (!response.ok) {
// //     const error = new Error(data.detail || "Request failed.");
// //     error.status = response.status;
// //     throw error;
// //   }

// //   return data;
// // }

// // function getRouteFromHash() {
// //   const hash = window.location.hash.replace(/^#/, "");
// //   return hash === "/workspace" ? "workspace" : DEFAULT_ROUTE;
// // }

// // function navigateTo(nextRoute) {
// //   const nextHash = nextRoute === "workspace" ? "#/workspace" : "#/";
// //   if (window.location.hash !== nextHash) {
// //     window.location.hash = nextHash;
// //   }
// // }

// // function buildVideoPayload(value) {
// //   const trimmed = value.trim();
// //   if (!trimmed) {
// //     return {};
// //   }
// //   if (trimmed.startsWith("http")) {
// //     return { video_url: trimmed };
// //   }
// //   return { video_id: trimmed };
// // }

// // function parseSampleBlocks(value) {
// //   return value
// //     .split(/\n\s*\n/g)
// //     .map((item) => item.trim())
// //     .filter(Boolean);
// // }

// // function parseLineItems(value) {
// //   return value
// //     .split("\n")
// //     .map((item) => item.trim())
// //     .filter(Boolean);
// // }

// // function persistAuth(nextToken, nextUser) {
// //   localStorage.setItem(
// //     AUTH_STORAGE_KEY,
// //     JSON.stringify({ token: nextToken, user: nextUser }),
// //   );
// // }

// // function clearAuthState() {
// //   localStorage.removeItem(AUTH_STORAGE_KEY);
// //   window.location.reload();
// // }

// // function safeParse(output) {
// //   try {
// //     return typeof output === "string" ? JSON.parse(output) : output;
// //   } catch {
// //     return { raw: output };
// //   }
// // }

// // function formatLabel(label) {
// //   return label.replaceAll("_", " ");
// // }

// // function formatAssetLabel(assetType) {
// //   return assetType.replaceAll("_", " ");
// // }

// // function getPlatformHook(platform) {
// //   const hooks = {
// //     twitter: "Thread draft",
// //     tiktok: "Short-form script",
// //     youtube: "Video angle",
// //     linkedin: "Professional post",
// //     instagram: "Instagram asset",
// //     blog: "Blog draft",
// //     reddit: "Reddit post",
// //     email: "Newsletter draft",
// //   };

// //   return hooks[platform] ?? "Generated asset";
// // }

// // function buildGenerationSource({ videoInput, generateTranscript, selectedAssets }) {
// //   if (videoInput.trim()) {
// //     return `Generated from ${truncateText(videoInput.trim(), 68)} for ${selectedAssets.length} selected asset types.`;
// //   }

// //   return `Generated from pasted transcript for ${selectedAssets.length} selected asset types.`;
// // }

// // // ─── Asset status values ───
// // const ASSET_STATUS_DRAFT = "draft";
// // const ASSET_STATUS_READY = "ready";
// // const ASSET_STATUS_PUBLISHED = "published";

// // function buildWorkspaceAssets(results, sourceLabel) {
// //   return results.map((result, index) => {
// //     const data = safeParse(result.output);
// //     const now = new Date().toISOString();
// //     const title = result.asset_type
// //       ? formatAssetLabel(result.asset_type)
// //       : getPlatformHook(result.platform);

// //     return {
// //       id: buildAssetId(result, index),
// //       title,
// //       platformLabel: capitalize(result.platform || "generated"),
// //       assetType: result.asset_type || "generic",
// //       sourceLabel,
// //       status: ASSET_STATUS_DRAFT,
// //       createdAt: now,
// //       updatedAt: now,
// //       blocks: buildBlocksFromOutput(data),
// //     };
// //   });
// // }

// // function buildBlocksFromOutput(data) {
// //   return Object.entries(data).map(([key, value], index) => ({
// //     id: `${key}-${index}-${generateLocalId()}`,
// //     key,
// //     label: formatLabel(key),
// //     kind: Array.isArray(value) ? "list" : "text",
// //     // CHANGED: preserve raw value (including nested objects) instead of flattening
// //     value: Array.isArray(value) ? value.map(formatListItemValue) : formatTextBlockValue(value),
// //     originalValue: Array.isArray(value) ? value.map(formatListItemValue) : formatTextBlockValue(value),
// //     isDirty: false,
// //   }));
// // }

// // function formatTextBlockValue(value) {
// //   if (value === null || value === undefined) {
// //     return "";
// //   }

// //   if (typeof value === "string") {
// //     return value;
// //   }

// //   if (typeof value === "number" || typeof value === "boolean") {
// //     return String(value);
// //   }

// //   if (Array.isArray(value)) {
// //     return value.map(formatListItemValue).join("\n");
// //   }

// //   const readable = extractReadableObjectText(value);
// //   if (readable) {
// //     return readable;
// //   }

// //   return safeStringify(value);
// // }

// // // CHANGED: return objects as-is so the renderer can display them structurally
// // function formatListItemValue(value) {
// //   if (value === null || value === undefined) return "";
// //   if (typeof value === "string") return value.trim();
// //   if (typeof value === "number" || typeof value === "boolean") return String(value);

// //   // Preserve structured objects (e.g. { title, body }) — don't flatten them
// //   if (typeof value === "object" && !Array.isArray(value)) return value;

// //   const text = formatTextBlockValue(value);
// //   return text
// //     .split("\n")
// //     .map((line) => line.trim())
// //     .filter(Boolean)
// //     .join(" ");
// // }

// // // CHANGED: combine title + body when both exist, instead of returning only one key
// // function extractReadableObjectText(value) {
// //   if (!value || typeof value !== "object") {
// //     return "";
// //   }

// //   const titleText = typeof value.title === "string" ? value.title.trim() : "";
// //   const bodyKey = ["body", "content", "text", "summary", "caption"].find(
// //     (k) => typeof value[k] === "string" && value[k].trim(),
// //   );
// //   const bodyText = bodyKey ? value[bodyKey].trim() : "";

// //   if (titleText && bodyText) return `${titleText}\n${bodyText}`;
// //   if (titleText) return titleText;
// //   if (bodyText) return bodyText;

// //   const preferredKeys = ["value"];
// //   for (const key of preferredKeys) {
// //     const candidate = value[key];
// //     if (typeof candidate === "string" && candidate.trim()) {
// //       return candidate.trim();
// //     }
// //   }

// //   const nestedCollections = ["paragraphs", "sections", "blocks", "items"];
// //   for (const key of nestedCollections) {
// //     if (!Array.isArray(value[key])) {
// //       continue;
// //     }

// //     const combined = value[key]
// //       .map(formatTextBlockValue)
// //       .map((item) => item.trim())
// //       .filter(Boolean)
// //       .join("\n\n");

// //     if (combined) return combined;
// //   }

// //   return "";
// // }

// // function safeStringify(value) {
// //   try {
// //     return JSON.stringify(value, null, 2);
// //   } catch {
// //     return String(value ?? "");
// //   }
// // }

// // function buildAssetId(result, index) {
// //   return `${result.platform || "platform"}-${result.asset_type || "asset"}-${index}-${generateLocalId()}`;
// // }

// // function generateLocalId() {
// //   return Math.random().toString(36).slice(2, 9);
// // }

// // function getWorkspaceStorageKey(user) {
// //   const identifier = user?.id || user?.email || "anonymous";
// //   return `${WORKSPACE_STORAGE_PREFIX}:${identifier}`;
// // }

// // function readWorkspace(user) {
// //   try {
// //     return JSON.parse(localStorage.getItem(getWorkspaceStorageKey(user)) ?? "{}");
// //   } catch {
// //     return {};
// //   }
// // }

// // function writeWorkspace(user, payload) {
// //   localStorage.setItem(getWorkspaceStorageKey(user), JSON.stringify(payload));
// // }

// // function serializeWorkspace(assets) {
// //   return assets.map(serializeAsset).join("\n\n");
// // }

// // function serializeAsset(asset) {
// //   const lines = [
// //     `${asset.title} (${asset.platformLabel})`,
// //     `Status: ${formatAssetStatus(asset.status)}`,
// //     `${asset.sourceLabel}`,
// //     "",
// //   ];

// //   for (const block of asset.blocks) {
// //     lines.push(`${block.label}:`);
// //     if (Array.isArray(block.value)) {
// //       for (const item of block.value) {
// //         if (isStructuredObject(item)) {
// //           lines.push(`- ${serializeStructuredItem(item)}`);
// //         } else {
// //           lines.push(`- ${item}`);
// //         }
// //       }
// //     } else {
// //       lines.push(String(block.value));
// //     }
// //     lines.push("");
// //   }

// //   return lines.join("\n").trim();
// // }

// // function normalizeBlockValue(value) {
// //   if (Array.isArray(value)) {
// //     return value
// //       .map((item) =>
// //         isStructuredObject(item) ? serializeStructuredItem(item) : String(item ?? "").trim(),
// //       )
// //       .join("\n");
// //   }
// //   return String(value ?? "").trim();
// // }

// // function splitEditableList(value) {
// //   return value
// //     .split("\n")
// //     .map((item) => item.trim())
// //     .filter(Boolean);
// // }

// // function estimateRows(value) {
// //   return String(value ?? "").split("\n").length + 1;
// // }

// // function getWorkspaceSaveLabel(status) {
// //   if (status === "saving") {
// //     return "Autosaving";
// //   }
// //   if (status === "saved") {
// //     return "Saved locally";
// //   }
// //   if (status === "error") {
// //     return "Save issue";
// //   }
// //   return "Ready";
// // }

// // function capitalize(value) {
// //   if (!value) {
// //     return "";
// //   }

// //   return value.charAt(0).toUpperCase() + value.slice(1);
// // }

// // // ─── Asset status helpers ───
// // function formatAssetStatus(status) {
// //   const labels = {
// //     [ASSET_STATUS_DRAFT]: "Draft",
// //     [ASSET_STATUS_READY]: "Ready",
// //     [ASSET_STATUS_PUBLISHED]: "Published",
// //   };
// //   return labels[status] || status;
// // }

// // function truncateText(value, maxLength) {
// //   if (value.length <= maxLength) {
// //     return value;
// //   }

// //   return `${value.slice(0, maxLength - 1)}…`;
// // }

// // function formatWorkspaceDate(value) {
// //   if (!value) {
// //     return "Saved recently";
// //   }

// //   return new Intl.DateTimeFormat(undefined, {
// //     month: "short",
// //     day: "numeric",
// //     hour: "numeric",
// //     minute: "2-digit",
// //   }).format(new Date(value));
// // }

// // function buildAssetProgress(jobAssets, selectedAssets, targetAssets) {
// //   if (Array.isArray(jobAssets) && jobAssets.length) {
// //     return jobAssets;
// //   }

// //   const labelByAsset = Object.fromEntries(
// //     targetAssets.map((asset) => [asset.asset_type, asset.label]),
// //   );

// //   return selectedAssets.map((assetType) => ({
// //     asset_type: assetType,
// //     label: labelByAsset[assetType] || formatAssetLabel(assetType),
// //     status: "pending",
// //     attempt: 0,
// //   }));
// // }

// // function getStageLabel(stage) {
// //   const labels = {
// //     queued: "Queued",
// //     starting: "Starting",
// //     source: "Getting ready",
// //     moments: "Understanding input",
// //     strategy: "Preparing content",
// //     execution: "Creating results",
// //     execution_preparing: "Preparing creation",
// //     execution_writing: "Creating results",
// //     execution_review: "Improving results",
// //     execution_polish: "Finalizing results",
// //     finalizing: "Wrapping up",
// //     finalize: "Wrapping up",
// //     completed: "Completed",
// //     failed: "Stopped",
// //   };

// //   return labels[stage] || "Generating";
// // }

// // function getAssetStatusCopy(asset) {
// //   if (asset.status === "completed") {
// //     return "Finished and ready in your pack.";
// //   }

// //   if (asset.status === "active") {
// //     return "Currently being prepared for you.";
// //   }

// //   return "Waiting to be completed next.";
// // }

// // function formatElapsed(isoValue) {
// //   if (!isoValue) {
// //     return "Just started";
// //   }

// //   const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoValue).getTime()) / 1000));
// //   if (seconds < 5) {
// //     return "Just started";
// //   }
// //   if (seconds < 60) {
// //     return `${seconds}s elapsed`;
// //   }

// //   const minutes = Math.floor(seconds / 60);
// //   const remainder = seconds % 60;
// //   return `${minutes}m ${remainder}s elapsed`;
// // }

// // function clampProgress(value) {
// //   return Math.max(0, Math.min(100, Number(value) || 0));
// // }

// // function getRealLoaderProgress(job, steps, assetProgress) {
// //   if (!job) {
// //     return 4;
// //   }

// //   if (job.status === "completed") {
// //     return 100;
// //   }

// //   const stepWeight = {
// //     source: 8,
// //     moments: 10,
// //     strategy: 12,
// //     execution: 60,
// //     finalize: 10,
// //   };

// //   let progress = 2;
// //   for (const step of steps) {
// //     if (step.key === "execution") {
// //       continue;
// //     }

// //     const weight = stepWeight[step.key] ?? 0;
// //     if (step.status === "completed") {
// //       progress += weight;
// //     } else if (step.status === "active") {
// //       progress += weight * 0.55;
// //     }
// //   }

// //   const totalAssets = assetProgress.length;
// //   if (totalAssets) {
// //     const perAssetWeight = stepWeight.execution / totalAssets;
// //     const completedAssets = assetProgress.filter((asset) => asset.status === "completed").length;
// //     const activeAssets = assetProgress.filter((asset) => asset.status === "active").length;
// //     progress += completedAssets * perAssetWeight;

// //     if (activeAssets > 0) {
// //       progress += getActiveAssetPartial(job, perAssetWeight) * activeAssets;
// //     }
// //   } else {
// //     const executionStep = steps.find((step) => step.key === "execution");
// //     if (executionStep?.status === "completed") {
// //       progress += stepWeight.execution;
// //     } else if (executionStep?.status === "active") {
// //       progress += stepWeight.execution * 0.4;
// //     }
// //   }

// //   if (job.stage === "finalize" || job.stage === "finalizing") {
// //     progress = Math.max(progress, 92);
// //   }

// //   return clampProgress(progress);
// // }

// // function getActiveAssetPartial(job, perAssetWeight) {
// //   const lastUpdate = job?.updated_at ? new Date(job.updated_at).getTime() : Date.now();
// //   const secondsSinceUpdate = Math.max(0, (Date.now() - lastUpdate) / 1000);
// //   const eased = Math.min(0.92, 0.18 + secondsSinceUpdate / 28);
// //   return perAssetWeight * eased;
// // }

// // export default App;








// import { useEffect, useRef, useState } from "react";

// const API_BASE_URL =
//   import.meta.env.VITE_API_URL ?? "http://localhost:8000";
// const AUTH_STORAGE_KEY = "contentos-auth";
// const WORKSPACE_STORAGE_PREFIX = "contentos-workspace-v2";
// const DEFAULT_ROUTE = "home";

// const ASSET_STATUS_DRAFT = "draft";
// const ASSET_STATUS_READY = "ready";
// const ASSET_STATUS_PUBLISHED = "published";

// const STATUS_CYCLE = [ASSET_STATUS_DRAFT, ASSET_STATUS_READY, ASSET_STATUS_PUBLISHED];

// const STATUS_META = {
//   [ASSET_STATUS_DRAFT]: {
//     label: "Draft",
//     icon: "○",
//     next: ASSET_STATUS_READY,
//     nextLabel: "Mark as Ready",
//     color: "var(--status-draft-text)",
//     bg: "var(--status-draft-bg)",
//     border: "var(--status-draft-border)",
//     dot: "var(--status-draft-dot)",
//   },
//   [ASSET_STATUS_READY]: {
//     label: "Ready",
//     icon: "◐",
//     next: ASSET_STATUS_PUBLISHED,
//     nextLabel: "Mark as Published",
//     color: "var(--status-ready-text)",
//     bg: "var(--status-ready-bg)",
//     border: "var(--status-ready-border)",
//     dot: "var(--status-ready-dot)",
//   },
//   [ASSET_STATUS_PUBLISHED]: {
//     label: "Published",
//     icon: "●",
//     next: ASSET_STATUS_DRAFT,
//     nextLabel: "Move back to Draft",
//     color: "var(--status-published-text)",
//     bg: "var(--status-published-bg)",
//     border: "var(--status-published-border)",
//     dot: "var(--status-published-dot)",
//   },
// };

// function App() {
//   const [route, setRoute] = useState(() => getRouteFromHash());
//   const [token, setToken] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}").token ?? "";
//     } catch {
//       return "";
//     }
//   });
//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? "{}").user ?? null;
//     } catch {
//       return null;
//     }
//   });
//   const [authMode, setAuthMode] = useState("login");
//   const [authForm, setAuthForm] = useState({
//     email: "",
//     password: "",
//     displayName: "",
//   });
//   const [authStatus, setAuthStatus] = useState("idle");
//   const [authError, setAuthError] = useState("");
//   const [bootStatus, setBootStatus] = useState(token ? "loading" : "ready");

//   const [videoInput, setVideoInput] = useState("");
//   const [generateTranscript, setGenerateTranscript] = useState("");
//   const [generateStatus, setGenerateStatus] = useState("idle");
//   const [generateError, setGenerateError] = useState("");
//   const [generateJob, setGenerateJob] = useState(null);
//   const [lastGeneratedCount, setLastGeneratedCount] = useState(0);
//   const [targetAssets, setTargetAssets] = useState([]);
//   const [selectedAssets, setSelectedAssets] = useState([]);

//   const [workspaceAssets, setWorkspaceAssets] = useState([]);
//   const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState("idle");
//   const [activeAssetId, setActiveAssetId] = useState("");
//   const [activeBlockId, setActiveBlockId] = useState("");
//   const [workspaceLoaded, setWorkspaceLoaded] = useState(false);

//   const [profileMode, setProfileMode] = useState("samples");
//   const [sampleText, setSampleText] = useState("");
//   const [youtubeText, setYoutubeText] = useState("");
//   const [youtubeTranscriptText, setYoutubeTranscriptText] = useState("");
//   const [profileStatus, setProfileStatus] = useState("idle");
//   const [profileError, setProfileError] = useState("");
//   const [voiceProfile, setVoiceProfile] = useState(null);

//   useEffect(() => {
//     const syncRoute = () => setRoute(getRouteFromHash());
//     window.addEventListener("hashchange", syncRoute);
//     return () => window.removeEventListener("hashchange", syncRoute);
//   }, []);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadTargetAssets() {
//       try {
//         const response = await apiFetch("/target-assets", { method: "GET" });
//         if (cancelled) return;
//         const catalog = Array.isArray(response.target_assets) ? response.target_assets : [];
//         setTargetAssets(catalog);
//         setSelectedAssets((current) =>
//           current.length ? current : catalog.slice(0, 3).map((asset) => asset.asset_type),
//         );
//       } catch (error) {
//         if (!cancelled) setGenerateError(error.message);
//       }
//     }

//     loadTargetAssets();
//     return () => { cancelled = true; };
//   }, []);

//   useEffect(() => {
//     if (!token) { setBootStatus("ready"); return; }
//     let cancelled = false;

//     async function bootstrap() {
//       try {
//         const me = await apiFetch("/me", { method: "GET" }, token);
//         if (cancelled) return;
//         setUser(me);
//         persistAuth(token, me);
//         try {
//           const profile = await apiFetch("/me/voice-profile", { method: "GET" }, token);
//           if (!cancelled) setVoiceProfile(profile);
//         } catch (error) {
//           if (!cancelled && error.status !== 404) setProfileError(error.message);
//         }
//       } catch (error) {
//         if (!cancelled) { clearAuthState(); setAuthError(error.message); }
//       } finally {
//         if (!cancelled) setBootStatus("ready");
//       }
//     }

//     bootstrap();
//     return () => { cancelled = true; };
//   }, [token]);

//   useEffect(() => {
//     if (!user) return;
//     const storedWorkspace = readWorkspace(user);
//     if (Array.isArray(storedWorkspace.assets) && storedWorkspace.assets.length) {
//       setWorkspaceAssets(storedWorkspace.assets);
//       setActiveAssetId(storedWorkspace.assets[0].id);
//       setWorkspaceSaveStatus("saved");
//       setWorkspaceLoaded(true);
//       return;
//     }
//     setWorkspaceAssets([]);
//     setWorkspaceSaveStatus("idle");
//     setWorkspaceLoaded(true);
//   }, [user]);

//   useEffect(() => {
//     if (!user || !workspaceLoaded) return undefined;
//     setWorkspaceSaveStatus("saving");
//     const timeoutId = window.setTimeout(() => {
//       writeWorkspace(user, { assets: workspaceAssets, savedAt: new Date().toISOString() });
//       setWorkspaceSaveStatus("saved");
//     }, 450);
//     return () => window.clearTimeout(timeoutId);
//   }, [user, workspaceAssets, workspaceLoaded]);

//   useEffect(() => {
//     if (!token || generateStatus !== "loading" || !generateJob?.id) return undefined;
//     let cancelled = false;
//     let completionTimeoutId;

//     async function pollJob() {
//       try {
//         const job = await apiFetch(`/generation-jobs/${generateJob.id}`, { method: "GET" }, token);
//         if (cancelled) return;
//         setGenerateJob(job);

//         if (job.status === "completed") {
//           completionTimeoutId = window.setTimeout(() => {
//             if (cancelled) return;
//             const generatedResults = Array.isArray(job.result?.results) ? job.result.results : [];
//             const source = buildGenerationSource({ videoInput, generateTranscript, selectedAssets });
//             const newAssets = buildWorkspaceAssets(generatedResults, source);
//             setWorkspaceAssets((current) => [...newAssets, ...current]);
//             setActiveAssetId(newAssets[0]?.id || "");
//             setActiveBlockId("");
//             setLastGeneratedCount(newAssets.length);
//             setGenerateStatus("success");
//             navigateTo("workspace");
//           }, 900);
//           return;
//         }

//         if (job.status === "failed") {
//           setGenerateStatus("error");
//           setGenerateError(job.error || job.detail || "Generation failed.");
//           return;
//         }

//         window.setTimeout(pollJob, 1200);
//       } catch (error) {
//         if (!cancelled) { setGenerateStatus("error"); setGenerateError(error.message); }
//       }
//     }

//     pollJob();
//     return () => {
//       cancelled = true;
//       if (completionTimeoutId) window.clearTimeout(completionTimeoutId);
//     };
//   }, [generateJob?.id, generateStatus, token]);

//   useEffect(() => {
//     if (!workspaceAssets.length) { setActiveAssetId(""); return; }
//     const exists = workspaceAssets.some((asset) => asset.id === activeAssetId);
//     if (!exists) setActiveAssetId(workspaceAssets[0].id);
//   }, [workspaceAssets, activeAssetId]);

//   const selectedAsset = workspaceAssets.find((asset) => asset.id === activeAssetId) ?? null;

//   const handleAuthChange = (field, value) => {
//     setAuthForm((current) => ({ ...current, [field]: value }));
//   };

//   const handleAssetToggle = (assetType) => {
//     setSelectedAssets((current) => {
//       if (current.includes(assetType)) return current.filter((item) => item !== assetType);
//       return [...current, assetType];
//     });
//   };

//   const handleGenerateVideoInputChange = (value) => {
//     setVideoInput(value);
//     if (value.trim()) setGenerateTranscript("");
//   };

//   const handleGenerateTranscriptChange = (value) => {
//     setGenerateTranscript(value);
//     if (value.trim()) setVideoInput("");
//   };

//   const handleYoutubeProfileInputChange = (value) => {
//     setYoutubeText(value);
//     if (value.trim()) setYoutubeTranscriptText("");
//   };

//   const handleYoutubeProfileTranscriptChange = (value) => {
//     setYoutubeTranscriptText(value);
//     if (value.trim()) setYoutubeText("");
//   };

//   const handleAuthSubmit = async (event) => {
//     event.preventDefault();
//     if (!authForm.email.trim() || !authForm.password.trim()) {
//       setAuthError("Enter your email and password.");
//       return;
//     }
//     setAuthStatus("loading");
//     setAuthError("");
//     try {
//       const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
//       const payload = { email: authForm.email.trim(), password: authForm.password };
//       if (authMode === "register") payload.display_name = authForm.displayName.trim();
//       const response = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
//       persistAuth(response.access_token, response.user);
//       setToken(response.access_token);
//       setUser(response.user);
//       setAuthStatus("success");
//       setAuthForm({ email: authForm.email, password: "", displayName: "" });
//     } catch (error) {
//       setAuthStatus("error");
//       setAuthError(error.message);
//     }
//   };

//   const handleLogout = () => {
//     clearAuthState();
//     setAuthStatus("idle");
//     setAuthError("");
//     setProfileError("");
//     setGenerateError("");
//     setWorkspaceAssets([]);
//     setVoiceProfile(null);
//   };

//   const handleGenerate = async (event) => {
//     event.preventDefault();
//     if (!videoInput.trim() && !generateTranscript.trim()) {
//       setGenerateError("Paste a YouTube URL/video ID or a transcript to generate content.");
//       return;
//     }
//     if (!selectedAssets.length) { setGenerateError("Choose at least one asset type."); return; }
//     setGenerateStatus("loading");
//     setGenerateError("");
//     setGenerateJob(null);
//     setLastGeneratedCount(0);
//     try {
//       const payload = {
//         ...buildVideoPayload(videoInput),
//         transcript: generateTranscript.trim(),
//         target_assets: selectedAssets,
//       };
//       const job = await apiFetch("/generation-jobs", { method: "POST", body: JSON.stringify(payload) }, token);
//       setGenerateJob(job);
//     } catch (error) {
//       setGenerateStatus("error");
//       setGenerateError(error.message);
//     }
//   };

//   const handleSaveSamplesProfile = async (event) => {
//     event.preventDefault();
//     const samples = parseSampleBlocks(sampleText);
//     if (!samples.length) { setProfileError("Add at least one writing sample or transcript block."); return; }
//     await saveVoiceProfile("/me/voice-profile", { samples });
//   };

//   const handleSaveYoutubeProfile = async (event) => {
//     event.preventDefault();
//     const youtubeUrls = parseLineItems(youtubeText);
//     const transcripts = parseSampleBlocks(youtubeTranscriptText);
//     if (!youtubeUrls.length && !transcripts.length) {
//       setProfileError("Paste at least one YouTube URL, video ID, or transcript.");
//       return;
//     }
//     await saveVoiceProfile("/me/voice-profile/from-youtube", {
//       youtube_urls: youtubeUrls.filter((item) => item.startsWith("http")),
//       youtube_video_ids: youtubeUrls.filter((item) => !item.startsWith("http")),
//       transcripts,
//     });
//   };

//   const saveVoiceProfile = async (path, payload) => {
//     setProfileStatus("loading");
//     setProfileError("");
//     try {
//       const profile = await apiFetch(path, { method: "POST", body: JSON.stringify(payload) }, token);
//       setVoiceProfile(profile);
//       setProfileStatus("success");
//     } catch (error) {
//       setProfileStatus("error");
//       setProfileError(error.message);
//     }
//   };

//   const handleBlockChange = (assetId, blockId, value) => {
//     setWorkspaceAssets((current) =>
//       current.map((asset) =>
//         asset.id === assetId
//           ? {
//               ...asset,
//               updatedAt: new Date().toISOString(),
//               blocks: asset.blocks.map((block) =>
//                 block.id === blockId
//                   ? { ...block, value, isDirty: normalizeBlockValue(value) !== normalizeBlockValue(block.originalValue) }
//                   : block,
//               ),
//             }
//           : asset,
//       ),
//     );
//   };

//   const handleAssetStatusChange = (assetId, newStatus) => {
//     setWorkspaceAssets((current) =>
//       current.map((asset) =>
//         asset.id === assetId
//           ? { ...asset, status: newStatus, updatedAt: new Date().toISOString() }
//           : asset,
//       ),
//     );
//   };

//   const handleRevertBlock = (assetId, blockId) => {
//     setWorkspaceAssets((current) =>
//       current.map((asset) =>
//         asset.id === assetId
//           ? {
//               ...asset,
//               updatedAt: new Date().toISOString(),
//               blocks: asset.blocks.map((block) =>
//                 block.id === blockId
//                   ? { ...block, value: block.originalValue, isDirty: false }
//                   : block,
//               ),
//             }
//           : asset,
//       ),
//     );
//   };

//   const handleDeleteAsset = (assetId) => {
//     setWorkspaceAssets((current) => current.filter((asset) => asset.id !== assetId));
//     if (activeAssetId === assetId) { setActiveAssetId(""); setActiveBlockId(""); }
//   };

//   const handleExportWorkspace = async () => {
//     await navigator.clipboard.writeText(serializeWorkspace(workspaceAssets));
//   };

//   if (bootStatus === "loading") {
//     return (
//       <div className="app-shell">
//         <main className="app app-loading">
//           <div className="panel boot-panel">
//             <p className="eyebrow">ContentOS</p>
//             <h1>Loading your workspace</h1>
//             <p className="muted-copy">Reconnecting your auth session and voice profile.</p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   if (!token || !user) {
//     return (
//       <div className="app-shell">
//         <div className="ambient ambient-1" />
//         <div className="ambient ambient-2" />
//         <main className="app auth-layout">
//           <section className="hero hero-left">
//             <p className="eyebrow">ContentOS</p>
//             <h1>Build once.<span>Ship the right assets everywhere.</span></h1>
//             <p className="hero-copy">
//               Create an account, save your creator voice profile, and turn each generation
//               into a persistent workspace instead of a disposable AI response.
//             </p>
//             <div className="hero-pills">
//               <span>User auth</span>
//               <span>Saved voice profile</span>
//               <span>Persistent workspace</span>
//             </div>
//           </section>

//           <section className="panel auth-panel">
//             <div className="auth-toggle">
//               <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")} type="button">Login</button>
//               <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")} type="button">Register</button>
//             </div>
//             <div className="panel-heading">
//               <h2>{authMode === "login" ? "Welcome back" : "Create your workspace"}</h2>
//               <p className="muted-copy">
//                 {authMode === "login"
//                   ? "Sign in to access your saved creator voice profile and asset library."
//                   : "Create an account so your voice profile and workspace stay attached to you."}
//               </p>
//             </div>
//             <form className="stack-form" onSubmit={handleAuthSubmit}>
//               {authMode === "register" ? (
//                 <label className="field">
//                   <span>Display name</span>
//                   <input type="text" placeholder="Aman" value={authForm.displayName} onChange={(e) => handleAuthChange("displayName", e.target.value)} />
//                 </label>
//               ) : null}
//               <label className="field">
//                 <span>Email</span>
//                 <input type="email" placeholder="you@example.com" value={authForm.email} onChange={(e) => handleAuthChange("email", e.target.value)} />
//               </label>
//               <label className="field">
//                 <span>Password</span>
//                 <input type="password" placeholder="At least 8 characters" value={authForm.password} onChange={(e) => handleAuthChange("password", e.target.value)} />
//               </label>
//               <button className="primary-button" type="submit" disabled={authStatus === "loading"}>
//                 {authStatus === "loading"
//                   ? authMode === "login" ? "Signing in..." : "Creating account..."
//                   : authMode === "login" ? "Login" : "Create account"}
//               </button>
//             </form>
//             {authError ? <p className="error">{authError}</p> : null}
//           </section>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="app-shell">
//       <div className="ambient ambient-1" />
//       <div className="ambient ambient-2" />

//       <main className="app workspace-layout">
//         <header className="header">
//           <div className="header-brand">
//             <div className="brand-mark">CO</div>
//             <div className="brand-text">
//               <span className="brand-name">ContentOS</span>
//               <span className="brand-tagline">Content workspace</span>
//             </div>
//           </div>
//           <div className="header-divider" />
//           <div className="header-greeting">
//             <p className="greeting-name">Hi, <span>{user.display_name}</span></p>
//             <p className="greeting-sub">Create once. Repurpose everywhere.</p>
//           </div>
//           <nav className="header-nav">
//             <button className={`nav-btn ${route === "home" ? "active" : ""}`} onClick={() => navigateTo("home")} type="button">Main page</button>
//             <button className={`nav-btn ${route === "workspace" ? "active" : ""}`} onClick={() => navigateTo("workspace")} type="button">Workspace</button>
//           </nav>
//           <div className="header-right">
//             <div className="user-pill">
//               <div className="user-avatar">{user.display_name.slice(0, 2).toUpperCase()}</div>
//               <div className="user-info">
//                 <span className="user-name">{user.display_name}</span>
//                 <span className="user-email">{user.email}</span>
//               </div>
//             </div>
//             <button className="logout-btn" onClick={handleLogout} type="button">
//               <svg className="logout-icon" viewBox="0 0 16 16" fill="none">
//                 <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//               Logout
//             </button>
//           </div>
//         </header>

//         {route === "workspace" ? (
//           <WorkspacePage
//             assets={workspaceAssets}
//             activeAssetId={activeAssetId}
//             activeBlockId={activeBlockId}
//             onSelectAsset={setActiveAssetId}
//             onSelectAssetStatus={handleAssetStatusChange}
//             onSelectBlock={setActiveBlockId}
//             onBlurBlock={() => setActiveBlockId("")}
//             onBlockChange={handleBlockChange}
//             onRevertBlock={handleRevertBlock}
//             onDeleteAsset={handleDeleteAsset}
//             onStatusChange={handleAssetStatusChange}
//             onExportWorkspace={handleExportWorkspace}
//             saveStatus={workspaceSaveStatus}
//             selectedAsset={selectedAsset}
//             lastGeneratedCount={lastGeneratedCount}
//             onGoToMain={() => navigateTo("home")}
//           />
//         ) : (
//           <HomePage
//             profileMode={profileMode}
//             setProfileMode={setProfileMode}
//             sampleText={sampleText}
//             setSampleText={setSampleText}
//             youtubeText={youtubeText}
//             youtubeTranscriptText={youtubeTranscriptText}
//             profileStatus={profileStatus}
//             profileError={profileError}
//             voiceProfile={voiceProfile}
//             onYoutubeProfileInputChange={handleYoutubeProfileInputChange}
//             onYoutubeProfileTranscriptChange={handleYoutubeProfileTranscriptChange}
//             onSaveSamplesProfile={handleSaveSamplesProfile}
//             onSaveYoutubeProfile={handleSaveYoutubeProfile}
//             generateStatus={generateStatus}
//             generateError={generateError}
//             videoInput={videoInput}
//             generateTranscript={generateTranscript}
//             onGenerateVideoInputChange={handleGenerateVideoInputChange}
//             onGenerateTranscriptChange={handleGenerateTranscriptChange}
//             targetAssets={targetAssets}
//             selectedAssets={selectedAssets}
//             onAssetToggle={handleAssetToggle}
//             onGenerate={handleGenerate}
//             workspaceAssets={workspaceAssets}
//             onGoToWorkspace={() => navigateTo("workspace")}
//           />
//         )}
//       </main>

//       {generateStatus === "loading" ? (
//         <GenerationLoader job={generateJob} selectedAssets={selectedAssets} targetAssets={targetAssets} />
//       ) : null}
//     </div>
//   );
// }

// // ─── StatusPill: tap-to-cycle status with tooltip hint ───
// function StatusPill({ status, onSelect, size = "md" }) {
//   const [animating, setAnimating] = useState(false);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const meta = STATUS_META[status] || STATUS_META[ASSET_STATUS_DRAFT];

//   const handleClick = (e) => {
//     e.stopPropagation();
//     if (animating) return;
//     setAnimating(true);
//     const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length];
//     onSelect(next);
//     setTimeout(() => setAnimating(false), 300);
//   };

//   return (
//     <div className="status-pill-wrapper" style={{ position: "relative", display: "inline-flex" }}>
//       <button
//         className={`status-pill status-pill-${status} status-pill-${size} ${animating ? "status-pill-animating" : ""}`}
//         onClick={handleClick}
//         onMouseEnter={() => setShowTooltip(true)}
//         onMouseLeave={() => setShowTooltip(false)}
//         type="button"
//         aria-label={`Status: ${meta.label}. Click to change to ${meta.nextLabel}`}
//       >
//         <span className="status-pill-dot" aria-hidden="true" />
//         <span className="status-pill-label">{meta.label}</span>
//         <svg className="status-pill-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
//           <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
//         </svg>
//       </button>
//       {showTooltip && (
//         <div className="status-pill-tooltip" role="tooltip">
//           Click to → <strong>{meta.nextLabel.replace("Mark as ", "").replace("Move back to ", "")}</strong>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Drag-and-drop enabled asset lane ───
// function StatusLane({ status, assets, activeAssetId, onSelectAsset, onStatusChange, isCollapsed, onToggleCollapse }) {
//   const [isDragOver, setIsDragOver] = useState(false);
//   const meta = STATUS_META[status] || STATUS_META[ASSET_STATUS_DRAFT];

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = "move";
//     setIsDragOver(true);
//   };

//   const handleDragLeave = (e) => {
//     if (!e.currentTarget.contains(e.relatedTarget)) {
//       setIsDragOver(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragOver(false);
//     const assetId = e.dataTransfer.getData("text/plain");
//     if (assetId) onStatusChange(assetId, status);
//   };

//   return (
//     <section
//       className={`status-lane status-lane-${status} ${isDragOver ? "status-lane-drag-over" : ""}`}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//     >
//       <header className="status-lane-header">
//         <button
//           className="status-lane-toggle"
//           onClick={onToggleCollapse}
//           type="button"
//           aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${meta.label}`}
//         >
//           <span className="status-lane-dot" style={{ background: meta.dot }} />
//           <span className="status-lane-title">{meta.label}</span>
//           <span className="status-lane-count">{assets.length}</span>
//           <span className="status-lane-chevron">{isCollapsed ? "▸" : "▾"}</span>
//         </button>
//       </header>

//       {!isCollapsed && (
//         <div className="status-lane-body">
//           {isDragOver && assets.length === 0 && (
//             <div className="status-lane-drop-hint">
//               <span>Drop here to mark as {meta.label}</span>
//             </div>
//           )}
//           {assets.map((asset) => (
//             <DraggableAssetCard
//               key={asset.id}
//               asset={asset}
//               isActive={asset.id === activeAssetId}
//               onSelect={() => onSelectAsset(asset.id)}
//               onStatusChange={onStatusChange}
//             />
//           ))}
//           {assets.length === 0 && !isDragOver && (
//             <div className="status-lane-empty">
//               <p>Drag assets here to mark as {meta.label.toLowerCase()}</p>
//             </div>
//           )}
//         </div>
//       )}
//     </section>
//   );
// }

// // ─── Draggable asset card ───
// function DraggableAssetCard({ asset, isActive, onSelect, onStatusChange }) {
//   const [isDragging, setIsDragging] = useState(false);
//   const meta = STATUS_META[asset.status] || STATUS_META[ASSET_STATUS_DRAFT];

//   const handleDragStart = (e) => {
//     e.dataTransfer.setData("text/plain", asset.id);
//     e.dataTransfer.effectAllowed = "move";
//     setIsDragging(true);
//   };

//   const handleDragEnd = () => setIsDragging(false);

//   return (
//     <div
//       className={`asset-card ${isActive ? "asset-card-active" : ""} ${isDragging ? "asset-card-dragging" : ""}`}
//       draggable
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//       onClick={onSelect}
//       role="button"
//       tabIndex={0}
//       onKeyDown={(e) => e.key === "Enter" && onSelect()}
//       aria-label={`${asset.title}, ${asset.platformLabel}, ${meta.label}`}
//     >
//       <div className="asset-card-drag-handle" aria-hidden="true">
//         <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
//           <circle cx="4" cy="4" r="1.5" fill="currentColor" opacity="0.4"/>
//           <circle cx="8" cy="4" r="1.5" fill="currentColor" opacity="0.4"/>
//           <circle cx="4" cy="8" r="1.5" fill="currentColor" opacity="0.4"/>
//           <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.4"/>
//           <circle cx="4" cy="12" r="1.5" fill="currentColor" opacity="0.4"/>
//           <circle cx="8" cy="12" r="1.5" fill="currentColor" opacity="0.4"/>
//         </svg>
//       </div>
//       <div className="asset-card-body">
//         <div className="asset-card-main">
//           <strong className="asset-card-title">{asset.title}</strong>
//           <span className="asset-card-platform">{asset.platformLabel}</span>
//         </div>
//         <div className="asset-card-footer">
//           <span className="asset-card-date">{formatWorkspaceDate(asset.updatedAt || asset.createdAt)}</span>
//           <StatusPill status={asset.status} onSelect={(newStatus) => onStatusChange(asset.id, newStatus)} size="sm" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function WorkspacePage({
//   assets,
//   activeAssetId,
//   activeBlockId,
//   onSelectAsset,
//   onSelectAssetStatus,
//   onSelectBlock,
//   onBlurBlock,
//   onBlockChange,
//   onRevertBlock,
//   onDeleteAsset,
//   onStatusChange,
//   onExportWorkspace,
//   saveStatus,
//   selectedAsset,
//   lastGeneratedCount,
//   onGoToMain,
// }) {
//   const [collapsedLanes, setCollapsedLanes] = useState({ published: true });

//   const toggleLane = (status) => {
//     setCollapsedLanes((prev) => ({ ...prev, [status]: !prev[status] }));
//   };

//   return (
//     <section className="results-section">
//       {assets.length ? (
//         <>
//           <div className="results-header workspace-results-header">
//             <div>
//               <p className="eyebrow">Asset workspace</p>
//               <h2>Generate, refine, organize, reuse</h2>
//               <p className="muted-copy">Drag assets between lanes to update their status, or click the pill on any card.</p>
//             </div>
//             <div className="workspace-results-actions">
//               {lastGeneratedCount ? (
//                 <span className="summary-tag">{lastGeneratedCount} new {lastGeneratedCount === 1 ? "asset" : "assets"} added</span>
//               ) : null}
//               <button className="ghost-button small" onClick={onExportWorkspace} type="button">Export all</button>
//               <span className={`save-indicator save-indicator-${saveStatus}`}>
//                 <span className="save-indicator-dot" />
//                 {getWorkspaceSaveLabel(saveStatus)}
//               </span>
//             </div>
//           </div>

//           <div className="workspace-layout-inner">
//             {/* Left sidebar: status lanes */}
//             <div className="workspace-sidebar">
//               <div className="workspace-sidebar-hint">
//                 <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
//                   <path d="M5 2.5h4M3 5h8M3 7.5h8M3 10h5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
//                 </svg>
//                 <span>Drag cards to change status</span>
//               </div>

//               {STATUS_CYCLE.map((status) => (
//                 <StatusLane
//                   key={status}
//                   status={status}
//                   assets={assets.filter((a) => a.status === status)}
//                   activeAssetId={activeAssetId}
//                   onSelectAsset={onSelectAsset}
//                   onStatusChange={onSelectAssetStatus}
//                   isCollapsed={!!collapsedLanes[status]}
//                   onToggleCollapse={() => toggleLane(status)}
//                 />
//               ))}
//             </div>

//             {/* Right panel: asset document */}
//             <div className="workspace-document-panel">
//               {selectedAsset ? (
//                 <AssetDocument
//                   asset={selectedAsset}
//                   activeBlockId={activeBlockId}
//                   onSelectBlock={onSelectBlock}
//                   onBlurBlock={onBlurBlock}
//                   onBlockChange={onBlockChange}
//                   onRevertBlock={onRevertBlock}
//                   onDeleteAsset={onDeleteAsset}
//                   onStatusChange={onStatusChange}
//                 />
//               ) : (
//                 <div className="workspace-document-empty">
//                   <div className="workspace-document-empty-icon" aria-hidden="true">
//                     <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
//                       <rect x="6" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
//                       <path d="M11 11h10M11 15h10M11 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
//                     </svg>
//                   </div>
//                   <h3>Select an asset to edit</h3>
//                   <p>Click any card in the sidebar to open it here for editing.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       ) : (
//         <div className="empty-panel large">
//           <h3>Your workspace is ready for its first asset</h3>
//           <p>Generate content from the main page and every asset will be added here as a reusable editing library.</p>
//           <button className="primary-button" onClick={onGoToMain} type="button">Go to main page</button>
//         </div>
//       )}
//     </section>
//   );
// }

// function AssetDocument({ asset, activeBlockId, onSelectBlock, onBlurBlock, onBlockChange, onRevertBlock, onDeleteAsset, onStatusChange }) {
//   const dirtyCount = asset.blocks.filter((b) => b.isDirty).length;

//   return (
//     <article className="asset-document">
//       <div className="asset-document-header">
//         <div className="asset-document-meta">
//           <div className="asset-document-platform-badge">{asset.platformLabel}</div>
//           <h3 className="asset-document-title">{asset.title}</h3>
//           <p className="asset-document-source">{asset.sourceLabel}</p>
//         </div>
//         <div className="asset-document-controls">
//           <StatusPill status={asset.status} onSelect={(newStatus) => onStatusChange(asset.id, newStatus)} size="md" />
//           {dirtyCount > 0 && (
//             <span className="asset-document-dirty-badge">{dirtyCount} unsaved edit{dirtyCount > 1 ? "s" : ""}</span>
//           )}
//           <button className="ghost-button small danger-button" onClick={() => onDeleteAsset(asset.id)} type="button">Delete</button>
//         </div>
//       </div>

//       <div className="asset-document-blocks">
//         {asset.blocks.map((block) => (
//           <EditableBlock
//             key={block.id}
//             assetId={asset.id}
//             block={block}
//             isActive={activeBlockId === block.id}
//             onActivate={() => onSelectBlock(block.id)}
//             onBlur={onBlurBlock}
//             onChange={onBlockChange}
//             onRevert={onRevertBlock}
//           />
//         ))}
//       </div>
//     </article>
//   );
// }

// function HomePage({
//   profileMode, setProfileMode, sampleText, setSampleText,
//   youtubeText, youtubeTranscriptText,
//   profileStatus, profileError, voiceProfile,
//   onYoutubeProfileInputChange, onYoutubeProfileTranscriptChange,
//   onSaveSamplesProfile, onSaveYoutubeProfile,
//   generateStatus, generateError, videoInput, generateTranscript,
//   onGenerateVideoInputChange, onGenerateTranscriptChange,
//   targetAssets, selectedAssets, onAssetToggle, onGenerate,
//   workspaceAssets, onGoToWorkspace,
// }) {
//   return (
//     <>
//       <section className="workspace-grid">
//         <article className="panel">
//           <div className="panel-heading">
//             <div>
//               <p className="eyebrow">Voice profile</p>
//               <h2>Save the writing voice for this account</h2>
//             </div>
//             <StatusBadge status={profileStatus} />
//           </div>

//           <div className="mode-switch">
//             <button className={profileMode === "samples" ? "active" : ""} type="button" onClick={() => setProfileMode("samples")}>Paste writing samples</button>
//             <button className={profileMode === "youtube" ? "active" : ""} type="button" onClick={() => setProfileMode("youtube")}>Pull from YouTube</button>
//           </div>

//           {profileMode === "samples" ? (
//             <form className="stack-form" onSubmit={onSaveSamplesProfile}>
//               <label className="field">
//                 <span>Writing samples or transcripts</span>
//                 <textarea rows={10} placeholder="Paste one sample, leave a blank line, then paste the next sample." value={sampleText} onChange={(e) => setSampleText(e.target.value)} />
//               </label>
//               <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
//                 {profileStatus === "loading" ? "Refining..." : voiceProfile ? "Refine voice profile" : "Save voice profile"}
//               </button>
//             </form>
//           ) : (
//             <form className="stack-form" onSubmit={onSaveYoutubeProfile}>
//               <label className="field">
//                 <span>YouTube URLs or video IDs</span>
//                 <textarea rows={5} placeholder="Paste one YouTube URL or video ID per line." value={youtubeText} onChange={(e) => onYoutubeProfileInputChange(e.target.value)} />
//               </label>
//               <label className="field">
//                 <span>Or paste YouTube transcripts</span>
//                 <textarea rows={7} placeholder="Paste one transcript, leave a blank line, then paste the next transcript." value={youtubeTranscriptText} onChange={(e) => onYoutubeProfileTranscriptChange(e.target.value)} />
//               </label>
//               <button className="primary-button" type="submit" disabled={profileStatus === "loading"}>
//                 {profileStatus === "loading" ? "Refining..." : voiceProfile ? "Refine from YouTube" : "Build from YouTube"}
//               </button>
//             </form>
//           )}

//           {profileError ? <p className="error">{profileError}</p> : null}

//           {voiceProfile ? (
//             <div className="profile-summary">
//               <div className="summary-top">
//                 <div>
//                   <p className="eyebrow">Current saved profile</p>
//                   <h3>Version {voiceProfile.version}</h3>
//                 </div>
//                 <span className="summary-tag">{voiceProfile.voice_profile_json?.tone?.slice(0, 2).join(" / ") || "Saved"}</span>
//               </div>
//               <p className="summary-copy">{voiceProfile.style_summary || "Your saved voice profile will show here."}</p>
//               <p className="muted-copy">New samples now refine this profile over time instead of replacing it outright.</p>
//               <div className="summary-grid">
//                 <SummaryList title="Voice anchors" items={voiceProfile.voice_profile_json?.voice_anchors ?? []} />
//                 <SummaryList title="Preferred devices" items={voiceProfile.voice_profile_json?.preferred_devices ?? []} />
//                 <SummaryList title="Preferred phrases" items={voiceProfile.voice_profile_json?.preferred_phrases ?? []} />
//               </div>
//             </div>
//           ) : (
//             <div className="empty-panel">
//               <h3>No saved voice profile yet</h3>
//               <p>Save writing samples or YouTube transcripts once, and generation will reuse that profile for this account automatically.</p>
//             </div>
//           )}
//         </article>

//         <article className="panel">
//           <div className="panel-heading">
//             <div>
//               <p className="eyebrow">Generate</p>
//               <h2>Create the exact assets you need</h2>
//             </div>
//             <StatusBadge status={generateStatus} />
//           </div>

//           <form className="stack-form" onSubmit={onGenerate}>
//             <label className="field">
//               <span>YouTube URL or video ID</span>
//               <input type="text" placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ" value={videoInput} onChange={(e) => onGenerateVideoInputChange(e.target.value)} />
//             </label>
//             <label className="field">
//               <span>Or paste transcript</span>
//               <textarea rows={6} placeholder="Paste the transcript here if the YouTube video cannot be fetched." value={generateTranscript} onChange={(e) => onGenerateTranscriptChange(e.target.value)} />
//             </label>
//             <div className="field">
//               <span>Target assets</span>
//               <div className="asset-grid">
//                 {targetAssets.map((asset) => (
//                   <button key={asset.asset_type} type="button" className={`asset-chip ${selectedAssets.includes(asset.asset_type) ? "selected" : ""}`} onClick={() => onAssetToggle(asset.asset_type)}>
//                     <strong>{asset.label}</strong>
//                     <span>{asset.description}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <button className="primary-button" type="submit" disabled={generateStatus === "loading"}>
//               {generateStatus === "loading" ? "Generating..." : "Generate content"}
//             </button>
//           </form>

//           {generateError ? <p className="error">{generateError}</p> : null}

//           <div className="workspace-preview-card">
//             <div className="panel-heading compact">
//               <div>
//                 <p className="eyebrow">Workspace</p>
//                 <h3>Your persistent asset library</h3>
//               </div>
//               <span className="results-count">{workspaceAssets.length} assets</span>
//             </div>
//             <p className="muted-copy">Every generation gets added to your workspace instead of replacing the previous one. Open the workspace to edit, reuse, export, or delete any asset.</p>
//             <button className="ghost-button" onClick={onGoToWorkspace} type="button">Open workspace</button>
//           </div>
//         </article>
//       </section>
//     </>
//   );
// }

// function isStructuredObject(item) {
//   return item !== null && typeof item === "object" && !Array.isArray(item);
// }

// function serializeStructuredItem(item) {
//   const titleText = typeof item.title === "string" ? item.title.trim() : "";
//   const bodyKey = ["body", "content", "text", "summary", "caption"].find((k) => typeof item[k] === "string" && item[k].trim());
//   const bodyText = bodyKey ? item[bodyKey].trim() : "";
//   const parts = [];
//   if (titleText) parts.push(titleText);
//   if (bodyText) parts.push(bodyText);
//   return parts.join("\n");
// }

// function serializeListToText(list) {
//   return list.map((item) => isStructuredObject(item) ? serializeStructuredItem(item) : String(item ?? "")).join("\n\n");
// }

// function EditableBlock({ assetId, block, isActive, onActivate, onBlur, onChange, onRevert }) {
//   const [copied, setCopied] = useState(false);
//   const textareaRef = useRef(null);

//   useEffect(() => {
//     if (isActive && textareaRef.current) {
//       textareaRef.current.focus();
//       textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
//     }
//   }, [isActive]);

//   const isList = Array.isArray(block.value);
//   const hasStructuredItems = isList && block.value.some(isStructuredObject);

//   const handleCopy = async () => {
//     let content;
//     if (isList) {
//       content = hasStructuredItems ? serializeListToText(block.value) : block.value.join("\n");
//     } else {
//       content = String(block.value ?? "");
//     }
//     await navigator.clipboard.writeText(content);
//     setCopied(true);
//     window.setTimeout(() => setCopied(false), 1400);
//   };

//   const textareaValue = isList ? serializeListToText(block.value) : String(block.value ?? "");
//   const textareaRows = isList ? Math.max(6, textareaValue.split("\n").length + 1) : Math.max(5, estimateRows(block.value));

//   return (
//     <section className={`editable-block ${isActive ? "active" : ""} ${block.isDirty ? "dirty" : ""}`}>
//       <div className="editable-block-top">
//         <div>
//           <p className="content-label">{block.label}</p>
//           <span className="editable-block-hint">
//             {block.kind === "list"
//               ? hasStructuredItems ? `${block.value.length} sections` : `${block.value.length} lines`
//               : "Inline editable"}
//           </span>
//         </div>
//         <div className="editable-actions">
//           {block.isDirty && <span className="dirty-indicator">Edited</span>}
//           {!isActive ? <span className="edit-cue">Click to edit</span> : null}
//           <button className="ghost-button small" onClick={handleCopy} type="button">{copied ? "Copied ✓" : "Copy"}</button>
//           <button className="ghost-button small" onClick={() => onRevert(assetId, block.id)} type="button" disabled={!block.isDirty}>Revert</button>
//         </div>
//       </div>

//       {isActive ? (
//         <div className="editable-editor same-box-editor">
//           <textarea
//             ref={textareaRef}
//             rows={textareaRows}
//             value={textareaValue}
//             onBlur={onBlur}
//             onChange={(event) => {
//               if (hasStructuredItems || isList) {
//                 onChange(assetId, block.id, splitEditableList(event.target.value));
//               } else {
//                 onChange(assetId, block.id, event.target.value);
//               }
//             }}
//           />
//           <p className="muted-copy editor-note">
//             {hasStructuredItems
//               ? "Each section: title on first line, body below. Blank line separates sections."
//               : "Autosave is on. Use one line per item for list blocks."}
//           </p>
//         </div>
//       ) : (
//         <button className="editable-preview" onClick={onActivate} type="button">
//           <span className="editable-overlay-hint">Click to edit</span>
//           {isList ? (
//             hasStructuredItems ? (
//               <div className="content-sections">
//                 {block.value.map((item, index) =>
//                   isStructuredObject(item) ? (
//                     <div key={`${block.id}-${index}`} className="content-section-item">
//                       {item.title && <strong className="section-item-title">{item.title}</strong>}
//                       {(item.body || item.content || item.text) && (
//                         <p className="section-item-body">{item.body || item.content || item.text}</p>
//                       )}
//                     </div>
//                   ) : (
//                     <p key={`${block.id}-${index}`} className="content-section-plain">{String(item ?? "")}</p>
//                   ),
//                 )}
//               </div>
//             ) : (
//               <div className="content-list">
//                 {block.value.map((item, index) => (
//                   <p key={`${block.id}-${index}`}><span>{index + 1}</span>{item}</p>
//                 ))}
//               </div>
//             )
//           ) : (
//             <p className="content-text">{String(block.value)}</p>
//           )}
//         </button>
//       )}
//     </section>
//   );
// }

// function SummaryList({ title, items }) {
//   return (
//     <div className="summary-list">
//       <p className="content-label">{title}</p>
//       {items.length ? items.slice(0, 5).map((item) => <p key={item}>{item}</p>) : <p className="muted-copy">No items saved yet.</p>}
//     </div>
//   );
// }

// function StatusBadge({ status }) {
//   const labelMap = { idle: "Ready", loading: "Working", success: "Saved", error: "Error" };
//   return <span className={`status-badge status-${status}`}>{labelMap[status] ?? "Ready"}</span>;
// }

// function GenerationLoader({ job, selectedAssets, targetAssets }) {
//   const stageLabel = getStageLabel(job?.stage);
//   const elapsed = formatElapsed(job?.created_at);
//   const steps = Array.isArray(job?.steps) && job.steps.length
//     ? job.steps
//     : [
//         { key: "source", label: "Getting ready", status: "active" },
//         { key: "moments", label: "Understanding input", status: "pending" },
//         { key: "strategy", label: "Preparing content", status: "pending" },
//         { key: "execution", label: "Creating results", status: "pending" },
//         { key: "finalize", label: "Wrapping up", status: "pending" },
//       ];
//   const assetProgress = buildAssetProgress(job?.asset_progress, selectedAssets, targetAssets);
//   const realProgress = getRealLoaderProgress(job, steps, assetProgress);
//   const [displayProgress, setDisplayProgress] = useState(realProgress);
//   const progressPercent = Math.round(displayProgress);
//   const completedAssets = assetProgress.filter((a) => a.status === "completed").length;
//   const totalAssets = assetProgress.length;

//   useEffect(() => { setDisplayProgress(realProgress); }, [job?.id]);

//   useEffect(() => {
//     if (!job) return undefined;
//     const intervalId = window.setInterval(() => {
//       setDisplayProgress((current) => {
//         const target = getRealLoaderProgress(job, steps, assetProgress);
//         if (job.status === "completed") return Math.min(100, current + 3.5);
//         if (job.status === "failed") return current;
//         if (current < target) {
//           const jump = Math.max(0.5, (target - current) * 0.28);
//           return clampProgress(Math.min(target, current + jump));
//         }
//         if (current > target) return clampProgress(Math.max(target, current - 0.8));
//         return current;
//       });
//     }, 180);
//     return () => window.clearInterval(intervalId);
//   }, [job?.id, job?.status, job?.stage, job?.progress_percent, job?.updated_at]);

//   return (
//     <div className="loader-overlay">
//       <div className="loader-card">
//         <div className="loader-orb" />
//         <p className="loader-badge">ContentOS is generating</p>
//         <h2>Building your asset pack</h2>
//         <p className="loader-copy">{job?.detail || "Your request is in progress and the final content is on the way."}</p>
//         <div className="loader-progress-shell">
//           <div className="loader-progress-top">
//             <strong>{stageLabel}</strong>
//             <span>{progressPercent}%</span>
//           </div>
//           <div className="loader-progress-bar">
//             <div className="loader-progress-fill" style={{ width: `${progressPercent}%` }} />
//           </div>
//           <div className="loader-progress-meta">
//             <span>{job?.message || "Starting generation..."}</span>
//             <span>{totalAssets ? `${completedAssets}/${totalAssets} ready` : elapsed}</span>
//           </div>
//         </div>
//         <div className="loader-steps">
//           {steps.map((step) => (
//             <div key={step.key} className={`loader-step loader-step-${step.status || "pending"}`}>
//               <span /><p>{step.label}</p>
//             </div>
//           ))}
//         </div>
//         <div className="loader-assets">
//           {assetProgress.map((asset) => (
//             <div key={asset.asset_type} className={`loader-asset loader-asset-${asset.status}`}>
//               <div>
//                 <strong>{asset.label}</strong>
//                 <p>{getAssetStatusCopy(asset)}</p>
//               </div>
//               <span>{asset.status === "completed" ? "Done" : asset.status === "active" ? "Live" : "Next"}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Utilities ───

// async function apiFetch(path, options = {}, token = "") {
//   const headers = { "Content-Type": "application/json", ...(options.headers ?? {}) };
//   if (token) headers.Authorization = `Bearer ${token}`;
//   const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
//   const data = await response.json().catch(() => ({}));
//   if (!response.ok) {
//     const error = new Error(data.detail || "Request failed.");
//     error.status = response.status;
//     throw error;
//   }
//   return data;
// }

// function getRouteFromHash() {
//   const hash = window.location.hash.replace(/^#/, "");
//   return hash === "/workspace" ? "workspace" : DEFAULT_ROUTE;
// }

// function navigateTo(nextRoute) {
//   const nextHash = nextRoute === "workspace" ? "#/workspace" : "#/";
//   if (window.location.hash !== nextHash) window.location.hash = nextHash;
// }

// function buildVideoPayload(value) {
//   const trimmed = value.trim();
//   if (!trimmed) return {};
//   if (trimmed.startsWith("http")) return { video_url: trimmed };
//   return { video_id: trimmed };
// }

// function parseSampleBlocks(value) {
//   return value.split(/\n\s*\n/g).map((item) => item.trim()).filter(Boolean);
// }

// function parseLineItems(value) {
//   return value.split("\n").map((item) => item.trim()).filter(Boolean);
// }

// function persistAuth(nextToken, nextUser) {
//   localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
// }

// function clearAuthState() {
//   localStorage.removeItem(AUTH_STORAGE_KEY);
//   window.location.reload();
// }

// function safeParse(output) {
//   try { return typeof output === "string" ? JSON.parse(output) : output; }
//   catch { return { raw: output }; }
// }

// function formatLabel(label) { return label.replaceAll("_", " "); }
// function formatAssetLabel(assetType) { return assetType.replaceAll("_", " "); }

// function getPlatformHook(platform) {
//   const hooks = { twitter: "Thread draft", tiktok: "Short-form script", youtube: "Video angle", linkedin: "Professional post", instagram: "Instagram asset", blog: "Blog draft", reddit: "Reddit post", email: "Newsletter draft" };
//   return hooks[platform] ?? "Generated asset";
// }

// function buildGenerationSource({ videoInput, generateTranscript, selectedAssets }) {
//   if (videoInput.trim()) return `Generated from ${truncateText(videoInput.trim(), 68)} for ${selectedAssets.length} selected asset types.`;
//   return `Generated from pasted transcript for ${selectedAssets.length} selected asset types.`;
// }

// function buildWorkspaceAssets(results, sourceLabel) {
//   return results.map((result, index) => {
//     const data = safeParse(result.output);
//     const now = new Date().toISOString();
//     const title = result.asset_type ? formatAssetLabel(result.asset_type) : getPlatformHook(result.platform);
//     return {
//       id: buildAssetId(result, index),
//       title,
//       platformLabel: capitalize(result.platform || "generated"),
//       assetType: result.asset_type || "generic",
//       sourceLabel,
//       status: ASSET_STATUS_DRAFT,
//       createdAt: now,
//       updatedAt: now,
//       blocks: buildBlocksFromOutput(data),
//     };
//   });
// }

// function buildBlocksFromOutput(data) {
//   return Object.entries(data).map(([key, value], index) => ({
//     id: `${key}-${index}-${generateLocalId()}`,
//     key,
//     label: formatLabel(key),
//     kind: Array.isArray(value) ? "list" : "text",
//     value: Array.isArray(value) ? value.map(formatListItemValue) : formatTextBlockValue(value),
//     originalValue: Array.isArray(value) ? value.map(formatListItemValue) : formatTextBlockValue(value),
//     isDirty: false,
//   }));
// }

// function formatTextBlockValue(value) {
//   if (value === null || value === undefined) return "";
//   if (typeof value === "string") return value;
//   if (typeof value === "number" || typeof value === "boolean") return String(value);
//   if (Array.isArray(value)) return value.map(formatListItemValue).join("\n");
//   const readable = extractReadableObjectText(value);
//   if (readable) return readable;
//   return safeStringify(value);
// }

// function formatListItemValue(value) {
//   if (value === null || value === undefined) return "";
//   if (typeof value === "string") return value.trim();
//   if (typeof value === "number" || typeof value === "boolean") return String(value);
//   if (typeof value === "object" && !Array.isArray(value)) return value;
//   const text = formatTextBlockValue(value);
//   return text.split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
// }

// function extractReadableObjectText(value) {
//   if (!value || typeof value !== "object") return "";
//   const titleText = typeof value.title === "string" ? value.title.trim() : "";
//   const bodyKey = ["body", "content", "text", "summary", "caption"].find((k) => typeof value[k] === "string" && value[k].trim());
//   const bodyText = bodyKey ? value[bodyKey].trim() : "";
//   if (titleText && bodyText) return `${titleText}\n${bodyText}`;
//   if (titleText) return titleText;
//   if (bodyText) return bodyText;
//   for (const key of ["value"]) {
//     const candidate = value[key];
//     if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
//   }
//   for (const key of ["paragraphs", "sections", "blocks", "items"]) {
//     if (!Array.isArray(value[key])) continue;
//     const combined = value[key].map(formatTextBlockValue).map((item) => item.trim()).filter(Boolean).join("\n\n");
//     if (combined) return combined;
//   }
//   return "";
// }

// function safeStringify(value) {
//   try { return JSON.stringify(value, null, 2); }
//   catch { return String(value ?? ""); }
// }

// function buildAssetId(result, index) {
//   return `${result.platform || "platform"}-${result.asset_type || "asset"}-${index}-${generateLocalId()}`;
// }

// function generateLocalId() { return Math.random().toString(36).slice(2, 9); }

// function getWorkspaceStorageKey(user) {
//   const identifier = user?.id || user?.email || "anonymous";
//   return `${WORKSPACE_STORAGE_PREFIX}:${identifier}`;
// }

// function readWorkspace(user) {
//   try { return JSON.parse(localStorage.getItem(getWorkspaceStorageKey(user)) ?? "{}"); }
//   catch { return {}; }
// }

// function writeWorkspace(user, payload) {
//   localStorage.setItem(getWorkspaceStorageKey(user), JSON.stringify(payload));
// }

// function serializeWorkspace(assets) { return assets.map(serializeAsset).join("\n\n"); }

// function serializeAsset(asset) {
//   const lines = [`${asset.title} (${asset.platformLabel})`, `Status: ${formatAssetStatus(asset.status)}`, `${asset.sourceLabel}`, ""];
//   for (const block of asset.blocks) {
//     lines.push(`${block.label}:`);
//     if (Array.isArray(block.value)) {
//       for (const item of block.value) {
//         lines.push(isStructuredObject(item) ? `- ${serializeStructuredItem(item)}` : `- ${item}`);
//       }
//     } else {
//       lines.push(String(block.value));
//     }
//     lines.push("");
//   }
//   return lines.join("\n").trim();
// }

// function normalizeBlockValue(value) {
//   if (Array.isArray(value)) return value.map((item) => isStructuredObject(item) ? serializeStructuredItem(item) : String(item ?? "").trim()).join("\n");
//   return String(value ?? "").trim();
// }

// function splitEditableList(value) {
//   return value.split("\n").map((item) => item.trim()).filter(Boolean);
// }

// function estimateRows(value) { return String(value ?? "").split("\n").length + 1; }

// function getWorkspaceSaveLabel(status) {
//   if (status === "saving") return "Autosaving";
//   if (status === "saved") return "Saved";
//   if (status === "error") return "Save issue";
//   return "Ready";
// }

// function capitalize(value) {
//   if (!value) return "";
//   return value.charAt(0).toUpperCase() + value.slice(1);
// }

// function formatAssetStatus(status) {
//   const labels = { [ASSET_STATUS_DRAFT]: "Draft", [ASSET_STATUS_READY]: "Ready", [ASSET_STATUS_PUBLISHED]: "Published" };
//   return labels[status] || status;
// }

// function truncateText(value, maxLength) {
//   if (value.length <= maxLength) return value;
//   return `${value.slice(0, maxLength - 1)}…`;
// }

// function formatWorkspaceDate(value) {
//   if (!value) return "Saved recently";
//   return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
// }

// function buildAssetProgress(jobAssets, selectedAssets, targetAssets) {
//   if (Array.isArray(jobAssets) && jobAssets.length) return jobAssets;
//   const labelByAsset = Object.fromEntries(targetAssets.map((a) => [a.asset_type, a.label]));
//   return selectedAssets.map((assetType) => ({
//     asset_type: assetType,
//     label: labelByAsset[assetType] || formatAssetLabel(assetType),
//     status: "pending",
//     attempt: 0,
//   }));
// }

// function getStageLabel(stage) {
//   const labels = { queued: "Queued", starting: "Starting", source: "Getting ready", moments: "Understanding input", strategy: "Preparing content", execution: "Creating results", execution_preparing: "Preparing creation", execution_writing: "Creating results", execution_review: "Improving results", execution_polish: "Finalizing results", finalizing: "Wrapping up", finalize: "Wrapping up", completed: "Completed", failed: "Stopped" };
//   return labels[stage] || "Generating";
// }

// function getAssetStatusCopy(asset) {
//   if (asset.status === "completed") return "Finished and ready in your pack.";
//   if (asset.status === "active") return "Currently being prepared for you.";
//   return "Waiting to be completed next.";
// }

// function formatElapsed(isoValue) {
//   if (!isoValue) return "Just started";
//   const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoValue).getTime()) / 1000));
//   if (seconds < 5) return "Just started";
//   if (seconds < 60) return `${seconds}s elapsed`;
//   const minutes = Math.floor(seconds / 60);
//   const remainder = seconds % 60;
//   return `${minutes}m ${remainder}s elapsed`;
// }

// function clampProgress(value) { return Math.max(0, Math.min(100, Number(value) || 0)); }

// function getRealLoaderProgress(job, steps, assetProgress) {
//   if (!job) return 4;
//   if (job.status === "completed") return 100;
//   const stepWeight = { source: 8, moments: 10, strategy: 12, execution: 60, finalize: 10 };
//   let progress = 2;
//   for (const step of steps) {
//     if (step.key === "execution") continue;
//     const weight = stepWeight[step.key] ?? 0;
//     if (step.status === "completed") progress += weight;
//     else if (step.status === "active") progress += weight * 0.55;
//   }
//   const totalAssets = assetProgress.length;
//   if (totalAssets) {
//     const perAssetWeight = stepWeight.execution / totalAssets;
//     const completedAssets = assetProgress.filter((a) => a.status === "completed").length;
//     const activeAssets = assetProgress.filter((a) => a.status === "active").length;
//     progress += completedAssets * perAssetWeight;
//     if (activeAssets > 0) progress += getActiveAssetPartial(job, perAssetWeight) * activeAssets;
//   } else {
//     const executionStep = steps.find((s) => s.key === "execution");
//     if (executionStep?.status === "completed") progress += stepWeight.execution;
//     else if (executionStep?.status === "active") progress += stepWeight.execution * 0.4;
//   }
//   if (job.stage === "finalize" || job.stage === "finalizing") progress = Math.max(progress, 92);
//   return clampProgress(progress);
// }

// function getActiveAssetPartial(job, perAssetWeight) {
//   const lastUpdate = job?.updated_at ? new Date(job.updated_at).getTime() : Date.now();
//   const secondsSinceUpdate = Math.max(0, (Date.now() - lastUpdate) / 1000);
//   const eased = Math.min(0.92, 0.18 + secondsSinceUpdate / 28);
//   return perAssetWeight * eased;
// }

// export default App;


import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";
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
  const [route, setRoute] = useState(() => getRouteFromHash());
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
  const [generateStatus, setGenerateStatus] = useState("idle");
  const [generateError, setGenerateError] = useState("");
  const [generateJob, setGenerateJob] = useState(null);
  const [lastGeneratedCount, setLastGeneratedCount] = useState(0);
  const [targetAssets, setTargetAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);

  const [workspaceAssets, setWorkspaceAssets] = useState([]);
  const [workspaceSaveStatus, setWorkspaceSaveStatus] = useState("idle");
  const [activeAssetId, setActiveAssetId] = useState("");
  const [activeBlockId, setActiveBlockId] = useState("");
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);

  const [profileMode, setProfileMode] = useState("samples");
  const [sampleText, setSampleText] = useState("");
  const [youtubeText, setYoutubeText] = useState("");
  const [youtubeTranscriptText, setYoutubeTranscriptText] = useState("");
  const [profileStatus, setProfileStatus] = useState("idle");
  const [profileError, setProfileError] = useState("");
  const [voiceProfile, setVoiceProfile] = useState(null);

  useEffect(() => {
    const syncRoute = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTargetAssets() {
      try {
        const response = await apiFetch("/target-assets", { method: "GET" });
        if (cancelled) return;
        const catalog = Array.isArray(response.target_assets) ? response.target_assets : [];
        setTargetAssets(catalog);
        setSelectedAssets((current) =>
          current.length ? current : catalog.slice(0, 3).map((asset) => asset.asset_type),
        );
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
            const source = buildGenerationSource({ videoInput, generateTranscript, selectedAssets });
            const newAssets = buildWorkspaceAssets(generatedResults, source);
            setWorkspaceAssets((current) => [...newAssets, ...current]);
            setActiveAssetId(newAssets[0]?.id || "");
            setActiveBlockId("");
            setLastGeneratedCount(newAssets.length);
            setGenerateStatus("success");
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

  const handleAssetToggle = (assetType) => {
    setSelectedAssets((current) => {
      if (current.includes(assetType)) return current.filter((item) => item !== assetType);
      return [...current, assetType];
    });
  };

  const handleGenerateVideoInputChange = (value) => {
    setVideoInput(value);
    if (value.trim()) setGenerateTranscript("");
  };

  const handleGenerateTranscriptChange = (value) => {
    setGenerateTranscript(value);
    if (value.trim()) setVideoInput("");
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
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!videoInput.trim() && !generateTranscript.trim()) {
      setGenerateError("Paste a YouTube URL/video ID or a transcript to generate content.");
      return;
    }
    if (!selectedAssets.length) { setGenerateError("Choose at least one asset type."); return; }
    setGenerateStatus("loading");
    setGenerateError("");
    setGenerateJob(null);
    setLastGeneratedCount(0);
    try {
      const payload = {
        ...buildVideoPayload(videoInput),
        transcript: generateTranscript.trim(),
        target_assets: selectedAssets,
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
            onGenerateVideoInputChange={handleGenerateVideoInputChange}
            onGenerateTranscriptChange={handleGenerateTranscriptChange}
            targetAssets={targetAssets}
            selectedAssets={selectedAssets}
            onAssetToggle={handleAssetToggle}
            onGenerate={handleGenerate}
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

function AssetDocument({ asset, activeBlockId, onSelectBlock, onBlurBlock, onBlockChange, onRevertBlock, onDeleteAsset, onStatusChange }) {
  const dirtyCount = asset.blocks.filter((b) => b.isDirty).length;

  return (
    <article className="asset-document">
      <div className="asset-document-top">
        <div>
          <p className="platform">{asset.platformLabel}</p>
          <h3>{asset.title}</h3>
          <p className="muted-copy asset-meta">{asset.sourceLabel}</p>
        </div>
        <div className="asset-controls">
          <StatusPill status={asset.status} onSelect={(newStatus) => onStatusChange(asset.id, newStatus)} size="md" />
          {dirtyCount > 0 && (
            <span className="asset-document-dirty-badge">{dirtyCount} unsaved edit{dirtyCount > 1 ? "s" : ""}</span>
          )}
          <button className="ghost-button small danger-button" onClick={() => onDeleteAsset(asset.id)} type="button">Delete asset</button>
        </div>
      </div>

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
    </article>
  );
}

function HomePage({
  profileMode, setProfileMode, sampleText, setSampleText,
  youtubeText, youtubeTranscriptText,
  profileStatus, profileError, voiceProfile,
  onYoutubeProfileInputChange, onYoutubeProfileTranscriptChange,
  onSaveSamplesProfile, onSaveYoutubeProfile,
  generateStatus, generateError, videoInput, generateTranscript,
  onGenerateVideoInputChange, onGenerateTranscriptChange,
  targetAssets, selectedAssets, onAssetToggle, onGenerate,
  workspaceAssets, onGoToWorkspace,
}) {
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
            <label className="field">
              <span>Or paste transcript</span>
              <textarea rows={6} placeholder="Paste the transcript here if the YouTube video cannot be fetched." value={generateTranscript} onChange={(e) => onGenerateTranscriptChange(e.target.value)} />
            </label>
            <div className="field">
              <span>Target assets</span>
              <div className="asset-grid">
                {targetAssets.map((asset) => (
                  <button key={asset.asset_type} type="button" className={`asset-chip ${selectedAssets.includes(asset.asset_type) ? "selected" : ""}`} onClick={() => onAssetToggle(asset.asset_type)}>
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

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "/workspace" ? "workspace" : DEFAULT_ROUTE;
}

function navigateTo(nextRoute) {
  const nextHash = nextRoute === "workspace" ? "#/workspace" : "#/";
  if (window.location.hash !== nextHash) window.location.hash = nextHash;
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

function buildWorkspaceAssets(results, sourceLabel) {
  return results.map((result, index) => {
    const data = safeParse(result.output);
    const now = new Date().toISOString();
    const title = result.asset_type ? formatAssetLabel(result.asset_type) : getPlatformHook(result.platform);
    return {
      id: buildAssetId(result, index),
      title,
      platformLabel: capitalize(result.platform || "generated"),
      assetType: result.asset_type || "generic",
      sourceLabel,
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
  const labels = { queued: "Queued", starting: "Starting", source: "Getting ready", moments: "Understanding input", strategy: "Preparing content", execution: "Creating results", execution_preparing: "Preparing creation", execution_writing: "Creating results", execution_review: "Improving results", execution_polish: "Finalizing results", finalizing: "Wrapping up", finalize: "Wrapping up", completed: "Completed", failed: "Stopped" };
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
