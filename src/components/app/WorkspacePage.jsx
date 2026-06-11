"use client";

import { useEffect, useRef, useState } from "react";
import {
  ASSET_STATUS_DRAFT,
  STATUS_CYCLE,
  STATUS_META,
} from "../../lib/appConstants";
import {
  buildAssetProgress,
  clampProgress,
  estimateRows,
  formatElapsed,
  formatWorkspaceDate,
  getAssetStatusCopy,
  getRealLoaderProgress,
  getStageLabel,
  getWorkspaceSaveLabel,
  isStructuredObject,
  serializeListToText,
  serializeStructuredItem,
  splitEditableList,
} from "../../lib/appUtils";

function StatusPill({ status, onSelect, size = "md" }) {
  const [animating, setAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const meta = STATUS_META[status] || STATUS_META[ASSET_STATUS_DRAFT];

  const handleClick = (event) => {
    event.stopPropagation();
    if (animating) return;
    setAnimating(true);
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length];
    onSelect(next);
    window.setTimeout(() => setAnimating(false), 300);
  };

  return (
    <div
      className="status-pill-wrapper"
      style={{ position: "relative", display: "inline-flex" }}
    >
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
        <svg
          className="status-pill-arrow"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {showTooltip ? (
        <div className="status-pill-tooltip" role="tooltip">
          Click to {"->"} <strong>{meta.nextLabel.replace("Mark as ", "").replace("Move back to ", "")}</strong>
        </div>
      ) : null}
    </div>
  );
}

function DraggableAssetCard({ asset, isActive, onSelect, onStatusChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const meta = STATUS_META[asset.status] || STATUS_META[ASSET_STATUS_DRAFT];

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", asset.id);
    event.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  return (
    <div
      className={`asset-card ${isActive ? "asset-card-active" : ""} ${isDragging ? "asset-card-dragging" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === "Enter" && onSelect()}
      aria-label={`${asset.title}, ${asset.platformLabel}, ${meta.label}`}
    >
      <div className="asset-card-drag-handle" aria-hidden="true">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <circle cx="4" cy="4" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="8" cy="4" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="4" cy="8" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="8" cy="12" r="1.5" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
      <div className="asset-card-body">
        <div className="asset-card-main">
          <strong className="asset-card-title">{asset.title}</strong>
          <span className="asset-card-platform">{asset.platformLabel}</span>
        </div>
        <div className="asset-card-footer">
          <span className="asset-card-date">
            {formatWorkspaceDate(asset.updatedAt || asset.createdAt)}
          </span>
          <StatusPill
            status={asset.status}
            onSelect={(newStatus) => onStatusChange(asset.id, newStatus)}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

function StatusLane({
  status,
  assets,
  activeAssetId,
  onSelectAsset,
  onStatusChange,
  isCollapsed,
  onToggleCollapse,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const meta = STATUS_META[status] || STATUS_META[ASSET_STATUS_DRAFT];

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  return (
    <section
      className={`status-lane status-lane-${status} ${isDragOver ? "status-lane-drag-over" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
      }}
      onDragLeave={handleDragLeave}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        const assetId = event.dataTransfer.getData("text/plain");
        if (assetId) onStatusChange(assetId, status);
      }}
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
          <span className="status-lane-chevron">{isCollapsed ? ">" : "v"}</span>
        </button>
      </header>

      {!isCollapsed ? (
        <div className="status-lane-body">
          {isDragOver && assets.length === 0 ? (
            <div className="status-lane-drop-hint">
              <span>Drop here to mark as {meta.label}</span>
            </div>
          ) : null}
          {assets.map((asset) => (
            <DraggableAssetCard
              key={asset.id}
              asset={asset}
              isActive={asset.id === activeAssetId}
              onSelect={() => onSelectAsset(asset.id)}
              onStatusChange={onStatusChange}
            />
          ))}
          {assets.length === 0 && !isDragOver ? (
            <div className="status-lane-empty">
              <p>Drag assets here to mark as {meta.label.toLowerCase()}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function isCarouselAsset(asset) {
  const type = (asset.assetType || "").toLowerCase();
  const title = (asset.title || "").toLowerCase();
  const platform = (asset.platformLabel || "").toLowerCase();
  if (type.includes("carousel") || title.includes("carousel")) return true;
  if (
    platform === "instagram" &&
    asset.blocks.some((block) => {
      const key = (block.key || "").toLowerCase();
      return (
        key.includes("slide") ||
        key.includes("carousel") ||
        (Array.isArray(block.value) &&
          block.value.length >= 2 &&
          block.value.every(isStructuredObject))
      );
    })
  ) {
    return true;
  }
  return false;
}

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
        (item) =>
          (typeof item === "string" && item.trim()) ||
          (isStructuredObject(item) &&
            (item.title || item.body || item.content || item.text || item.hook)),
      );
      if (looksLikeSlides) return block.value;
    }
  }

  const scalar = blocks.filter(
    (block) => !Array.isArray(block.value) && String(block.value || "").trim(),
  );
  if (scalar.length >= 2) {
    return scalar.map((block, index) => ({
      type: index === 0 ? "hook" : index === scalar.length - 1 ? "cta" : "content",
      title: String(block.value || "").slice(0, 120),
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
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
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
    items: Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.points)
        ? raw.points
        : Array.isArray(raw.tips)
          ? raw.tips
          : [],
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

const TEMPLATE_LIST = [
  { id: "hook", label: "Hook", desc: "Bold opener" },
  { id: "content", label: "List", desc: "Numbered points" },
  { id: "quote", label: "Quote", desc: "Dark pull quote" },
  { id: "breakdown", label: "Breakdown", desc: "2x2 grid" },
  { id: "cta", label: "CTA", desc: "Call to action" },
];

function SlideHook({ slide, index }) {
  return (
    <div className="cs-slide cs-slide-hook">
      <div className="cs-slide-inner">
        <div className="cs-top-meta">{slide.eyebrow || "Carousel"}</div>
        <div className="cs-accent-bar" />
        <h2 className="cs-hook-title">{slide.title || "Hook goes here"}</h2>
        {slide.body ? <p className="cs-hook-body">{slide.body}</p> : null}
        <div className="cs-slide-footer">
          <span>Swipe to read</span>
          <span className="cs-slide-num">{String(index + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function SlideContent({ slide, index }) {
  const hasItems = slide.items && slide.items.length > 0;
  return (
    <div className="cs-slide cs-slide-content">
      <div className="cs-slide-inner">
        <div className="cs-top-meta">{slide.eyebrow || `Slide ${index + 1}`}</div>
        {slide.title ? <h2 className="cs-content-title">{slide.title}</h2> : null}
        {hasItems ? (
          <div className="cs-item-list">
            {slide.items.slice(0, 4).map((item, itemIndex) => (
              <div key={itemIndex} className="cs-item-row">
                <div className="cs-item-num">{itemIndex + 1}</div>
                <div className="cs-item-text">
                  <strong>
                    {typeof item === "string"
                      ? item
                      : item.title || item.text || item.point || String(item)}
                  </strong>
                  {isStructuredObject(item) && (item.body || item.description) ? (
                    <span>{item.body || item.description}</span>
                  ) : null}
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

function SlideQuote({ slide, index }) {
  return (
    <div className="cs-slide cs-slide-quote">
      <div className="cs-slide-inner">
        <div className="cs-top-meta" style={{ color: "rgba(255,255,255,0.45)" }}>
          {slide.eyebrow || "Insight"}
        </div>
        <div className="cs-quote-mark">"</div>
        <p className="cs-quote-text">
          {slide.quote || slide.title || "Key insight goes here."}
        </p>
        {slide.body ? <p className="cs-quote-sub">{slide.body}</p> : null}
        <div className="cs-slide-footer" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span>Save this</span>
          <span className="cs-slide-num">{String(index + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function SlideBreakdown({ slide, index }) {
  const cells =
    slide.items && slide.items.length > 0
      ? slide.items.slice(0, 4)
      : slide.body
        ? [{ label: "Key point", value: slide.body }]
        : [];

  return (
    <div className="cs-slide cs-slide-breakdown">
      <div className="cs-slide-inner">
        <div className="cs-top-meta">{slide.eyebrow || "Breakdown"}</div>
        {slide.title ? (
          <h2 className="cs-content-title" style={{ fontSize: "20px" }}>
            {slide.title}
          </h2>
        ) : null}
        <div className="cs-breakdown-grid">
          {cells.map((cell, cellIndex) => {
            const label = isStructuredObject(cell)
              ? cell.label || cell.kicker || `Point ${cellIndex + 1}`
              : `Point ${cellIndex + 1}`;
            const value = isStructuredObject(cell)
              ? cell.value || cell.title || cell.text || String(cell)
              : String(cell);

            return (
              <div key={cellIndex} className="cs-mini-card">
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

function SlideCta({ slide }) {
  return (
    <div className="cs-slide cs-slide-cta">
      <div className="cs-slide-inner">
        <div className="cs-top-meta">{slide.eyebrow || "Final slide"}</div>
        <div className="cs-accent-bar" />
        {slide.title ? <h2 className="cs-hook-title">{slide.title}</h2> : null}
        {slide.body ? <p className="cs-hook-body">{slide.body}</p> : null}
        <div className="cs-cta-box">
          <p className="cs-cta-text">{slide.cta || slide.title || "Follow for more"}</p>
          <div className="cs-cta-pill">Save this post</div>
        </div>
      </div>
    </div>
  );
}

const SLIDE_RENDERERS = {
  hook: SlideHook,
  content: SlideContent,
  "content-list": SlideContent,
  list: SlideContent,
  quote: SlideQuote,
  insight: SlideQuote,
  breakdown: SlideBreakdown,
  framework: SlideBreakdown,
  cta: SlideCta,
  outro: SlideCta,
};

function TemplatePicker({ currentType, onSelect, onClose }) {
  return (
    <div className="cs-template-picker">
      <div className="cs-tp-header">
        <span>Choose template for this slide</span>
        <button className="cs-tp-close" onClick={onClose} type="button" aria-label="Close">
          X
        </button>
      </div>
      <div className="cs-tp-grid">
        {TEMPLATE_LIST.map((template) => (
          <button
            key={template.id}
            className={`cs-tp-option ${currentType === template.id ? "cs-tp-active" : ""}`}
            onClick={() => {
              onSelect(template.id);
              onClose();
            }}
            type="button"
          >
            <span className="cs-tp-label">{template.label}</span>
            <span className="cs-tp-desc">{template.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CarouselPreview({ rawSlides, assetTitle }) {
  const total = rawSlides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [templateOverrides, setTemplateOverrides] = useState({});
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const touchStartX = useRef(null);
  const viewportRef = useRef(null);

  const goTo = (index) => {
    setActiveIndex(Math.max(0, Math.min(total - 1, index)));
    setShowTemplatePicker(false);
  };

  const slides = rawSlides.map((slide, index) => {
    const normalized = normalizeSlide(slide, index, total);
    if (templateOverrides[index]) normalized.type = templateOverrides[index];
    return normalized;
  });

  const slide = slides[activeIndex];
  const Renderer = SLIDE_RENDERERS[slide.type] || SlideContent;

  const handleDownload = async () => {
    if (!window.html2canvas) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      document.head.appendChild(script);
      await new Promise((resolve) => {
        script.onload = resolve;
        script.onerror = resolve;
      });
    }

    if (!window.html2canvas) {
      alert("Could not load download library. Please try again.");
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);
    const previousIndex = activeIndex;

    try {
      for (let index = 0; index < slides.length; index += 1) {
        setDownloadProgress(Math.round((index / slides.length) * 100));
        setActiveIndex(index);
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        await new Promise((resolve) => window.setTimeout(resolve, 80));

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
        const safeTitle = (assetTitle || "carousel")
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        link.download = `${safeTitle}_slide_${String(index + 1).padStart(2, "0")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }
    } finally {
      setActiveIndex(previousIndex);
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="cs-wrap">
      <div className="cs-toolbar">
        <span className="cs-toolbar-label">
          Slide {activeIndex + 1} of {total}
          <span className="cs-toolbar-type">{slide.type}</span>
        </span>
        <div className="cs-toolbar-actions">
          <button
            className={`cs-toolbar-btn ${showTemplatePicker ? "active" : ""}`}
            onClick={() => setShowTemplatePicker((value) => !value)}
            type="button"
          >
            Template
          </button>
          <button
            className="cs-toolbar-btn cs-download-btn"
            onClick={handleDownload}
            disabled={downloading}
            type="button"
          >
            {downloading ? `${downloadProgress}%` : "Download all"}
          </button>
        </div>
      </div>

      {showTemplatePicker ? (
        <TemplatePicker
          currentType={slide.type}
          onSelect={(newType) =>
            setTemplateOverrides((current) => ({
              ...current,
              [activeIndex]: newType,
            }))
          }
          onClose={() => setShowTemplatePicker(false)}
        />
      ) : null}

      <div
        ref={viewportRef}
        className={`cs-viewport ${downloading ? "cs-viewport-exporting" : ""}`}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const delta = touchStartX.current - event.changedTouches[0].clientX;
          if (Math.abs(delta) > 40) goTo(activeIndex + (delta > 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        <Renderer slide={slide} index={activeIndex} total={total} />
        {!downloading && activeIndex > 0 ? (
          <button
            className="cs-arrow cs-arrow-prev"
            onClick={() => goTo(activeIndex - 1)}
            type="button"
            aria-label="Previous slide"
          >
            {"<"}
          </button>
        ) : null}
        {!downloading && activeIndex < total - 1 ? (
          <button
            className="cs-arrow cs-arrow-next"
            onClick={() => goTo(activeIndex + 1)}
            type="button"
            aria-label="Next slide"
          >
            {">"}
          </button>
        ) : null}
      </div>

      <div className="cs-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`cs-dot ${index === activeIndex ? "cs-dot-active" : ""}`}
            onClick={() => goTo(index)}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="cs-thumbnails">
        {slides.map((item, index) => (
          <button
            key={index}
            className={`cs-thumb ${index === activeIndex ? "cs-thumb-active" : ""}`}
            onClick={() => goTo(index)}
            type="button"
          >
            <span className="cs-thumb-num">{index + 1}</span>
            <span className="cs-thumb-type">
              {templateOverrides[index] ? `* ${item.type}` : item.type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EditableBlock({
  assetId,
  block,
  isActive,
  onActivate,
  onBlur,
  onChange,
  onRevert,
}) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [isActive]);

  const isList = Array.isArray(block.value);
  const hasStructuredItems = isList && block.value.some(isStructuredObject);

  const handleCopy = async () => {
    const content = isList
      ? hasStructuredItems
        ? serializeListToText(block.value)
        : block.value.join("\n")
      : String(block.value ?? "");

    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const textareaValue = isList
    ? serializeListToText(block.value)
    : String(block.value ?? "");
  const textareaRows = isList
    ? Math.max(6, textareaValue.split("\n").length + 1)
    : Math.max(5, estimateRows(block.value));

  return (
    <section
      className={`editable-block ${isActive ? "active" : ""} ${block.isDirty ? "dirty" : ""}`}
    >
      <div className="editable-block-top">
        <div>
          <p className="content-label">{block.label}</p>
          <span className="editable-block-hint">
            {block.kind === "list"
              ? hasStructuredItems
                ? `${block.value.length} sections`
                : `${block.value.length} lines`
              : "Inline editable"}
          </span>
        </div>
        <div className="editable-actions">
          {block.isDirty ? <span className="dirty-indicator">Edited</span> : null}
          {!isActive ? <span className="edit-cue">Click to edit</span> : null}
          <button className="ghost-button small" onClick={handleCopy} type="button">
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            className="ghost-button small"
            onClick={() => onRevert(assetId, block.id)}
            type="button"
            disabled={!block.isDirty}
          >
            Revert
          </button>
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
                      {item.title ? (
                        <strong className="section-item-title">{item.title}</strong>
                      ) : null}
                      {item.body || item.content || item.text ? (
                        <p className="section-item-body">
                          {item.body || item.content || item.text}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p key={`${block.id}-${index}`} className="content-section-plain">
                      {String(item ?? "")}
                    </p>
                  ),
                )}
              </div>
            ) : (
              <div className="content-list">
                {block.value.map((item, index) => (
                  <p key={`${block.id}-${index}`}>
                    <span>{index + 1}</span>
                    {item}
                  </p>
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

function AssetDocument({
  asset,
  activeBlockId,
  onSelectBlock,
  onBlurBlock,
  onBlockChange,
  onRevertBlock,
  onDeleteAsset,
  onStatusChange,
  onPublishLinkedIn,
  linkedinPublishStatus,
  linkedinPublishError,
  linkedinPublishResult,
}) {
  const dirtyCount = asset.blocks.filter((block) => block.isDirty).length;
  const [carouselView, setCarouselView] = useState("preview");
  const liveSlides = isCarouselAsset(asset) ? extractLiveSlides(asset.blocks) : null;
  const isLinkedInAsset = (asset.assetType || "").toLowerCase().includes("linkedin");
  const isPublishing = linkedinPublishStatus === "loading";
  const canPublishLinkedIn = isLinkedInAsset;
  const publishMatchesAsset = linkedinPublishResult?.assetId === asset.id;

  return (
    <article className="asset-document">
      <div className="asset-document-top">
        <div>
          <p className="platform">{asset.platformLabel}</p>
          <h3>{asset.title}</h3>
          <p className="muted-copy asset-meta">{asset.sourceLabel}</p>
        </div>
        <div className="asset-controls">
          {liveSlides ? (
            <div className="cs-view-toggle">
              <button
                className={carouselView === "preview" ? "active" : ""}
                onClick={() => setCarouselView("preview")}
                type="button"
              >
                Preview
              </button>
              <button
                className={carouselView === "edit" ? "active" : ""}
                onClick={() => setCarouselView("edit")}
                type="button"
              >
                Edit text
              </button>
            </div>
          ) : null}
          <StatusPill
            status={asset.status}
            onSelect={(newStatus) => onStatusChange(asset.id, newStatus)}
            size="md"
          />
          {dirtyCount > 0 ? (
            <span className="asset-document-dirty-badge">
              {dirtyCount} unsaved edit{dirtyCount > 1 ? "s" : ""}
            </span>
          ) : null}
          <button
            className="ghost-button small danger-button"
            onClick={() => onDeleteAsset(asset.id)}
            type="button"
          >
            Delete asset
          </button>
          {canPublishLinkedIn ? (
            <button
              className="primary-button small"
              onClick={() => onPublishLinkedIn(asset)}
              type="button"
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish to LinkedIn"}
            </button>
          ) : null}
        </div>
        {canPublishLinkedIn ? (
          <div className="asset-publish-status">
            {publishMatchesAsset && linkedinPublishError ? (
              <p className="error">{linkedinPublishError}</p>
            ) : publishMatchesAsset && linkedinPublishStatus === "success" ? (
              <p className="success">
                LinkedIn post published{linkedinPublishResult?.linkedin_post_id ? ` (${linkedinPublishResult.linkedin_post_id})` : ""}.
              </p>
            ) : (
              <p className="muted-copy">
                Publish this LinkedIn asset directly to your connected account.
              </p>
            )}
          </div>
        ) : null}
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
          <video
            className="asset-video-player"
            controls
            preload="metadata"
            src={asset.media.videoUrl}
          >
            Your browser does not support video playback.
          </video>
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

export function GenerationLoader({ job, selectedAssets, targetAssets }) {
  const stageLabel = getStageLabel(job?.stage);
  const elapsed = formatElapsed(job?.created_at);
  const steps =
    Array.isArray(job?.steps) && job.steps.length
      ? job.steps
      : [
          { key: "source", label: "Getting ready", status: "active" },
          { key: "moments", label: "Understanding input", status: "pending" },
          { key: "strategy", label: "Preparing content", status: "pending" },
          { key: "execution", label: "Creating results", status: "pending" },
          { key: "finalize", label: "Wrapping up", status: "pending" },
        ];

  const assetProgress = buildAssetProgress(
    job?.asset_progress,
    selectedAssets,
    targetAssets,
  );
  const realProgress = getRealLoaderProgress(job, steps, assetProgress);
  const [displayProgress, setDisplayProgress] = useState(realProgress);
  const progressPercent = Math.round(displayProgress);
  const completedAssets = assetProgress.filter(
    (asset) => asset.status === "completed",
  ).length;
  const totalAssets = assetProgress.length;

  useEffect(() => {
    setDisplayProgress(realProgress);
  }, [job?.id, realProgress]);

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
        if (current > target) {
          return clampProgress(Math.max(target, current - 0.8));
        }
        return current;
      });
    }, 180);

    return () => window.clearInterval(intervalId);
  }, [assetProgress, job, steps]);

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
            <span>
              {totalAssets ? `${completedAssets}/${totalAssets} ready` : elapsed}
            </span>
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
            <div
              key={asset.asset_type}
              className={`loader-asset loader-asset-${asset.status}`}
            >
              <div>
                <strong>{asset.label}</strong>
                <p>{getAssetStatusCopy(asset)}</p>
              </div>
              <span>
                {asset.status === "completed"
                  ? "Done"
                  : asset.status === "active"
                    ? "Live"
                    : "Next"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage({
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
  onPublishLinkedIn,
  linkedinPublishStatus,
  linkedinPublishError,
  linkedinPublishResult,
  onExportWorkspace,
  saveStatus,
  selectedAsset,
  lastGeneratedCount,
  onGoToMain,
}) {
  const [collapsedLanes, setCollapsedLanes] = useState({ published: true });

  const toggleLane = (status) => {
    setCollapsedLanes((current) => ({
      ...current,
      [status]: !current[status],
    }));
  };

  return (
    <section className="results-section">
      {assets.length ? (
        <>
          <div className="results-header workspace-results-header">
            <div>
              <p className="eyebrow">Asset workspace</p>
              <h2>Generate, refine, organize, reuse</h2>
              <p className="muted-copy">
                Drag assets between lanes to update their status, or click the pill
                on any card.
              </p>
            </div>
            <div className="workspace-results-actions">
              {lastGeneratedCount ? (
                <span className="summary-tag">
                  {lastGeneratedCount} new{" "}
                  {lastGeneratedCount === 1 ? "asset" : "assets"} added
                </span>
              ) : null}
              <button
                className="ghost-button small"
                onClick={onExportWorkspace}
                type="button"
              >
                Export all
              </button>
              <span className={`save-indicator save-indicator-${saveStatus}`}>
                <span className="save-indicator-dot" />
                {getWorkspaceSaveLabel(saveStatus)}
              </span>
            </div>
          </div>

          <div className="asset-workspace">
            <div className="asset-group-section">
              <div className="workspace-sidebar-hint">
                <span>Drag cards to change status</span>
              </div>
              {STATUS_CYCLE.map((status) => (
                <StatusLane
                  key={status}
                  status={status}
                  assets={assets.filter((asset) => asset.status === status)}
                  activeAssetId={activeAssetId}
                  onSelectAsset={onSelectAsset}
                  onStatusChange={onSelectAssetStatus}
                  isCollapsed={!!collapsedLanes[status]}
                  onToggleCollapse={() => toggleLane(status)}
                />
              ))}
            </div>

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
                onPublishLinkedIn={onPublishLinkedIn}
                linkedinPublishStatus={linkedinPublishStatus}
                linkedinPublishError={linkedinPublishError}
                linkedinPublishResult={linkedinPublishResult}
              />
            ) : (
              <div className="asset-document workspace-document-empty">
                <div className="workspace-document-empty-icon" aria-hidden="true" />
                <h3>Select an asset to edit</h3>
                <p>Click any card in the sidebar to open it here for editing.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-panel large">
          <h3>Your workspace is ready for its first asset</h3>
          <p>
            Generate content from the main page and every asset will be added here
            as a reusable editing library.
          </p>
          <button className="primary-button" onClick={onGoToMain} type="button">
            Go to main page
          </button>
        </div>
      )}
    </section>
  );
}
