import {
  API_BASE_URL,
  ASSET_STATUS_DRAFT,
  ASSET_STATUS_PUBLISHED,
  ASSET_STATUS_READY,
  AUTH_STORAGE_KEY,
  DEFAULT_ROUTE,
  LEGACY_AUTH_STORAGE_KEY,
  LEGACY_PLANNER_STORAGE_PREFIX,
  LEGACY_WORKSPACE_STORAGE_PREFIX,
  PLANNER_STORAGE_PREFIX,
  REMOVED_ASSET_TYPES,
  TEMP_UNAVAILABLE_ASSET_TYPES,
  WORKSPACE_STORAGE_PREFIX,
} from "./appConstants";

export async function apiFetch(path, options = {}, token = "") {
  const headers = { ...(options.headers ?? {}) };
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });
  if (response.status === 204) return {};
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
  if (cleaned === "calendar") return "calendar";
  if (cleaned === "integrations") return "integrations";
  if (cleaned === "billing") return "billing";
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
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

export function readStoredAuth() {
  try {
    return JSON.parse(
      localStorage.getItem(AUTH_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) ??
        "{}",
    );
  } catch {
    return {};
  }
}

export function clearAuthState({ reload = false } = {}) {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
  if (reload && typeof window !== "undefined") {
    window.location.reload();
  }
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
    youtube: "YouTube draft",
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

export function buildWorkspaceAssets(results, sourceLabel, metadata = {}) {
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
      platformLabel: formatPlatformName(result.platform || "generated"),
      assetType: result.asset_type || "generic",
      sourceLabel,
      generationGroupId: metadata.generationGroupId || "",
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

export function buildGenerationGroup({
  id,
  sourceLabel,
  selectedAssets = [],
  assetIds = [],
  createdAt = new Date().toISOString(),
}) {
  return {
    id,
    title: getGenerationGroupTitle(sourceLabel),
    sourceLabel,
    assetTypes: selectedAssets,
    assetIds,
    createdAt,
    updatedAt: createdAt,
  };
}

export function normalizeGenerationGroups(assets = [], groups = []) {
  const assetIds = new Set(assets.map((asset) => asset.id));
  const normalizedGroups = groups
    .map((group) => ({
      ...group,
      assetIds: Array.isArray(group.assetIds)
        ? group.assetIds.filter((assetId) => assetIds.has(assetId))
        : [],
    }))
    .filter((group) => group.id && group.assetIds.length);

  const knownGroupIds = new Set(normalizedGroups.map((group) => group.id));
  const missingGroupsById = new Map();

  for (const asset of assets) {
    if (!asset.generationGroupId || knownGroupIds.has(asset.generationGroupId)) {
      continue;
    }
    const existing = missingGroupsById.get(asset.generationGroupId);
    if (existing) {
      existing.assetIds.push(asset.id);
      continue;
    }
    missingGroupsById.set(
      asset.generationGroupId,
      buildGenerationGroup({
        id: asset.generationGroupId,
        sourceLabel: asset.sourceLabel || "Previous generation",
        selectedAssets: [asset.assetType].filter(Boolean),
        assetIds: [asset.id],
        createdAt: asset.createdAt || new Date().toISOString(),
      }),
    );
  }

  const groupedAssetIds = new Set([
    ...normalizedGroups.flatMap((group) => group.assetIds),
    ...Array.from(missingGroupsById.values()).flatMap((group) => group.assetIds),
  ]);
  const ungroupedAssets = assets.filter((asset) => !groupedAssetIds.has(asset.id));

  if (!ungroupedAssets.length) {
    return {
      assets,
      groups: [...Array.from(missingGroupsById.values()), ...normalizedGroups],
    };
  }

  const legacyGroupId = `generation-legacy-${generateLocalId()}`;
  const legacyGroup = buildGenerationGroup({
    id: legacyGroupId,
    sourceLabel: "Previous workspace assets",
    selectedAssets: Array.from(new Set(ungroupedAssets.map((asset) => asset.assetType).filter(Boolean))),
    assetIds: ungroupedAssets.map((asset) => asset.id),
    createdAt: ungroupedAssets[0]?.createdAt || new Date().toISOString(),
  });

  return {
    assets: assets.map((asset) =>
      groupedAssetIds.has(asset.id)
        ? asset
        : { ...asset, generationGroupId: legacyGroupId },
    ),
    groups: [legacyGroup, ...Array.from(missingGroupsById.values()), ...normalizedGroups],
  };
}

export function getGenerationGroupTitle(sourceLabel = "") {
  const cleaned = String(sourceLabel)
    .replace(/^Generated from\s+/i, "")
    .replace(/\s+for\s+\d+\s+selected asset types\.?$/i, "")
    .trim();
  if (!cleaned) return "Generation batch";
  return truncateText(cleaned, 72);
}

export function getAssetDisplayName(asset = {}) {
  const title = normalizeAssetTitle(asset.title || formatAssetLabel(asset.assetType || "Asset"));
  const contentClue = getAssetContentClue(asset);
  if (!contentClue) return title;
  if (title.toLowerCase() === contentClue.toLowerCase()) return title;
  return `${title} - ${contentClue}`;
}

export function getAssetPickerDescription(asset = {}, sourceLabel = "") {
  const parts = [
    asset.platformLabel,
    asset.status,
    sourceLabel ? `from ${sourceLabel}` : "",
  ].filter(Boolean);
  return parts.join(" - ");
}

function normalizeAssetTitle(value) {
  const cleaned = formatAssetLabel(String(value || "Asset")).trim();
  if (!cleaned) return "Asset";
  const title = cleaned
    .split(/\s+/)
    .map((word) => (word.length <= 3 ? word : `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`))
    .join(" ");
  return title
    .replace(/\bLinkedin\b/g, "LinkedIn")
    .replace(/\bYoutube\b/g, "YouTube")
    .replace(/\bTiktok\b/g, "TikTok")
    .replace(/\bSeo\b/g, "SEO")
    .replace(/\bCta\b/g, "CTA");
}

function getAssetContentClue(asset = {}) {
  if (asset.media?.label) return truncateText(cleanSnippet(asset.media.label), 64);

  const preferredBlock =
    asset.blocks?.find((block) =>
      /hook|headline|title|caption|post|script|thread|summary/i.test(
        `${block.key || ""} ${block.label || ""}`,
      ),
    ) || asset.blocks?.[0];

  const snippet = cleanSnippet(extractBlockSnippet(preferredBlock));
  return snippet ? truncateText(snippet, 64) : "";
}

function extractBlockSnippet(block) {
  if (!block) return "";
  const value = block.value;
  if (Array.isArray(value)) {
    const first = value.find((item) => {
      if (isStructuredObject(item)) return serializeStructuredItem(item).trim();
      return String(item ?? "").trim();
    });
    return isStructuredObject(first) ? serializeStructuredItem(first) : String(first ?? "");
  }
  return formatTextBlockValue(value);
}

function cleanSnippet(value) {
  return String(value || "")
    .replace(/[#*_`>{}\[\]"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
    const identifier = user?.id || user?.email || "anonymous";
    const currentKey = `${WORKSPACE_STORAGE_PREFIX}:${identifier}`;
    const legacyKey = `${LEGACY_WORKSPACE_STORAGE_PREFIX}:${identifier}`;
    return JSON.parse(
      localStorage.getItem(currentKey) ?? localStorage.getItem(legacyKey) ?? "{}",
    );
  } catch {
    return {};
  }
}

export function writeWorkspace(user, payload) {
  localStorage.setItem(getWorkspaceStorageKey(user), JSON.stringify(payload));
}

export function getPlannerStorageKey(user) {
  const identifier = user?.id || user?.email || "anonymous";
  return `${PLANNER_STORAGE_PREFIX}:${identifier}`;
}

export function readPlanner(user) {
  try {
    const identifier = user?.id || user?.email || "anonymous";
    const currentKey = `${PLANNER_STORAGE_PREFIX}:${identifier}`;
    const legacyKey = `${LEGACY_PLANNER_STORAGE_PREFIX}:${identifier}`;
    return JSON.parse(
      localStorage.getItem(currentKey) ?? localStorage.getItem(legacyKey) ?? "{}",
    );
  } catch {
    return {};
  }
}

export function writePlanner(user, payload) {
  localStorage.setItem(getPlannerStorageKey(user), JSON.stringify(payload));
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

export function isLinkedInAsset(asset) {
  return String(asset?.assetType || "").toLowerCase().includes("linkedin");
}

export function isInstagramAsset(asset) {
  return String(asset?.assetType || "").toLowerCase().includes("instagram");
}

export function isTikTokAsset(asset) {
  return String(asset?.assetType || "").toLowerCase().includes("tiktok");
}

export function isGhostAsset(asset) {
  const assetType = String(asset?.assetType || "").toLowerCase();
  return assetType === "blog_post" || assetType === "newsletter";
}

export function formatPlatformName(platform = "") {
  const normalized = String(platform || "").trim().toLowerCase();
  const labels = {
    linkedin: "LinkedIn",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    ghost: "Ghost",
  };
  return labels[normalized] || capitalize(normalized || "platform");
}

export function getSchedulingPlatform(asset) {
  if (isLinkedInAsset(asset)) return "linkedin";
  if (isInstagramAsset(asset)) return "instagram";
  if (isTikTokAsset(asset)) return "tiktok";
  if (isGhostAsset(asset)) return "ghost";
  return "";
}

export function isSchedulableAsset(asset) {
  return Boolean(getSchedulingPlatform(asset));
}

export function buildScheduledPostPayload(asset) {
  const platform = getSchedulingPlatform(asset);
  const metadata = {
    asset_id: String(asset?.id || "").trim(),
    title: String(asset?.title || "").trim(),
  };

  if (platform === "linkedin") {
    const text = buildLinkedInPostText(asset);
    if (!text.trim()) {
      throw new Error("The selected asset does not have any content to schedule.");
    }
    return { platform, payload: { text, metadata } };
  }

  if (platform === "instagram" || platform === "tiktok" || platform === "ghost") {
    return { platform, payload: { asset, metadata } };
  }

  throw new Error("This asset cannot be scheduled yet.");
}

export function getScheduledPostAssetId(post) {
  if (!post || typeof post !== "object") return "";
  const metadataId = String(post?.payload?.metadata?.asset_id || "").trim();
  if (metadataId) return metadataId;
  return String(post?.payload?.asset?.id || "").trim();
}

export function findScheduledPostForAsset(asset, scheduledPosts = []) {
  const assetId = String(asset?.id || "").trim();
  if (!assetId) return null;
  return (
    scheduledPosts.find((post) => getScheduledPostAssetId(post) === assetId) || null
  );
}

export function formatScheduledPostTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function buildLinkedInPostText(asset) {
  if (!asset) return "";

  const bodyBlocks = Array.isArray(asset.blocks) ? asset.blocks : [];
  const isLinkedInAsset =
    String(asset.assetType || "").toLowerCase().includes("linkedin") ||
    String(asset.platformLabel || "").toLowerCase() === "linkedin";

  const chunks = bodyBlocks
    .map((block) => {
      const blockValue = normalizeBlockValue(block.value);
      if (!blockValue) return "";
      if (isLinkedInAsset && block.label && block.label.toLowerCase() === "post") {
        return blockValue;
      }
      return block.label ? `${block.label}: ${blockValue}` : blockValue;
    })
    .filter(Boolean);

  const text = chunks.join("\n\n").trim();
  if (text.length <= 2800) return text;
  return `${text.slice(0, 2797).trim()}...`;
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
  const enabled = catalog.filter((asset) => {
    const assetType = String(asset?.asset_type || "").trim();
    return (
      assetType &&
      !TEMP_UNAVAILABLE_ASSET_TYPES.includes(assetType) &&
      !REMOVED_ASSET_TYPES.includes(assetType)
    );
  });
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

export async function openHostedCheckout(checkoutConfig) {
  if (typeof window === "undefined") {
    throw new Error("Checkout is only available in the browser.");
  }

  const checkoutUrl = String(checkoutConfig?.checkout_url || "").trim();
  if (!checkoutUrl) {
    throw new Error("Checkout URL is missing.");
  }

  window.location.assign(checkoutUrl);
}
