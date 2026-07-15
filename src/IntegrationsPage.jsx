"use client";

import { useEffect, useState } from "react";

import { useAppState } from "./components/app/AppProvider";
import { apiFetch } from "./lib/appUtils";

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 7.03A1.97 1.97 0 1 0 5.2 3.1a1.97 1.97 0 0 0 .05 3.94ZM20.44 13.07c0-3.46-1.85-5.07-4.31-5.07-1.99 0-2.88 1.09-3.38 1.86V8.5H9.37c.04.9 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.12-.92.27-.68.88-1.38 1.9-1.38 1.34 0 1.88 1.03 1.88 2.54V20H20v-6.93Z"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 3H21l-4.59 5.24L21.8 21h-4.22l-3.3-4.32L10.5 21H8.4l4.9-5.6L2.2 3h4.32l2.98 3.91L12.9 3h6Zm-1.48 15.46h1.16L5.95 4.46H4.7l12.72 14Z"
      />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.58 7.2a2.96 2.96 0 0 0-2.08-2.1C17.67 4.6 12 4.6 12 4.6s-5.67 0-7.5.5A2.96 2.96 0 0 0 2.42 7.2 30.4 30.4 0 0 0 2 12a30.4 30.4 0 0 0 .42 4.8 2.96 2.96 0 0 0 2.08 2.1c1.83.5 7.5.5 7.5.5s5.67 0 7.5-.5a2.96 2.96 0 0 0 2.08-2.1A30.4 30.4 0 0 0 22 12a30.4 30.4 0 0 0-.42-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"
      />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.75 1.35a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z"
      />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.7 2h2.86a4.8 4.8 0 0 0 3.08 3.35v2.92a7.78 7.78 0 0 1-2.9-.55v6.03a6.25 6.25 0 1 1-6.25-6.25c.3 0 .6.03.88.08v2.95a3.3 3.3 0 0 0-.88-.12 3.34 3.34 0 1 0 3.35 3.34V2Z"
      />
    </svg>
  );
}

function IconMedium() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6.5c0-.28-.03-.55-.18-.77L2.5 4.15V4h6.1l4.72 10.35L17.46 4H23v.15l-1.13 1.08c-.1.08-.15.22-.12.35v12.84c-.03.13.02.27.12.35L23 19.85V20h-5.68v-.15l1.17-1.14c.12-.12.12-.15.12-.35V7.98l-4.88 12h-.66L7.4 7.98v8.7c-.03.27.06.54.24.74l1.52 1.84V20H5.02v-.15l1.52-1.84a1.1 1.1 0 0 0 .2-.74V7.22a.73.73 0 0 0-.2-.6L4 6.65V6.5Z"
      />
    </svg>
  );
}

function IconSubstack() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M4 4.5h16V7H4V4.5Zm0 4h16V20H4V8.5Zm2.1 2.1V18h11.8v-7.4H6.1Z" />
    </svg>
  );
}

function IconNotion() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.2 4.4 16.3 3.6c1.35-.1 1.7-.03 2.55.58l3.55 2.5c.58.4.78.72.78 1.2v11.9c0 .75-.27 1.2-1.22 1.28l-12.9.78c-.83.05-1.23-.08-1.66-.63L2.3 17.6c-.47-.6-.67-1.02-.67-1.67V5.74c0-.8.35-1.28 1.08-1.34l2.48-.2Zm1.35 2.26v10.8l2.3-.17V9.12l4.73 7.84 2.83-.2V5.93l-2.28.16v7.74L9.4 6.86l-2.85-.2Z"
      />
    </svg>
  );
}

function IconGhost() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.15 3.2C12.47 3.2 8 7.58 8 13.03c0 1.85.38 3.2 1.18 4.63l-2.3 3.14h3.92l1.27-1.7c1.01.26 1.98.4 3.07.4 5.67 0 8.86-3.96 8.86-8.15 0-4.88-2.97-8.15-5.85-8.15Zm-.3 3.34c1.23 0 2.22.98 2.22 2.2a2.2 2.2 0 0 1-4.4 0c0-1.22.98-2.2 2.18-2.2Zm-5 5.55a1.78 1.78 0 1 1 0-3.56 1.78 1.78 0 0 1 0 3.56Zm5.1 4.5c-2.46 0-3.54-1.32-3.82-2.24h1.88c.2.38.73.85 1.94.85 1.2 0 1.9-.62 2.16-1.22h1.9c-.45 1.64-1.96 2.6-4.06 2.6Z"
      />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v1.38l4.1-2.35A1.25 1.25 0 0 1 22 6.62v10.76a1.25 1.25 0 0 1-1.9 1.09L16 16.12v1.38A2.5 2.5 0 0 1 13.5 20h-7A2.5 2.5 0 0 1 4 17.5v-11Z" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="m17.73 3.98 2.3 2.3a1.75 1.75 0 0 1 0 2.47l-9.2 9.2-4.12.83.84-4.12 9.2-9.2a1.75 1.75 0 0 1 2.47 0ZM6 20h12v1.8H6z" />
    </svg>
  );
}

function IconPublish() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3 4.5 10.1h4.2V17h6.6v-6.9h4.2L12 3Zm-7 15.2h14V21H5v-2.8Z" />
    </svg>
  );
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    platform: "publishing",
    category: "Publishing",
    status: "available",
    description: "Publish professional posts and articles",
    icon: <IconLinkedIn />,
  },
  {
    id: "x",
    name: "X / Twitter",
    platform: "publishing",
    category: "Publishing",
    status: "available",
    description: "Share threads and engage your audience",
    icon: <IconX />,
  },
  {
    id: "youtube",
    name: "YouTube",
    platform: "publishing",
    category: "Publishing",
    status: "available",
    description: "Upload YouTube Shorts and short-form videos",
    icon: <IconYouTube />,
  },
  {
    id: "instagram",
    name: "Instagram",
    platform: "publishing",
    category: "Publishing",
    status: "available",
    description: "Publish reels and carousel posts",
    icon: <IconInstagram />,
  },
  {
    id: "tiktok",
    name: "TikTok",
    platform: "publishing",
    category: "Publishing",
    status: "coming-soon",
    description: "Publish short-form video content",
    icon: <IconTikTok />,
  },
  {
    id: "medium",
    name: "Medium",
    platform: "publishing",
    category: "Publishing",
    status: "coming-soon",
    description: "Publish blog posts and articles",
    icon: <IconMedium />,
  },
  {
    id: "substack",
    name: "Substack",
    platform: "publishing",
    category: "Publishing",
    status: "coming-soon",
    description: "Send newsletters to subscribers",
    icon: <IconSubstack />,
  },
  {
    id: "notion",
    name: "Notion",
    platform: "storage",
    category: "Storage",
    status: "coming-soon",
    description: "Save and organize content",
    icon: <IconNotion />,
  },
  {
    id: "ghost",
    name: "Ghost",
    platform: "publishing",
    category: "Publishing",
    status: "available",
    description: "Publish blog posts and newsletter issues to your Ghost site",
    icon: <IconGhost />,
  },
];

const ALL_INTEGRATIONS = [...AVAILABLE_INTEGRATIONS];

const DEFAULT_GHOST_FORM = {
  adminApiUrl: "",
  adminApiKey: "",
  defaultNewsletterSlug: "",
};

export default function IntegrationsPage() {
  const { token, refreshIntegrationStatus } = useAppState();
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [callbackNotice, setCallbackNotice] = useState(null);
  const [ghostForm, setGhostForm] = useState(DEFAULT_GHOST_FORM);
  const [ghostConnection, setGhostConnection] = useState(null);
  const [showGhostConnectForm, setShowGhostConnectForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const linkedinStatus = params.get("linkedin");
    const xStatus = params.get("x");
    const instagramStatus = params.get("instagram");
    const youtubeStatus = params.get("youtube");
    const reason = params.get("reason");

    async function loadIntegrationStatus() {
      if (!token) {
        return;
      }

      try {
        const platforms = await refreshIntegrationStatus({ accessToken: token });
        if (cancelled) return;
        setConnectedPlatforms(platforms);

        if (platforms.includes("ghost")) {
          try {
            const ghostResponse = await apiFetch("/ghost/newsletters", { method: "GET" }, token);
            if (!cancelled) {
              setGhostConnection(ghostResponse);
            }
          } catch (error) {
            if (!cancelled) {
              setToastMessage(error.message || "Could not load Ghost connection details.");
              window.setTimeout(() => setToastMessage(""), 3000);
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          setToastMessage(error.message || "Could not load integration status.");
          window.setTimeout(() => setToastMessage(""), 3000);
        }
      }
    }

    if (linkedinStatus === "connected") {
      setCallbackNotice({
        type: "success",
        title: "LinkedIn connected",
        message: "Your LinkedIn account is now connected and ready to use.",
      });
    } else if (linkedinStatus === "error") {
      setCallbackNotice({
        type: "error",
        title: "LinkedIn connection failed",
        message: "We could not finish the LinkedIn connection. Please try again.",
      });
    }

    if (xStatus === "connected") {
      setCallbackNotice({
        type: "success",
        title: "X connected",
        message: "Your X account is now connected and ready to use.",
      });
    } else if (xStatus === "error") {
      setCallbackNotice({
        type: "error",
        title: "X connection failed",
        message: reason
          ? `We could not finish the X connection (${reason}). Please try again.`
          : "We could not finish the X connection. Please try again.",
      });
    } else if (instagramStatus === "connected") {
      setCallbackNotice({
        type: "success",
        title: "Instagram connected",
        message: "Your Instagram account is now connected and ready to use.",
      });
    } else if (instagramStatus === "error") {
      setCallbackNotice({
        type: "error",
        title: "Instagram connection failed",
        message: reason
          ? `We could not finish the Instagram connection (${reason}). Please try again.`
          : "We could not finish the Instagram connection. Please try again.",
      });
    } else if (youtubeStatus === "connected") {
      setCallbackNotice({
        type: "success",
        title: "YouTube connected",
        message: "Your YouTube channel is now connected and ready to use.",
      });
    } else if (youtubeStatus === "error") {
      setCallbackNotice({
        type: "error",
        title: "YouTube connection failed",
        message: reason
          ? `We could not finish the YouTube connection (${reason}). Please try again.`
          : "We could not finish the YouTube connection. Please try again.",
      });
    }

    loadIntegrationStatus();

    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, "", cleanUrl);

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleGhostFieldChange = (field, value) => {
    setGhostForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleConnect = async (integrationId, integrationName) => {
    const integration = ALL_INTEGRATIONS.find((item) => item.id === integrationId);
    if (integration?.status === "coming-soon") {
      setToastMessage(`${integrationName} is coming soon.`);
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    if (integrationId === "ghost") {
      setToastMessage("Enter your Ghost Admin API URL and key to connect this site.");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [integrationId]: true }));

    try {
      const endpoint =
        integrationId === "linkedin"
          ? "/auth/linkedin"
          : integrationId === "instagram"
            ? "/auth/instagram"
            : integrationId === "youtube"
              ? "/auth/youtube"
              : "/auth/x";
      const response = await apiFetch(endpoint, { method: "GET" }, token);
      if (!response?.auth_url) {
        throw new Error(`Could not start the ${integrationName} connection.`);
      }
      window.location.href = response.auth_url;
    } catch (error) {
      setLoadingStates((prev) => ({ ...prev, [integrationId]: false }));
      setToastMessage(error.message || `Could not connect to ${integrationName}.`);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleGhostConnect = async () => {
    if (!token) {
      setToastMessage("Log in before connecting Ghost.");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, ghost: true }));
    try {
      const response = await apiFetch(
        "/ghost/connect",
        {
          method: "POST",
          body: JSON.stringify({
            admin_api_url: ghostForm.adminApiUrl,
            admin_api_key: ghostForm.adminApiKey,
            default_newsletter_slug: ghostForm.defaultNewsletterSlug || undefined,
          }),
        },
        token,
      );
      setGhostConnection(response);
      setConnectedPlatforms((current) => Array.from(new Set([...current, "ghost"])));
      await refreshIntegrationStatus({ accessToken: token });
      setShowGhostConnectForm(false);
      setCallbackNotice({
        type: "success",
        title: "Ghost connected",
        message: response.site_title
          ? `${response.site_title} is now connected and ready for blog posts and newsletters.`
          : "Your Ghost site is now connected and ready for publishing.",
      });
      setGhostForm(DEFAULT_GHOST_FORM);
    } catch (error) {
      setCallbackNotice({
        type: "error",
        title: "Ghost connection failed",
        message: error.message || "We could not connect to Ghost. Please check the Admin API URL and key.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, ghost: false }));
    }
  };

  const handleDisconnect = (integrationId, integrationName) => {
    setConnectedPlatforms((prev) => prev.filter((id) => id !== integrationId));
    if (integrationId === "ghost") {
      setGhostConnection(null);
      setShowGhostConnectForm(false);
    }
    setToastMessage(`Disconnected from ${integrationName}.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <section className="integrations-page">
      <div className="integrations-header ui-page-header">
        <div className="ui-page-header-copy">
          <p className="eyebrow">Integrations</p>
          <h1>Connect your platforms</h1>
          <p className="integrations-subtitle ui-page-header-subtitle">
            Connect your platforms to publish, schedule, and manage content
            directly from the workspace.
          </p>
        </div>
      </div>

      {callbackNotice ? (
        <div className={`integration-callback-banner ${callbackNotice.type}`}>
          <div className="integration-callback-icon" aria-hidden="true">
            {callbackNotice.type === "success" ? "OK" : "!"}
          </div>
          <div>
            <strong>{callbackNotice.title}</strong>
            <p>{callbackNotice.message}</p>
          </div>
        </div>
      ) : null}

      <div className="workflow-preview workflow-preview-animated">
        <div className="workflow-step">
          <div className="workflow-icon"><IconVideo /></div>
          <p className="workflow-label">Generate Content</p>
          <span className="workflow-desc">From YouTube videos</span>
        </div>
        <div className="workflow-connector">
          <svg viewBox="0 0 40 20" preserveAspectRatio="none">
            <path
              d="M 0 10 Q 10 5 20 10 T 40 10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,3"
            />
          </svg>
        </div>
        <div className="workflow-step">
          <div className="workflow-icon"><IconEdit /></div>
          <p className="workflow-label">Edit in Workspace</p>
          <span className="workflow-desc">Refine and customize</span>
        </div>
        <div className="workflow-connector">
          <svg viewBox="0 0 40 20" preserveAspectRatio="none">
            <path
              d="M 0 10 Q 10 5 20 10 T 40 10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,3"
            />
          </svg>
        </div>
        <div className="workflow-step">
          <div className="workflow-icon"><IconPublish /></div>
          <p className="workflow-label">Publish Everywhere</p>
          <span className="workflow-desc">To connected platforms</span>
        </div>
      </div>

      <div className="integrations-section">
        <div className="section-header">
          <h2>Integrations</h2>
          <span className="section-badge">{ALL_INTEGRATIONS.length}</span>
        </div>
        <div className="integrations-grid">
          {ALL_INTEGRATIONS.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              isConnected={connectedPlatforms.includes(integration.id)}
              isLoading={loadingStates[integration.id]}
              onConnect={() => handleConnect(integration.id, integration.name)}
              onDisconnect={() => handleDisconnect(integration.id, integration.name)}
              onShowGhostConnectForm={() => setShowGhostConnectForm(true)}
              showGhostConnectForm={showGhostConnectForm}
            >
              {integration.id === "ghost" ? (
                connectedPlatforms.includes("ghost") ? (
                  <GhostConnectionSummary connection={ghostConnection} />
                ) : showGhostConnectForm ? (
                  <GhostConnectionForm
                    form={ghostForm}
                    isLoading={loadingStates.ghost}
                    onChange={handleGhostFieldChange}
                    onSubmit={handleGhostConnect}
                  />
                ) : null
              ) : null}
            </IntegrationCard>
          ))}
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} />}
    </section>
  );
}

function IntegrationCard({
  integration,
  isConnected,
  isLoading,
  onConnect,
  onDisconnect,
  onShowGhostConnectForm,
  showGhostConnectForm,
  children,
}) {
  const statusMap = {
    available: "Available",
    "coming-soon": "Coming Soon",
    beta: "Beta",
    connected: "Connected",
  };

  const statusBadgeClass = {
    available: "status-available",
    "coming-soon": "status-coming",
    beta: "status-beta",
    connected: "status-connected",
  };

  return (
    <div
      className={`integration-card ${isConnected ? "connected" : ""} ${
        statusMap[integration.status] === "Coming Soon" ? "coming-soon" : ""
      }`}
    >
      <div className="integration-card-top">
        <div className="integration-icon-wrapper">
          <div className="integration-icon">{integration.icon}</div>
          {isConnected ? (
            <span aria-label="Connected" className="integration-connected-dot" />
          ) : null}
        </div>
        <div className="integration-info">
          <h3>{integration.name}</h3>
          <p>{integration.description}</p>
        </div>
        {integration.status !== "available" && (
          <span
            className={`integration-badge ${
              statusBadgeClass[integration.status]
            }`}
          >
            {statusMap[integration.status]}
          </span>
        )}
      </div>

      {children ? <div className="integration-inline-panel">{children}</div> : null}

      <div className="integration-actions">
        {isConnected ? (
          <button
            className="integration-btn danger-btn"
            onClick={onDisconnect}
            type="button"
          >
            Disconnect
          </button>
        ) : integration.status === "coming-soon" ? (
          <button
            className="integration-btn disabled-btn"
            type="button"
            disabled
          >
            Coming Soon
          </button>
        ) : integration.id === "ghost" ? (
          <button
            className="integration-btn primary-btn"
            onClick={onShowGhostConnectForm}
            type="button"
          >
            {showGhostConnectForm ? "Hide Ghost form" : "Connect with Ghost"}
          </button>
        ) : (
          <button
            className="integration-btn primary-btn"
            onClick={onConnect}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>
    </div>
  );
}

function GhostConnectionForm({ form, isLoading, onChange, onSubmit }) {
  return (
    <div className="ghost-connection-form">
      <p className="ghost-connection-help">
        Enter the Admin API details from <strong>your own Ghost site</strong>.
        We never post anything until you click publish in the workspace.
      </p>
      <label className="integration-field">
        <span>Admin API URL</span>
        <input
          type="url"
          value={form.adminApiUrl}
          onChange={(event) => onChange("adminApiUrl", event.target.value)}
          placeholder="https://your-site.com/ghost/api/admin/"
        />
      </label>
      <label className="integration-field">
        <span>Admin API key</span>
        <input
          type="password"
          value={form.adminApiKey}
          onChange={(event) => onChange("adminApiKey", event.target.value)}
          placeholder="<id>:<secret>"
        />
      </label>
      <label className="integration-field">
        <span>Default newsletter slug</span>
        <input
          type="text"
          value={form.defaultNewsletterSlug}
          onChange={(event) => onChange("defaultNewsletterSlug", event.target.value)}
          placeholder="optional-default-newsletter"
        />
      </label>
      <button
        className="integration-btn primary-btn"
        onClick={onSubmit}
        type="button"
        disabled={isLoading || !form.adminApiUrl.trim() || !form.adminApiKey.trim()}
      >
        {isLoading ? "Connecting..." : "Connect Ghost"}
      </button>
    </div>
  );
}

function GhostConnectionSummary({ connection }) {
  const newsletters = Array.isArray(connection?.newsletters) ? connection.newsletters : [];

  return (
    <div className="ghost-connection-summary">
      <p>
        <strong>{connection?.site_title || "Ghost site connected"}</strong>
      </p>
      <p>
        {newsletters.length
          ? `${newsletters.length} active newsletter${newsletters.length === 1 ? "" : "s"} available.`
          : "No active newsletters found yet."}
      </p>
      {connection?.default_newsletter_slug ? (
        <p>Default newsletter: <code>{connection.default_newsletter_slug}</code></p>
      ) : null}
      <p className="ghost-connection-help">
        Connected credentials stay on your account and are used only for Ghost publishing.
      </p>
    </div>
  );
}

function Toast({ message }) {
  return <div className="toast-notification">{message}</div>;
}
