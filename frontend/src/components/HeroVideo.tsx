"use client";

import { useEffect, useRef } from "react";

// Background video from the live site's Elementor hero section
// (originally youtube.com/watch?v=3h3KXkEyxts). Self-hosted as an MP4 instead of a
// YouTube iframe — iOS Safari has a hard platform rule blocking autoplay for any
// video inside an <iframe>, muted or not, so a YouTube embed can never reliably
// autoplay there. A native <video> is the only approach that works everywhere.
//
// No JS-driven opacity crossfade here on purpose: a React-controlled opacity
// transition that fires at the same moment playback actually starts triggers a
// known WebKit bug where decoded frames get sent to a compositing layer that
// never paints — Safari fires "playing" and the video is genuinely playing, but
// nothing visible happens. The native `poster` attribute already handles the
// poster→video handoff at the browser/compositor level without that risk, so we
// just let it.
//
// The video element is only given a `src` after mount (not in the initial HTML)
// so it doesn't compete with the page's initial load, and is skipped entirely
// under the `md` breakpoint — mobile stays on the poster permanently to save
// data and sidestep mobile autoplay quirks.
//
// The JSX `muted` prop only sets the HTML attribute for the initial SSR paint —
// React doesn't reliably sync the DOM `.muted` *property* on hydration (a known
// React issue). Chrome tolerates the mismatch; Safari re-checks `.muted` at play
// time and blocks autoplay if it isn't set as a property. Setting it imperatively
// via a ref before calling `.play()` fixes that too. Safari can also reject the
// very first play() call outright (NotAllowedError) and then autoplay the muted
// video anyway a moment later via its own heuristics — that's expected, the
// .catch(() => {}) below is intentional, not an error to fix.
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    video.addEventListener("canplay", onCanPlay, { once: true });
    video.src = "/hero-video/hero-video.mp4";
    video.load();

    return () => video.removeEventListener("canplay", onCanPlay);
  }, []);

  return (
    <div className="relative h-[60vh] w-full overflow-hidden bg-brand-gray">
      {/* The poster is the LCP element (the video's own .mp4 is never in the
          initial HTML — see below). It's already discoverable via the
          <video poster> attribute, but Chrome fetches poster images at a low
          priority by default and there's no `fetchpriority` attribute for
          <video> itself — a <link rel="preload" fetchpriority="high"> is the
          only way to raise it. Next.js hoists any <link> rendered anywhere
          in the tree into <head>. */}
      <link rel="preload" as="image" href="/hero-video/hero-video-poster.webp" fetchPriority="high" />
      <video
        ref={videoRef}
        poster="/hero-video/hero-video-poster.webp"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
    </div>
  );
}
