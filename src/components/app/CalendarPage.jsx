"use client";

import { useEffect, useMemo, useState } from "react";
import { ASSET_STATUS_READY } from "../../lib/appConstants";
import {
  getAssetDisplayName,
  getAssetPickerDescription,
  formatPlatformName,
  formatScheduledPostTime,
  formatWorkspaceDate,
  getSchedulingPlatform,
  getScheduledPostAssetId,
  isSchedulableAsset,
} from "../../lib/appUtils";

const CADENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "every_2_days", label: "Every 2 days" },
  { value: "weekdays", label: "Weekdays" },
];
const CALENDAR_WINDOW_DAYS = 35;
const UPCOMING_LIMIT = 8;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getDayKey(date) {
  return toDateInputValue(date);
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function normalizePreferredTime(value) {
  return /^\d{2}:\d{2}$/.test(String(value || "").trim()) ? value : "10:00";
}

function combineDateAndTime(dateValue, timeValue) {
  if (!dateValue) return null;
  const normalizedTime = normalizePreferredTime(timeValue);
  const date = new Date(`${dateValue}T${normalizedTime}:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function shiftToWeekday(date) {
  const next = new Date(date);
  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function advanceCadenceDate(current, cadence) {
  const next = new Date(current);
  if (cadence === "every_2_days") {
    next.setDate(next.getDate() + 2);
  } else {
    next.setDate(next.getDate() + 1);
  }
  return cadence === "weekdays" ? shiftToWeekday(next) : next;
}

function buildRolloutEntries(assets, settings) {
  const startingDate = combineDateAndTime(settings.startDate, settings.preferredTime);
  if (!startingDate) return [];

  let cursor = settings.cadence === "weekdays" ? shiftToWeekday(startingDate) : startingDate;
  return assets.map((asset) => {
    const scheduledFor = new Date(cursor);
    const entry = {
      asset,
      scheduledFor: scheduledFor.toISOString(),
      dayKey: getDayKey(scheduledFor),
    };
    cursor = advanceCadenceDate(cursor, settings.cadence);
    return entry;
  });
}

function formatRolloutCadence(value) {
  return CADENCE_OPTIONS.find((option) => option.value === value)?.label || "Daily";
}

function formatCalendarMonth(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
  }).format(date);
}

function getScheduledPostTitle(post) {
  return (
    post.payload?.metadata?.title ||
    post.payload?.asset?.title ||
    `${formatPlatformName(post.platform)} post`
  );
}

function getScheduledPostPlatform(post) {
  return formatPlatformName(post.platform);
}

function RolloutPlanCard({ plan, group, pendingCount, scheduledCount, onDelete }) {
  return (
    <article className="campaign-card">
      <div className="campaign-card-top">
        <div>
          <div className="campaign-card-meta">
            <span className="campaign-platform campaign-platform-multi">
              {formatRolloutCadence(plan.cadence)}
            </span>
            <span className="summary-tag">{plan.assetIds.length} assets</span>
          </div>
          <h3>{plan.name}</h3>
          <p className="muted-copy">{group?.title || "Linked to an earlier generation batch."}</p>
        </div>
        <button
          className="ghost-button small danger-button"
          onClick={() => onDelete(plan.id)}
          type="button"
        >
          Delete
        </button>
      </div>

      <div className="campaign-stats">
        <div>
          <strong>{pendingCount}</strong>
          <span>still in rollout</span>
        </div>
        <div>
          <strong>{scheduledCount}</strong>
          <span>already scheduled</span>
        </div>
        <div>
          <strong>{plan.preferredTime}</strong>
          <span>preferred time</span>
        </div>
      </div>

      <div className="campaign-window-row">
        <span>Starts {plan.startDate || "not set"}</span>
        <span>Saved {formatWorkspaceDate(plan.updatedAt)}</span>
      </div>
    </article>
  );
}

function AssetChecklistSection({
  assets,
  emptyCopy,
  label,
  selectedAssetIds,
  sourceLabel,
  connectedPlatformIds,
  integrationStatus,
  onToggleAsset,
}) {
  return (
    <div className="planner-asset-section">
      <div className="planner-asset-section-title">
        <span>{label}</span>
        <strong>{assets.length}</strong>
      </div>

      {assets.length ? (
        assets.map((asset) => (
          <label key={asset.id} className="planner-check-item">
            <input
              type="checkbox"
              checked={selectedAssetIds.includes(asset.id)}
              onChange={() => onToggleAsset(asset.id)}
            />
            <div>
              <strong>{getAssetDisplayName(asset)}</strong>
              <span>
                {getAssetPickerDescription(asset, sourceLabel)}
                {integrationStatus === "success" &&
                !connectedPlatformIds.includes(getSchedulingPlatform(asset))
                  ? ` - connect ${formatPlatformName(getSchedulingPlatform(asset))}`
                  : ""}
              </span>
            </div>
          </label>
        ))
      ) : (
        <p className="planner-empty-copy">{emptyCopy}</p>
      )}
    </div>
  );
}

export default function CalendarPage({
  rolloutPlans,
  generationGroups,
  plannerSaveStatus,
  rolloutScheduleStatus,
  rolloutScheduleError,
  rolloutScheduleResult,
  scheduledPosts,
  scheduledPostsStatus,
  scheduledPostsError,
  connectedPlatformIds = [],
  integrationStatus = "idle",
  assets,
  onCreateRolloutPlan,
  onDeleteRolloutPlan,
  onScheduleRolloutPlan,
  onGoToIntegrations,
  onGoToWorkspace,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const calendarStart = useMemo(() => startOfWeek(today), [today]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [activeRolloutId, setActiveRolloutId] = useState("");
  const [builderError, setBuilderError] = useState("");
  const [builderNotice, setBuilderNotice] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [form, setForm] = useState({
    name: "",
    startDate: toDateInputValue(today),
    preferredTime: "10:00",
    cadence: "daily",
  });

  const dayRange = useMemo(
    () =>
      Array.from({ length: CALENDAR_WINDOW_DAYS }, (_, index) => {
        const date = addDays(calendarStart, index);
        return {
          key: getDayKey(date),
          date,
          dayNumber: String(date.getDate()),
          monthLabel: formatCalendarMonth(date),
          weekdayLabel: WEEKDAY_LABELS[date.getDay()],
          isPast: date < today,
          isToday: date.getTime() === today.getTime(),
        };
      }),
    [calendarStart, today],
  );

  const assetById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  );

  const groupById = useMemo(
    () => new Map(generationGroups.map((group) => [group.id, group])),
    [generationGroups],
  );

  const scheduledAssetIds = useMemo(
    () =>
      new Set(
        scheduledPosts
          .map((post) => getScheduledPostAssetId(post))
          .filter(Boolean),
      ),
    [scheduledPosts],
  );

  useEffect(() => {
    if (!generationGroups.length) {
      setSelectedGroupId("");
      return;
    }
    const stillExists = generationGroups.some((group) => group.id === selectedGroupId);
    if (!stillExists) {
      setSelectedGroupId(generationGroups[0].id);
    }
  }, [generationGroups, selectedGroupId]);

  const selectedGroup =
    generationGroups.find((group) => group.id === selectedGroupId) || null;

  const selectedGroupAssets = useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.assetIds.map((assetId) => assetById.get(assetId)).filter(Boolean);
  }, [assetById, selectedGroup]);

  const batchRolloutAssets = useMemo(
    () =>
      selectedGroupAssets.filter(
        (asset) => isSchedulableAsset(asset) && !scheduledAssetIds.has(asset.id),
      ),
    [scheduledAssetIds, selectedGroupAssets],
  );

  const extraRolloutAssets = useMemo(() => {
    if (!selectedGroup) return [];
    const selectedGroupAssetIds = new Set(selectedGroup.assetIds);
    return assets.filter(
      (asset) =>
        !selectedGroupAssetIds.has(asset.id) &&
        isSchedulableAsset(asset) &&
        !scheduledAssetIds.has(asset.id),
    );
  }, [assets, scheduledAssetIds, selectedGroup]);

  const availableRolloutAssets = useMemo(
    () => [...batchRolloutAssets, ...extraRolloutAssets],
    [batchRolloutAssets, extraRolloutAssets],
  );

  const batchRolloutAssetIds = useMemo(
    () => new Set(batchRolloutAssets.map((asset) => asset.id)),
    [batchRolloutAssets],
  );

  useEffect(() => {
    if (!selectedGroup) {
      setSelectedAssetIds([]);
      return;
    }
    setActiveRolloutId("");
    setBuilderError("");
    setBuilderNotice("");
    setForm((current) => ({
      ...current,
      name: `${selectedGroup.title} rollout`,
    }));
  }, [selectedGroup]);

  useEffect(() => {
    const allowedAssetIds = new Set(availableRolloutAssets.map((asset) => asset.id));
    setSelectedAssetIds((current) => {
      const kept = current.filter((assetId) => allowedAssetIds.has(assetId));
      if (kept.length) return kept;
      return batchRolloutAssets.map((asset) => asset.id);
    });
  }, [availableRolloutAssets, batchRolloutAssets]);

  const selectedRolloutAssets = useMemo(
    () =>
      availableRolloutAssets.filter((asset) => selectedAssetIds.includes(asset.id)),
    [availableRolloutAssets, selectedAssetIds],
  );

  const disconnectedPreviewPlatforms = useMemo(() => {
    if (integrationStatus !== "success") return [];
    const connectedSet = new Set(connectedPlatformIds);
    return Array.from(
      new Set(
        selectedRolloutAssets
          .map((asset) => getSchedulingPlatform(asset))
          .filter((platform) => platform && !connectedSet.has(platform)),
      ),
    );
  }, [connectedPlatformIds, integrationStatus, selectedRolloutAssets]);

  const currentPreview = useMemo(
    () => buildRolloutEntries(selectedRolloutAssets, form),
    [form, selectedRolloutAssets],
  );

  const plannedRolloutEntries = useMemo(
    () =>
      rolloutPlans.flatMap((plan) => {
        const assetsForPlan = plan.assetIds
          .map((assetId) => assetById.get(assetId))
          .filter(
            (asset) =>
              asset &&
              isSchedulableAsset(asset) &&
              !scheduledAssetIds.has(asset.id),
          );
        return buildRolloutEntries(assetsForPlan, plan).map((entry) => ({
          ...entry,
          rolloutId: plan.id,
          rolloutName: plan.name,
        }));
      }),
    [assetById, rolloutPlans, scheduledAssetIds],
  );

  const calendarEvents = useMemo(() => {
    const scheduledEvents = scheduledPosts
      .map((post) => {
        const date = new Date(post.scheduled_for);
        if (Number.isNaN(date.getTime())) return null;
        return {
          id: `scheduled-${post.id}`,
          kind: "scheduled",
          dayKey: getDayKey(date),
          date,
          title: getScheduledPostTitle(post),
          platform: getScheduledPostPlatform(post),
          meta: "Scheduled",
          timeLabel: formatScheduledPostTime(post.scheduled_for),
        };
      })
      .filter(Boolean);

    const rolloutEvents = plannedRolloutEntries.map((entry) => {
      const date = new Date(entry.scheduledFor);
      return {
        id: `planned-${entry.rolloutId}-${entry.asset.id}`,
        kind: "planned",
        dayKey: entry.dayKey,
        date,
        title: getAssetDisplayName(entry.asset),
        platform: entry.asset.platformLabel || formatPlatformName(getSchedulingPlatform(entry.asset)),
        meta: entry.rolloutName,
        timeLabel: formatScheduledPostTime(entry.scheduledFor),
      };
    });

    return [...scheduledEvents, ...rolloutEvents].sort(
      (left, right) => left.date.getTime() - right.date.getTime(),
    );
  }, [plannedRolloutEntries, scheduledPosts]);

  const eventsByDay = useMemo(
    () =>
      calendarEvents.reduce((accumulator, event) => {
        if (!accumulator[event.dayKey]) accumulator[event.dayKey] = [];
        accumulator[event.dayKey].push(event);
        return accumulator;
      }, {}),
    [calendarEvents],
  );

  const visibleEventIds = useMemo(() => new Set(dayRange.map((day) => day.key)), [dayRange]);

  const visibleCalendarEvents = useMemo(
    () => calendarEvents.filter((event) => visibleEventIds.has(event.dayKey)),
    [calendarEvents, visibleEventIds],
  );

  const upcomingCalendarEvents = useMemo(
    () => visibleCalendarEvents.filter((event) => event.date >= today).slice(0, UPCOMING_LIMIT),
    [today, visibleCalendarEvents],
  );

  const scheduledInWindow = useMemo(() => {
    const lastVisibleDay = dayRange[CALENDAR_WINDOW_DAYS - 1]?.date;
    if (!lastVisibleDay) return 0;
    return scheduledPosts.filter((post) => {
      const date = new Date(post.scheduled_for);
      return !Number.isNaN(date.getTime()) && date >= today && date <= lastVisibleDay;
    }).length;
  }, [dayRange, scheduledPosts, today]);

  const plannedInWindow = visibleCalendarEvents.filter((event) => event.kind === "planned").length;

  const unscheduledReadyAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.status === ASSET_STATUS_READY &&
          isSchedulableAsset(asset) &&
          !scheduledAssetIds.has(asset.id),
      ),
    [assets, scheduledAssetIds],
  );

  const savedRolloutCards = useMemo(
    () =>
      rolloutPlans.map((plan) => {
        const assetsForPlan = plan.assetIds
          .map((assetId) => assetById.get(assetId))
          .filter(Boolean);
        const scheduledCount = assetsForPlan.filter((asset) => scheduledAssetIds.has(asset.id)).length;
        const pendingCount = assetsForPlan.length - scheduledCount;
        return {
          ...plan,
          pendingCount,
          scheduledCount,
          group: groupById.get(plan.generationGroupId) || null,
        };
      }),
    [assetById, groupById, rolloutPlans, scheduledAssetIds],
  );

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleAssetSelection = (assetId) => {
    setSelectedAssetIds((current) =>
      current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId],
    );
  };

  const buildRolloutInput = () => ({
    id: activeRolloutId,
    name: String(form.name || "").trim() || `${selectedGroup?.title || "New"} rollout`,
    generationGroupId: selectedGroup?.id || "",
    cadence: form.cadence,
    preferredTime: normalizePreferredTime(form.preferredTime),
    startDate: form.startDate,
    assetIds: selectedRolloutAssets.map((asset) => asset.id),
  });

  const handleSaveRollout = () => {
    setBuilderError("");
    setBuilderNotice("");
    try {
      const savedPlan = onCreateRolloutPlan(buildRolloutInput());
      setActiveRolloutId(savedPlan.id);
      setBuilderNotice(`Saved rollout "${savedPlan.name}".`);
    } catch (error) {
      setBuilderError(error.message);
    }
  };

  const handleScheduleRollout = async () => {
    setBuilderError("");
    setBuilderNotice("");
    const entries = currentPreview;
    if (!entries.length) {
      setBuilderError("There are no schedulable assets in this batch yet.");
      return;
    }

    const result = await onScheduleRolloutPlan({
      rollout: buildRolloutInput(),
      entries,
    });

    if (!result) return;
    setActiveRolloutId(result.rolloutId || "");

    if (result.successes.length && result.failures.length) {
      setBuilderNotice(
        `Scheduled ${result.successes.length} asset${result.successes.length === 1 ? "" : "s"} with ${result.failures.length} issue${result.failures.length === 1 ? "" : "s"}.`,
      );
      return;
    }

    if (result.successes.length) {
      setBuilderNotice(
        `Scheduled ${result.successes.length} asset${result.successes.length === 1 ? "" : "s"} from this rollout.`,
      );
      return;
    }

    setBuilderError(result.failures[0]?.error || "Scheduling failed.");
  };

  return (
    <section className="calendar-page">
      <div className="calendar-header">
        <div>
          <p className="eyebrow">Calendar and bulk scheduling</p>
          <h1>Plan the next five weeks of repurposed content</h1>
          <p className="calendar-subtitle">
            See what is already scheduled, spot open publishing days, and turn a YouTube generation batch into a full rollout from one place.
          </p>
        </div>
        <div className="calendar-header-actions">
          <span className={`save-indicator save-indicator-${plannerSaveStatus}`}>
            <span className="save-indicator-dot" />
            Planner {plannerSaveStatus === "idle" ? "ready" : plannerSaveStatus}
          </span>
          <button className="ghost-button" onClick={onGoToWorkspace} type="button">
            Open workspace
          </button>
        </div>
      </div>

      <div className="calendar-overview-grid">
        <article className="calendar-stat-card">
          <span>Visible window</span>
          <strong>5 weeks</strong>
          <p>A practical planning range for launches, clips, carousels, posts, and newsletters.</p>
        </article>
        <article className="calendar-stat-card">
          <span>Scheduled</span>
          <strong>{scheduledInWindow}</strong>
          <p>Posts already locked into the publishing queue in this window.</p>
        </article>
        <article className="calendar-stat-card">
          <span>Planned</span>
          <strong>{plannedInWindow}</strong>
          <p>Saved rollout items previewed on the calendar before launch.</p>
        </article>
        <article className="calendar-stat-card">
          <span>Ready assets</span>
          <strong>{unscheduledReadyAssets.length}</strong>
          <p>Finished assets still waiting for a publish date.</p>
        </article>
      </div>

      <section className="calendar-queue-panel">
        <div className="calendar-board-top">
          <div>
            <p className="eyebrow">Next in queue</p>
            <h2>Upcoming scheduled and planned posts</h2>
          </div>
          <span className="summary-tag">{visibleCalendarEvents.length} visible</span>
        </div>

        {upcomingCalendarEvents.length ? (
          <div className="calendar-queue-list">
            {upcomingCalendarEvents.map((event) => (
              <div key={event.id} className={`calendar-queue-item calendar-queue-item-${event.kind}`}>
                <div>
                  <span>{event.platform}</span>
                  <strong>{event.title}</strong>
                </div>
                <div>
                  <small>{event.timeLabel}</small>
                  <em>{event.kind === "scheduled" ? "Scheduled" : "Planned rollout"}</em>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-copy">
            No scheduled or planned posts in the next five weeks. Build a rollout on the right to fill the calendar.
          </p>
        )}
      </section>

      <div className="calendar-layout">
        <div className="calendar-main-stack">
          <section className="calendar-board">
            <div className="calendar-board-top">
              <div>
                <p className="eyebrow">Five-week calendar</p>
                <h2>Scheduled posts and rollout previews</h2>
              </div>
              <span className="summary-tag">
                {visibleCalendarEvents.length} item{visibleCalendarEvents.length === 1 ? "" : "s"}
              </span>
            </div>

            {scheduledPostsStatus === "loading" ? (
              <p className="muted-copy">Loading scheduled posts...</p>
            ) : scheduledPostsError ? (
              <p className="error">{scheduledPostsError}</p>
            ) : null}

            <div className="calendar-weekdays" aria-hidden="true">
              {WEEKDAY_LABELS.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="calendar-day-grid">
              {dayRange.map((day) => {
                const dayEvents = eventsByDay[day.key] || [];

                return (
                  <article
                    key={day.key}
                    className={`calendar-day-card ${day.isToday ? "calendar-day-card-today" : ""} ${
                      dayEvents.length ? "calendar-day-card-filled" : ""
                    } ${day.isPast ? "calendar-day-card-past" : ""}`}
                  >
                    <div className="calendar-day-top">
                      <div>
                        <strong>{day.dayNumber}</strong>
                        <small>{day.monthLabel}</small>
                        {day.isToday ? <span>Today</span> : null}
                      </div>
                      <span>{dayEvents.length}</span>
                    </div>

                    {dayEvents.length ? (
                      <div className="calendar-post-list">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className={`calendar-post-item calendar-post-item-${event.kind}`}>
                            <p>{event.platform}</p>
                            <strong>{event.timeLabel}</strong>
                            <span>{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 3 ? (
                          <span className="calendar-more-count">
                            +{dayEvents.length - 3} more
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="calendar-open-slot">Open</p>
                    )}

                    {dayEvents.some((event) => event.kind === "planned") ? (
                      <span className="calendar-planned-marker">Rollout preview</span>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="calendar-board">
            <div className="calendar-board-top">
              <div>
                <p className="eyebrow">Draft rollouts</p>
                <h2>Saved bulk schedules you can launch later</h2>
              </div>
              <span className="summary-tag">{rolloutPlans.length}</span>
            </div>

            {savedRolloutCards.length ? (
              <div className="campaign-card-list">
                {savedRolloutCards.map((plan) => (
                  <RolloutPlanCard
                    key={plan.id}
                    plan={plan}
                    group={plan.group}
                    pendingCount={plan.pendingCount}
                    scheduledCount={plan.scheduledCount}
                    onDelete={onDeleteRolloutPlan}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <h3>No rollout plans yet</h3>
                <p>
                  Save a rollout when you want to review the plan before sending posts into the publishing queue.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="calendar-sidebar">
          <section className="panel">
            <div className="panel-heading compact">
              <div>
                <p className="eyebrow">Step 1</p>
                <h3>Choose the video generation to roll out</h3>
              </div>
              <span className="results-count">{generationGroups.length}</span>
            </div>

            {generationGroups.length ? (
              <div className="generation-group-list">
                {generationGroups.map((group) => (
                  <button
                    key={group.id}
                    className={`generation-group-card ${group.id === selectedGroupId ? "active" : ""}`}
                    onClick={() => setSelectedGroupId(group.id)}
                    type="button"
                  >
                    <span className="generation-group-title">{group.title}</span>
                    <span className="generation-group-meta">
                      {group.assetIds.length} asset{group.assetIds.length === 1 ? "" : "s"} - {formatWorkspaceDate(group.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted-copy">Generate repurposed content first. Each generation run will appear here as a batch.</p>
            )}
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Bulk scheduler</p>
                <h2>{selectedGroup ? "Build a rollout" : "Select a batch to begin"}</h2>
              </div>
            </div>

            {selectedGroup ? (
              <>
                <div className="planner-batch-summary">
                  <strong>{selectedGroup.title}</strong>
                  <span>{selectedGroup.sourceLabel}</span>
                </div>

                <form
                  className="stack-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSaveRollout();
                  }}
                >
                  <div className="planner-step-heading">
                    <span>Step 2</span>
                    <strong>Name the rollout and choose the rhythm</strong>
                  </div>
                  <label className="field">
                    <span>Rollout name</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => handleFieldChange("name", event.target.value)}
                    />
                  </label>

                  <div className="planner-form-grid">
                    <label className="field">
                      <span>Start date</span>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(event) => handleFieldChange("startDate", event.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span>Time</span>
                      <input
                        type="time"
                        value={form.preferredTime}
                        onChange={(event) => handleFieldChange("preferredTime", event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span>Posting cadence</span>
                    <select
                      className="planner-select"
                      value={form.cadence}
                      onChange={(event) => handleFieldChange("cadence", event.target.value)}
                    >
                      {CADENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="planner-section">
                    <div className="panel-heading compact">
                      <div>
                        <p className="eyebrow">Step 3</p>
                        <h3>Select the posts to include</h3>
                      </div>
                      <span className="results-count">{availableRolloutAssets.length}</span>
                    </div>

                    {availableRolloutAssets.length ? (
                      <div className="planner-checklist">
                        <AssetChecklistSection
                          assets={batchRolloutAssets}
                          emptyCopy="Everything publishable in this batch is already scheduled, or still needs to be marked ready."
                          label="Generated from this video"
                          selectedAssetIds={selectedAssetIds}
                          sourceLabel="Batch"
                          connectedPlatformIds={connectedPlatformIds}
                          integrationStatus={integrationStatus}
                          onToggleAsset={toggleAssetSelection}
                        />
                        <AssetChecklistSection
                          assets={extraRolloutAssets}
                          emptyCopy="No extra unscheduled workspace assets are available right now."
                          label="Optional extras from workspace"
                          selectedAssetIds={selectedAssetIds}
                          sourceLabel="Workspace"
                          connectedPlatformIds={connectedPlatformIds}
                          integrationStatus={integrationStatus}
                          onToggleAsset={toggleAssetSelection}
                        />
                      </div>
                    ) : (
                      <p className="muted-copy">
                        Mark assets as ready in the workspace before adding them to a rollout.
                      </p>
                    )}
                  </div>

                  <div className="planner-section">
                    <div className="panel-heading compact">
                      <div>
                        <p className="eyebrow">Step 4</p>
                        <h3>Review the schedule before publishing</h3>
                      </div>
                      <span className="results-count">{currentPreview.length}</span>
                    </div>

                    {currentPreview.length ? (
                      <div className="planner-asset-list">
                        {currentPreview.map((entry) => (
                          <div key={entry.asset.id} className="planner-asset-row">
                            <div>
                              <strong>{getAssetDisplayName(entry.asset)}</strong>
                              <span>{formatScheduledPostTime(entry.scheduledFor)}</span>
                            </div>
                            <span className="summary-tag">
                              {batchRolloutAssetIds.has(entry.asset.id) ? "Batch" : "Workspace"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="muted-copy">Pick at least one asset above to see the dates and order.</p>
                    )}

                    {disconnectedPreviewPlatforms.length ? (
                      <div className="asset-publish-status">
                        <p className="error">
                          Connect {disconnectedPreviewPlatforms.map((platform) => formatPlatformName(platform)).join(", ")} in Integrations before scheduling this rollout.
                        </p>
                        <button className="ghost-button small" onClick={onGoToIntegrations} type="button">
                          Open integrations
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="planner-actions">
                    <button className="ghost-button" type="submit">
                      Save draft rollout
                    </button>
                    <button
                      className="primary-button"
                      onClick={handleScheduleRollout}
                      type="button"
                      disabled={
                        rolloutScheduleStatus === "loading" ||
                        !currentPreview.length ||
                        disconnectedPreviewPlatforms.length > 0
                      }
                    >
                      {rolloutScheduleStatus === "loading" ? "Scheduling..." : "Schedule all selected posts"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <p className="muted-copy">Choose a generation batch above to start mass scheduling posts.</p>
            )}

            {builderError ? <p className="error">{builderError}</p> : null}
            {builderNotice ? <p className="success">{builderNotice}</p> : null}
            {rolloutScheduleError && rolloutScheduleStatus !== "success" ? (
              <p className="error">{rolloutScheduleError}</p>
            ) : null}
            {rolloutScheduleResult?.successes?.length && rolloutScheduleStatus === "success" ? (
              <p className="success">
                Scheduled {rolloutScheduleResult.successes.length} asset{rolloutScheduleResult.successes.length === 1 ? "" : "s"} from this rollout.
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </section>
  );
}
