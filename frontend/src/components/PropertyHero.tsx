"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroImage = { thumb: string; card: string; full: string };

/**
 * Property detail image slider (the property's own photos, first three), shown
 * full-width directly below the navy headline block — mirrors the live site.
 */
export default function PropertyHero({ images, title }: { images: HeroImage[]; title: string }) {
  const slides = images.slice(0, 3);
  const count = slides.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0) return null;

  return (
    <section className="relative h-[380px] w-full overflow-hidden bg-brand-gray sm:h-[520px]">
      {slides.map((img, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={img.full}
            alt={title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {count > 1 ? (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
