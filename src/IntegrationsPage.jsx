import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const AVAILABLE_INTEGRATIONS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    platform: "publishing",
    category: "Publishing",
    status: "available",
    description: "Publish professional posts and articles",
    icon: "LI",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    platform: "publishing",
    category: "Publishing",
    status: "available",
    description: "Share threads and engage your audience",
    icon: "𝕏",
  },
  {
    id: "youtube",
    name: "YouTube",
    platform: "content",
    category: "Content",
    status: "available",
    description: "Manage video uploads and publishing",
    icon: "▶",
  },
  {
    id: "instagram",
    name: "Instagram",
    platform: "publishing",
    category: "Publishing",
    status: "beta",
    description: "Publish reels and carousel posts",
    icon: "📷",
  },
  {
    id: "tiktok",
    name: "TikTok",
    platform: "publishing",
    category: "Publishing",
    status: "coming-soon",
    description: "Publish short-form video content",
    icon: "🎵",
  },
  {
    id: "medium",
    name: "Medium",
    platform: "publishing",
    category: "Publishing",
    status: "available",
    description: "Publish blog posts and articles",
    icon: "◆",
  },
  {
    id: "substack",
    name: "Substack",
    platform: "publishing",
    category: "Publishing",
    status: "coming-soon",
    description: "Send newsletters to subscribers",
    icon: "S",
  },
  {
    id: "notion",
    name: "Notion",
    platform: "storage",
    category: "Storage",
    status: "coming-soon",
    description: "Save and organize content",
    icon: "⚪",
  },
  {
    id: "ghost",
    name: "Ghost",
    platform: "storage",
    category: "Storage",
    status: "available",
    description: "Self-hosted publishing platform",
    icon: "👻",
  },
];

const ALL_INTEGRATIONS = [...AVAILABLE_INTEGRATIONS];

export default function IntegrationsPage() {
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [callbackNotice, setCallbackNotice] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedinStatus = params.get("linkedin");

    if (!linkedinStatus) {
      return;
    }

    if (linkedinStatus === "connected") {
      setConnectedPlatforms((prev) => (prev.includes("linkedin") ? prev : [...prev, "linkedin"]));
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

    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, "", cleanUrl);
  }, []);

  const handleConnect = (integrationId, integrationName) => {
    if (integrationId === "linkedin") {
      window.location.href = `${API_BASE_URL}/auth/linkedin`;
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [integrationId]: true }));

    setTimeout(() => {
      setConnectedPlatforms((prev) => (prev.includes(integrationId) ? prev : [...prev, integrationId]));
      setLoadingStates((prev) => ({ ...prev, [integrationId]: false }));
      setToastMessage(`Connected to ${integrationName}.`);
      setTimeout(() => setToastMessage(""), 3000);
    }, 1500);
  };

  const handleDisconnect = (integrationId, integrationName) => {
    setConnectedPlatforms((prev) => prev.filter((id) => id !== integrationId));
    setToastMessage(`Disconnected from ${integrationName}.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <section className="integrations-page">
      {/* Header */}
      <div className="integrations-header">
        <div>
          <p className="eyebrow">Integrations</p>
          <h1>Connect your platforms</h1>
          <p className="integrations-subtitle">
            Connect your platforms to publish, schedule, and manage content
            directly from the workspace.
          </p>
        </div>
      </div>

      {callbackNotice ? (
        <div className={`integration-callback-banner ${callbackNotice.type}`}>
          <div className="integration-callback-icon" aria-hidden="true">
            {callbackNotice.type === "success" ? "✓" : "!"}
          </div>
          <div>
            <strong>{callbackNotice.title}</strong>
            <p>{callbackNotice.message}</p>
          </div>
        </div>
      ) : null}

      {/* Workflow Preview */}
      <div className="workflow-preview">
        <div className="workflow-step">
          <div className="workflow-icon">🎥</div>
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
          <div className="workflow-icon">✏️</div>
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
          <div className="workflow-icon">🚀</div>
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
            />
          ))}
        </div>
      </div>

      {/* Toast Notification */}
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

      {isConnected && integration.accountName && (
        <div className="integration-account-info">
          <div className="account-avatar">{integration.accountAvatar}</div>
          <div className="account-details">
            <p className="account-name">{integration.accountName}</p>
            <p className="account-sync">Synced {integration.lastSynced}</p>
          </div>
        </div>
      )}

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

function Toast({ message }) {
  return <div className="toast-notification">{message}</div>;
}
