"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type GalleryImage = { thumb: string; card: string; full: string };

const PAGE_SIZE = 6;

export default function PropertyGallery({
  images,
  title,
  nextLabel,
  previousLabel,
  closeLabel,
}: {
  images: GalleryImage[];
  title: string;
  nextLabel: string;
  previousLabel: string;
  closeLabel: string;
}) {
  const [page, setPage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrevious = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showPrevious();
      else if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showPrevious, showNext]);

  if (images.length === 0) return null;

  const pageCount = Math.ceil(images.length / PAGE_SIZE);
  const visible = images.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((image, i) => {
          const index = page * PAGE_SIZE + i;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="relative aspect-[4/3] w-full overflow-hidden bg-brand-gray"
            >
              <Image
                src={image.full}
                alt={`${title} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 50vw, 100vw"
                priority={page === 0 && i < 2}
              />
            </button>
          );
        })}
      </div>

      {pageCount > 1 ? (
        <div className="mt-6 flex items-center justify-end gap-6 font-heading text-sm font-medium text-brand-primary">
          {page > 0 ? (
            <button type="button" onClick={() => setPage((p) => p - 1)} className="hover:underline">
              ← {previousLabel}
            </button>
          ) : null}
          {page < pageCount - 1 ? (
            <button type="button" onClick={() => setPage((p) => p + 1)} className="hover:underline">
              {nextLabel} →
            </button>
          ) : null}
        </div>
      ) : null}

      {lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label={closeLabel}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center sm:right-6 sm:top-6"
          >
            <span className="absolute block h-0.5 w-6 rotate-45 bg-white" />
            <span className="absolute block h-0.5 w-6 -rotate-45 bg-white" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrevious();
            }}
            aria-label={previousLabel}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 px-2 py-4 font-heading text-3xl text-white/80 hover:text-white sm:left-6"
          >
            ←
          </button>

          <div
            className="relative h-[80vh] w-[90vw] sm:w-[85vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].full}
              alt={`${title} ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label={nextLabel}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 px-2 py-4 font-heading text-3xl text-white/80 hover:text-white sm:right-6"
          >
            →
          </button>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-heading text-sm text-white/70">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
