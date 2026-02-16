"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Children, isValidElement, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageCarouselProps {
  caption?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Extract image data (src, alt) from children rendered by MDX.
 * MDX converts `![alt](src)` into the component mapped to `img` (ZoomImage),
 * so we look for elements whose props include `src`.
 */
function extractImages(children: React.ReactNode): { src: string; alt: string }[] {
  const images: { src: string; alt: string }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as Record<string, unknown>;
    if (typeof props.src === "string") {
      images.push({ src: props.src, alt: (props.alt as string) || "" });
    }
    // MDX wraps inline images in <p> tags — check nested children too
    if (props.children) {
      images.push(...extractImages(props.children as React.ReactNode));
    }
  });
  return images;
}

export function ImageCarousel({ caption, className, children }: ImageCarouselProps) {
  const images = extractImages(children);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Zoom overlay state
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [zoomApi, setZoomApi] = useState<CarouselApi>();
  const zoomed = zoomIndex !== null;

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Sync zoom carousel to the clicked image index
  useEffect(() => {
    if (zoomApi && zoomIndex !== null) {
      zoomApi.scrollTo(zoomIndex, true);
    }
  }, [zoomApi, zoomIndex]);

  // Track zoom carousel position
  const [zoomCurrent, setZoomCurrent] = useState(0);
  useEffect(() => {
    if (!zoomApi) return;
    const onSelect = () => {
      setZoomCurrent(zoomApi.selectedScrollSnap() + 1);
    };
    // Set initial
    onSelect();
    zoomApi.on("select", onSelect);
    return () => {
      zoomApi.off("select", onSelect);
    };
  }, [zoomApi]);

  // Keyboard navigation in zoom mode
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomIndex(null);
      if (e.key === "ArrowLeft") zoomApi?.scrollPrev();
      if (e.key === "ArrowRight") zoomApi?.scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, zoomApi]);

  // Body scroll lock when zoomed
  useEffect(() => {
    if (!zoomed) return;
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
  }, [zoomed]);

  const openZoom = useCallback((index: number) => {
    setZoomIndex(index);
  }, []);

  const closeZoom = useCallback(() => {
    setZoomIndex(null);
  }, []);

  if (images.length === 0) return null;

  return (
    <>
      <figure className={`not-prose my-8 flex flex-col items-center ${className ?? ""}`}>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.src}>
                {/* biome-ignore lint/a11y/useSemanticElements: span with role="button" wraps clickable image */}
                <span
                  className="group relative w-full cursor-zoom-in md:flex md:justify-center"
                  onClick={() => openZoom(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openZoom(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={image.alt ? `Expand image: ${image.alt}` : "Expand image"}
                >
                  {/* biome-ignore lint/performance/noImgElement: raw img for carousel display */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full rounded-lg bg-white md:max-h-[50vh] md:w-auto md:max-w-full"
                    draggable={false}
                  />
                </span>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 z-10 size-9 -translate-y-1/2 border-none bg-black/40 text-white hover:bg-black/60 disabled:opacity-30" />
          <CarouselNext className="absolute right-2 top-1/2 z-10 size-9 -translate-y-1/2 border-none bg-black/40 text-white hover:bg-black/60 disabled:opacity-30" />
        </Carousel>

        <div className="mt-3 flex flex-col items-center gap-1">
          {count > 1 && (
            <span className="text-xs font-medium text-muted-foreground">
              {current} / {count}
            </span>
          )}
          {caption && (
            <figcaption className="text-center text-sm text-muted-foreground">{caption}</figcaption>
          )}
        </div>
      </figure>

      {/* Fullscreen zoom overlay with carousel navigation */}
      {zoomed &&
        createPortal(
          <div
            className="zoom-overlay-enter fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center bg-black/80"
            onClick={closeZoom}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeZoom();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Expanded image carousel"
          >
            {/* Carousel in the overlay — stop click propagation so swiping doesn't close */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation needed to prevent backdrop close */}
            <div
              className="flex w-full max-w-[90vw] cursor-default flex-col items-center"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Carousel setApi={setZoomApi} className="w-full">
                <CarouselContent>
                  {images.map((image) => (
                    <CarouselItem key={image.src} className="flex items-center justify-center">
                      {/* biome-ignore lint/performance/noImgElement: zoom display copy */}
                      <img
                        src={image.src}
                        alt={image.alt}
                        className={`${caption ? "max-h-[75vh]" : "max-h-[85vh]"} w-auto max-w-full rounded-lg object-contain bg-white`}
                        draggable={false}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Overlay navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 disabled:opacity-30"
                    onClick={() => zoomApi?.scrollPrev()}
                    disabled={!zoomApi?.canScrollPrev()}
                    aria-label="Previous image"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 disabled:opacity-30"
                    onClick={() => zoomApi?.scrollNext()}
                    disabled={!zoomApi?.canScrollNext()}
                    aria-label="Next image"
                  >
                    <ArrowRight className="size-5" />
                  </button>
                </>
              )}
            </div>

            {/* Counter + caption below the image */}
            <div className="mt-3 flex flex-col items-center gap-1">
              {images.length > 1 && (
                <span className="text-xs font-medium text-white/70">
                  {zoomCurrent} / {images.length}
                </span>
              )}
              {caption && (
                <p className="max-w-[80vw] px-4 text-center text-sm leading-relaxed text-white/90">
                  {caption}
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
