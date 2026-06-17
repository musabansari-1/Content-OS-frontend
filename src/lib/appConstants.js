export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const APP_NAME = "Content Burst";
export const AUTH_STORAGE_KEY = "content-burst-auth";
export const LEGACY_AUTH_STORAGE_KEY = "contentos-auth";
export const WORKSPACE_STORAGE_PREFIX = "content-burst-workspace-v2";
export const LEGACY_WORKSPACE_STORAGE_PREFIX = "contentos-workspace-v2";
export const PLANNER_STORAGE_PREFIX = "content-burst-planner-v1";
export const LEGACY_PLANNER_STORAGE_PREFIX = "contentos-planner-v1";
export const DEFAULT_ROUTE = "home";

export const ASSET_STATUS_DRAFT = "draft";
export const ASSET_STATUS_READY = "ready";
export const ASSET_STATUS_PUBLISHED = "published";

export const STATUS_CYCLE = [
  ASSET_STATUS_DRAFT,
  ASSET_STATUS_READY,
  ASSET_STATUS_PUBLISHED,
];

export const STATUS_META = {
  [ASSET_STATUS_DRAFT]: {
    label: "Draft",
    icon: "Draft",
    next: ASSET_STATUS_READY,
    nextLabel: "Mark as Ready",
    color: "var(--status-draft-text)",
    bg: "var(--status-draft-bg)",
    border: "var(--status-draft-border)",
    dot: "var(--status-draft-dot)",
  },
  [ASSET_STATUS_READY]: {
    label: "Ready",
    icon: "Ready",
    next: ASSET_STATUS_PUBLISHED,
    nextLabel: "Mark as Published",
    color: "var(--status-ready-text)",
    bg: "var(--status-ready-bg)",
    border: "var(--status-ready-border)",
    dot: "var(--status-ready-dot)",
  },
  [ASSET_STATUS_PUBLISHED]: {
    label: "Published",
    icon: "Published",
    next: ASSET_STATUS_DRAFT,
    nextLabel: "Move back to Draft",
    color: "var(--status-published-text)",
    bg: "var(--status-published-bg)",
    border: "var(--status-published-border)",
    dot: "var(--status-published-dot)",
  },
};

export const TEMP_UNAVAILABLE_ASSET_TYPES = [
  // "tiktok_clip",
  // "instagram_reel",
];
