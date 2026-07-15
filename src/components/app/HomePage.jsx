import { StatusBadge, SummaryList } from "./Shared";
import { isTemporarilyUnavailableAsset } from "../../lib/appUtils";
import { PageHeader, SegmentedControl, EmptyState, Icon } from "../ui";

export default function HomePage({
  profileMode,
  setProfileMode,
  sampleText,
  setSampleText,
  youtubeText,
  youtubeTranscriptText,
  profileStatus,
  profileError,
  voiceProfile,
  onYoutubeProfileInputChange,
  onYoutubeProfileTranscriptChange,
  onSaveSamplesProfile,
  onSaveYoutubeProfile,
  generateStatus,
  generateError,
  videoInput,
  generateTranscript,
  uploadedVideo,
  onGenerateVideoInputChange,
  onGenerateTranscriptChange,
  onGenerateUploadedVideoChange,
  targetAssets,
  selectedAssets,
  onAssetToggle,
  onGenerate,
  unavailableMessage,
  workspaceAssets,
  onGoToWorkspace,
}) {
  return (
    <div className="home-page">
      <PageHeader
        eyebrow="Main"
        title="Voice and generation"
        subtitle="Save your writing voice, then turn one source into platform-ready assets for your workspace."
      />

      <section className="workspace-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Voice profile</p>
              <h2>Save the writing voice for this account</h2>
            </div>
            <StatusBadge status={profileStatus} />
          </div>

          <SegmentedControl
            name="profile-mode"
            value={profileMode}
            onChange={setProfileMode}
            options={[
              { value: "samples", label: "Paste writing samples" },
              { value: "youtube", label: "Pull from YouTube" },
            ]}
          />

          {profileMode === "samples" ? (
            <form className="stack-form" onSubmit={onSaveSamplesProfile}>
              <label className="field">
                <span>Writing samples or transcripts</span>
                <textarea
                  rows={10}
                  placeholder="Paste one sample, leave a blank line, then paste the next sample."
                  value={sampleText}
                  onChange={(event) => setSampleText(event.target.value)}
                />
              </label>
              <button
                className="primary-button"
                type="submit"
                disabled={profileStatus === "loading"}
              >
                {profileStatus === "loading"
                  ? "Refining..."
                  : voiceProfile
                    ? "Refine voice profile"
                    : "Save voice profile"}
              </button>
            </form>
          ) : (
            <form className="stack-form" onSubmit={onSaveYoutubeProfile}>
              <label className="field">
                <span>YouTube URLs or video IDs</span>
                <textarea
                  rows={5}
                  placeholder="Paste one YouTube URL or video ID per line."
                  value={youtubeText}
                  onChange={(event) =>
                    onYoutubeProfileInputChange(event.target.value)
                  }
                />
              </label>
              <label className="field">
                <span>Or paste YouTube transcripts</span>
                <textarea
                  rows={7}
                  placeholder="Paste one transcript, leave a blank line, then paste the next transcript."
                  value={youtubeTranscriptText}
                  onChange={(event) =>
                    onYoutubeProfileTranscriptChange(event.target.value)
                  }
                />
              </label>
              <button
                className="primary-button"
                type="submit"
                disabled={profileStatus === "loading"}
              >
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
                  {voiceProfile.voice_profile_json?.tone?.slice(0, 2).join(" / ") ||
                    "Saved"}
                </span>
              </div>
              <p className="summary-copy">
                {voiceProfile.style_summary ||
                  "Your saved voice profile will show here."}
              </p>
              <p className="muted-copy">
                New samples now refine this profile over time instead of replacing it
                outright.
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
            <EmptyState
              icon={<Icon name="workspace" className="h-5 w-5" />}
              title="No saved voice profile yet"
              description="Save writing samples or YouTube transcripts once, and generation will reuse that profile for this account automatically."
            />
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
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ"
                value={videoInput}
                onChange={(event) =>
                  onGenerateVideoInputChange(event.target.value)
                }
              />
            </label>
            <div className="field">
              <span>Upload a video</span>
              <input
                type="file"
                accept="video/*,.mp4,.mov,.m4v,.avi,.mkv"
                onChange={(event) =>
                  onGenerateUploadedVideoChange(event.target.files?.[0] ?? null)
                }
              />
              {uploadedVideo ? (
                <div className="uploaded-file-pill">
                  <span>{uploadedVideo.name}</span>
                  <button
                    type="button"
                    onClick={() => onGenerateUploadedVideoChange(null)}
                  >
                    Clear
                  </button>
                </div>
              ) : null}
            </div>
            <label className="field">
              <span>Or paste transcript</span>
              <textarea
                rows={6}
                placeholder="Paste the transcript here if the YouTube video cannot be fetched."
                value={generateTranscript}
                onChange={(event) =>
                  onGenerateTranscriptChange(event.target.value)
                }
              />
            </label>
            <div className="field">
              <span>Target assets</span>
              <div className="asset-grid">
                {targetAssets.map((asset) => {
                  const unavailable = isTemporarilyUnavailableAsset(
                    asset.asset_type,
                  );

                  return (
                    <button
                      key={asset.asset_type}
                      type="button"
                      className={[
                        "asset-chip",
                        selectedAssets.includes(asset.asset_type) ? "selected" : "",
                        unavailable ? "asset-chip-unavailable" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => onAssetToggle(asset.asset_type)}
                      title={unavailable ? "Temporarily unavailable" : undefined}
                      aria-disabled={unavailable ? "true" : undefined}
                    >
                      <strong>{asset.label}</strong>
                      <span>{asset.description}</span>
                      {unavailable ? (
                        <span className="asset-chip-status" aria-hidden="true">
                          Temporarily unavailable
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {unavailableMessage ? (
                <p
                  className="asset-unavailable-message"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    className="asset-unavailable-message-icon"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  <span>{unavailableMessage}</span>
                </p>
              ) : null}
            </div>
            <button
              className="primary-button"
              type="submit"
              disabled={generateStatus === "loading"}
            >
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
            <p className="muted-copy">
              Every generation gets added to your workspace instead of replacing the
              previous one. Open the workspace to edit, reuse, export, or delete any
              asset.
            </p>
            <button className="ghost-button" onClick={onGoToWorkspace} type="button">
              Open workspace
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
