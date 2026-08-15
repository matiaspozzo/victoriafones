"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Background video from the live site's Elementor hero section
// (youtube.com/watch?v=3h3KXkEyxts). Back to a YouTube iframe embed —
// self-hosting the MP4 (a prior version of this component) measurably hurt
// Lighthouse performance (decoding/playing a 25MB local file showed up as
// real main-thread cost); YouTube's own player/CDN handles this far more
// cheaply. Known tradeoff, accepted deliberately: iOS Safari has a hard
// platform rule blocking autoplay for *any* video inside an <iframe>, muted
// or not, so on iOS the hero silently stays on the static poster instead of
// playing — there is no reliable native-video-in-iframe workaround for that.
//
// `pointer-events-none` on the iframe means nothing on it is ever clickable
// — no play/pause/seek control is reachable, regardless of whether autoplay
// succeeded — on top of the URL params below already hiding YouTube's own
// UI chrome. On top of that: YouTube's player briefly flashes its own
// prev/pause/next overlay + title + logo for the first few seconds after
// *any* embed starts playing, controls=0 or not — confirmed via screenshots
// at t=3s/7s (still showing) vs t=10s (gone on its own), and it's not
// something any URL parameter suppresses. REVEAL_DELAY_MS keeps our own
// poster on top of the iframe (which is already playing underneath,
// unaffected performance-wise) for a few seconds after mount so that flash
// never becomes visible — real users only ever see either the static
// poster or the fully-settled, chrome-free video.
//
// Deferred like the self-hosted version was: the iframe is only mounted
// after the window "load" event, so it never competes with (or gets
// measured as part of) the page's own initial-load performance budget, and
// is skipped entirely under the `md` breakpoint — mobile stays on the
// poster permanently to save data and sidestep mobile autoplay quirks.
const YOUTUBE_ID = "3h3KXkEyxts";
const YOUTUBE_SRC =
  `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}` +
  `?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_ID}` +
  "&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&playsinline=1&enablejsapi=0";

const REVEAL_DELAY_MS = 6000;

export default function HeroVideo() {
  const [mountVideo, setMountVideo] = useState(false);
  const [revealVideo, setRevealVideo] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    function mount() {
      setMountVideo(true);
    }

    if (document.readyState === "complete") {
      mount();
    } else {
      window.addEventListener("load", mount, { once: true });
    }

    return () => window.removeEventListener("load", mount);
  }, []);

  useEffect(() => {
    if (!mountVideo) return;

    const timer = setTimeout(() => setRevealVideo(true), REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mountVideo]);

  return (
    <div className="relative h-[60vh] w-full overflow-hidden bg-brand-gray">
      {/* LCP element: local, optimized, always painted first. Stays on top
          (z-10) of the iframe until REVEAL_DELAY_MS has passed, masking
          YouTube's brief startup chrome flash — see comment above. */}
      <Image
        src="/hero-video/hero-video-poster.webp"
        alt=""
        fill
        priority
        className={`object-cover ${revealVideo ? "" : "z-10"}`}
        sizes="100vw"
      />
      {mountVideo ? (
        <iframe
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-[60vh] w-[100vw] min-w-[106.7vh] -translate-x-1/2 -translate-y-1/2"
          src={YOUTUBE_SRC}
          title=""
          aria-hidden="true"
          tabIndex={-1}
          allow="autoplay; encrypted-media"
        />
      ) : null}
    </div>
  );
}
