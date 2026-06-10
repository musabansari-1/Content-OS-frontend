import {
  API_BASE_URL,
  ASSET_STATUS_DRAFT,
  ASSET_STATUS_PUBLISHED,
  ASSET_STATUS_READY,
  AUTH_STORAGE_KEY,
  DEFAULT_ROUTE,
  TEMP_UNAVAILABLE_ASSET_TYPES,
  WORKSPACE_STORAGE_PREFIX,
} from "./appConstants";

export async function apiFetch(path, options = {}, token = "") {
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

export function getRouteFromPathname(pathname = "") {
  const cleaned = pathname.replace(/^\/+/, "");
  if (cleaned === "workspace") return "workspace";
  if (cleaned === "integrations") return "integrations";
  return DEFAULT_ROUTE;
}

export function buildVideoPayload(value) {
  const trimmed = value.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("http")) return { video_url: trimmed };
  return { video_id: trimmed };
}

export function parseSampleBlocks(value) {
  return value.split(/\n\s*\n/g).map((item) => item.trim()).filter(Boolean);
}

export function parseLineItems(value) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function persistAuth(nextToken, nextUser) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ token: nextToken, user: nextUser }),
  );
}

export function clearAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.reload();
}

export function safeParse(output) {
  try {
    return typeof output === "string" ? JSON.parse(output) : output;
  } catch {
    return { raw: output };
  }
}

export function formatLabel(label) {
  return label.replaceAll("_", " ");
}

export function formatAssetLabel(assetType) {
  return assetType.replaceAll("_", " ");
}

export function getPlatformHook(platform) {
  const hooks = {
    twitter: "Thread draft",
    tiktok: "Short-form script",
    youtube: "Video angle",
    linkedin: "Professional post",
    instagram: "Instagram asset",
    blog: "Blog draft",
    reddit: "Reddit post",
    email: "Newsletter draft",
  };
  return hooks[platform] ?? "Generated asset";
}

export function buildGenerationSource({
  videoInput,
  generateTranscript,
  selectedAssets,
}) {
  if (videoInput.trim()) {
    return `Generated from ${truncateText(videoInput.trim(), 68)} for ${selectedAssets.length} selected asset types.`;
  }
  return `Generated from pasted transcript for ${selectedAssets.length} selected asset types.`;
}

export function resolveMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
}

export function buildAssetMedia(result) {
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

export function buildWorkspaceAssets(results, sourceLabel) {
  return results.map((result, index) => {
    const media = buildAssetMedia(result);
    const data = media ? {} : safeParse(result.output);
    const now = new Date().toISOString();
    const title = result.asset_type
      ? formatAssetLabel(result.asset_type)
      : getPlatformHook(result.platform);

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

export function buildBlocksFromOutput(data) {
  return Object.entries(data).map(([key, value], index) => ({
    id: `${key}-${index}-${generateLocalId()}`,
    key,
    label: formatLabel(key),
    kind: Array.isArray(value) ? "list" : "text",
    value: Array.isArray(value)
      ? value.map(formatListItemValue)
      : formatTextBlockValue(value),
    originalValue: Array.isArray(value)
      ? value.map(formatListItemValue)
      : formatTextBlockValue(value),
    isDirty: false,
  }));
}

export function formatTextBlockValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(formatListItemValue).join("\n");
  const readable = extractReadableObjectText(value);
  if (readable) return readable;
  return safeStringify(value);
}

export function formatListItemValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && !Array.isArray(value)) return value;
  const text = formatTextBlockValue(value);
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}

export function extractReadableObjectText(value) {
  if (!value || typeof value !== "object") return "";
  const titleText = typeof value.title === "string" ? value.title.trim() : "";
  const bodyKey = ["body", "content", "text", "summary", "caption"].find(
    (key) => typeof value[key] === "string" && value[key].trim(),
  );
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
    const combined = value[key]
      .map(formatTextBlockValue)
      .map((item) => item.trim())
      .filter(Boolean)
      .join("\n\n");
    if (combined) return combined;
  }

  return "";
}

export function safeStringify(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? "");
  }
}

export function buildAssetId(result, index) {
  return `${result.platform || "platform"}-${result.asset_type || "asset"}-${index}-${generateLocalId()}`;
}

export function generateLocalId() {
  return Math.random().toString(36).slice(2, 9);
}

export function getWorkspaceStorageKey(user) {
  const identifier = user?.id || user?.email || "anonymous";
  return `${WORKSPACE_STORAGE_PREFIX}:${identifier}`;
}

export function readWorkspace(user) {
  try {
    return JSON.parse(localStorage.getItem(getWorkspaceStorageKey(user)) ?? "{}");
  } catch {
    return {};
  }
}

export function writeWorkspace(user, payload) {
  localStorage.setItem(getWorkspaceStorageKey(user), JSON.stringify(payload));
}

export function serializeWorkspace(assets) {
  return assets.map(serializeAsset).join("\n\n");
}

export function serializeAsset(asset) {
  const lines = [
    `${asset.title} (${asset.platformLabel})`,
    `Status: ${formatAssetStatus(asset.status)}`,
    `${asset.sourceLabel}`,
    "",
  ];

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

export function normalizeBlockValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (isStructuredObject(item) ? serializeStructuredItem(item) : String(item ?? "").trim()))
      .join("\n");
  }
  return String(value ?? "").trim();
}

export function splitEditableList(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function estimateRows(value) {
  return String(value ?? "").split("\n").length + 1;
}

export function getWorkspaceSaveLabel(status) {
  if (status === "saving") return "Autosaving";
  if (status === "saved") return "Saved";
  if (status === "error") return "Save issue";
  return "Ready";
}

export function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatAssetStatus(status) {
  const labels = {
    [ASSET_STATUS_DRAFT]: "Draft",
    [ASSET_STATUS_READY]: "Ready",
    [ASSET_STATUS_PUBLISHED]: "Published",
  };
  return labels[status] || status;
}

export function truncateText(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

export function formatWorkspaceDate(value) {
  if (!value) return "Saved recently";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function buildAssetProgress(jobAssets, selectedAssets, targetAssets) {
  if (Array.isArray(jobAssets) && jobAssets.length) return jobAssets;
  const labelByAsset = Object.fromEntries(targetAssets.map((asset) => [asset.asset_type, asset.label]));
  return selectedAssets.map((assetType) => ({
    asset_type: assetType,
    label: labelByAsset[assetType] || formatAssetLabel(assetType),
    status: "pending",
    attempt: 0,
  }));
}

export function getStageLabel(stage) {
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
    execution_video: "Rendering clips",
    finalizing: "Wrapping up",
    finalize: "Wrapping up",
    completed: "Completed",
    failed: "Stopped",
  };
  return labels[stage] || "Generating";
}

export function getAssetStatusCopy(asset) {
  if (asset.status === "completed") return "Finished and ready in your pack.";
  if (asset.status === "active") return "Currently being prepared for you.";
  return "Waiting to be completed next.";
}

export function formatElapsed(isoValue) {
  if (!isoValue) return "Just started";
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoValue).getTime()) / 1000),
  );
  if (seconds < 5) return "Just started";
  if (seconds < 60) return `${seconds}s elapsed`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s elapsed`;
}

export function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function getRealLoaderProgress(job, steps, assetProgress) {
  if (!job) return 4;
  if (job.status === "completed") return 100;

  const stepWeight = {
    source: 8,
    moments: 10,
    strategy: 12,
    execution: 60,
    finalize: 10,
  };
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
    const completedAssets = assetProgress.filter((asset) => asset.status === "completed").length;
    const activeAssets = assetProgress.filter((asset) => asset.status === "active").length;
    progress += completedAssets * perAssetWeight;
    if (activeAssets > 0) {
      progress += getActiveAssetPartial(job, perAssetWeight) * activeAssets;
    }
  } else {
    const executionStep = steps.find((step) => step.key === "execution");
    if (executionStep?.status === "completed") progress += stepWeight.execution;
    else if (executionStep?.status === "active") progress += stepWeight.execution * 0.4;
  }

  if (job.stage === "finalize" || job.stage === "finalizing") {
    progress = Math.max(progress, 92);
  }

  return clampProgress(progress);
}

export function getActiveAssetPartial(job, perAssetWeight) {
  const lastUpdate = job?.updated_at ? new Date(job.updated_at).getTime() : Date.now();
  const secondsSinceUpdate = Math.max(0, (Date.now() - lastUpdate) / 1000);
  const eased = Math.min(0.92, 0.18 + secondsSinceUpdate / 28);
  return perAssetWeight * eased;
}

export function isStructuredObject(item) {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

export function serializeStructuredItem(item) {
  const titleText = typeof item.title === "string" ? item.title.trim() : "";
  const bodyKey = ["body", "content", "text", "summary", "caption"].find(
    (key) => typeof item[key] === "string" && item[key].trim(),
  );
  const bodyText = bodyKey ? item[bodyKey].trim() : "";
  const parts = [];
  if (titleText) parts.push(titleText);
  if (bodyText) parts.push(bodyText);
  return parts.join("\n");
}

export function serializeListToText(list) {
  return list
    .map((item) => (isStructuredObject(item) ? serializeStructuredItem(item) : String(item ?? "")))
    .join("\n\n");
}

export function orderTargetAssets(catalog = []) {
  const enabled = catalog.filter(
    (asset) => !TEMP_UNAVAILABLE_ASSET_TYPES.includes(asset.asset_type),
  );
  const disabled = catalog.filter((asset) =>
    TEMP_UNAVAILABLE_ASSET_TYPES.includes(asset.asset_type),
  );
  return {
    enabled,
    ordered: [...enabled, ...disabled],
  };
}

export function isTemporarilyUnavailableAsset(assetType) {
  return TEMP_UNAVAILABLE_ASSET_TYPES.includes(assetType);
}
