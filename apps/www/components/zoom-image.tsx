"use client";

import { Maximize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ZoomImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  caption?: string;
}

export function ZoomImage({ src, alt, caption, className, ...props }: ZoomImageProps) {
  const [expanded, setExpanded] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.naturalWidth > img.naturalHeight) {
      setIsLandscape(true);
    }
  }, []);

  const toggle = useCallback(() => {
    if (!expanded && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
    setExpanded((prev) => !prev);
  }, [expanded]);

  // Escape key dismissal
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  // Body scroll lock + viewport scale lock (prevents mobile Safari zoom-on-rotate)
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const prevContent = meta?.content ?? "";
    if (meta) {
      meta.content = `${prevContent}, maximum-scale=1`;
    }

    return () => {
      document.body.style.overflow = prev;
      if (meta) {
        meta.content = prevContent;
      }
    };
  }, [expanded]);

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: span with role="button" is appropriate for an image zoom trigger */}
      <span
        className={`group relative inline-block ${expanded ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={alt ? `Expand image: ${alt}` : "Expand image"}
      >
        {/* biome-ignore lint/performance/noImgElement: raw img needed for naturalWidth/naturalHeight detection */}
        <img
          ref={imgRef}
          src={src}
          alt={alt || ""}
          className={`${className ?? ""} ${expanded ? "invisible" : ""}`}
          onLoad={handleLoad}
          draggable={false}
          {...props}
        />

        {/* Placeholder to prevent layout shift */}
        {expanded && dimensions && (
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: dimensions.width,
              height: dimensions.height,
            }}
          />
        )}

        {/* Landscape expand hint */}
        {isLandscape && !expanded && (
          <span
            className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1.5 text-white opacity-60 shadow-sm backdrop-blur-sm transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
            aria-hidden="true"
          >
            <Maximize2 className="size-3.5" />
          </span>
        )}
      </span>

      {/* Expanded overlay — portaled to body */}
      {expanded &&
        createPortal(
          <div
            className="zoom-overlay-enter fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center bg-black/80 p-4"
            onClick={() => setExpanded(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setExpanded(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label={alt ? `Expanded image: ${alt}` : "Expanded image"}
          >
            {/* biome-ignore lint/performance/noImgElement: portaled copy for zoom display */}
            <img
              src={src}
              alt={alt || ""}
              className={`${caption ? "max-h-[85vh]" : "max-h-[90vh]"} max-w-[90vw] rounded-lg object-contain`}
              draggable={false}
            />
            {caption && (
              <p className="mt-3 max-w-[80vw] px-4 text-center text-sm leading-relaxed text-white/90">
                {caption}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
