"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { thumb: string; card: string; full: string };

const PAGE_SIZE = 6;

export default function PropertyGallery({
  images,
  title,
  nextLabel,
  previousLabel,
}: {
  images: GalleryImage[];
  title: string;
  nextLabel: string;
  previousLabel: string;
}) {
  const [page, setPage] = useState(0);

  if (images.length === 0) return null;

  const pageCount = Math.ceil(images.length / PAGE_SIZE);
  const visible = images.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((image, i) => (
          <div key={page * PAGE_SIZE + i} className="relative aspect-[4/3] w-full overflow-hidden bg-brand-gray">
            <Image
              src={image.full}
              alt={`${title} ${page * PAGE_SIZE + i + 1}`}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
              priority={page === 0 && i < 2}
            />
          </div>
        ))}
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
    </div>
  );
}
