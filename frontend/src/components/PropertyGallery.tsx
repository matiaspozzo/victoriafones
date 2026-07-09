"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { thumb: string; card: string; full: string };

export default function PropertyGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const go = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div>
      {/* Main image with prev/next controls */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-gray">
        <Image
          key={index}
          src={images[index].full}
          alt={`${title} ${index + 1}`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 1152px, 100vw"
          priority={index === 0}
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-2xl text-brand-primary shadow-md hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-2xl text-brand-primary shadow-md hover:bg-white"
            >
              ›
            </button>
            <span className="absolute bottom-4 right-4 bg-brand-primary/80 px-3 py-1 text-xs font-medium text-white">
              {index + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {images.map((image, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1}`}
              className={`relative aspect-[4/3] h-16 w-24 flex-shrink-0 overflow-hidden bg-brand-gray transition-opacity ${
                i === index ? "ring-2 ring-brand-primary" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image.thumb} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
