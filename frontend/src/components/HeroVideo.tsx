// Background video from the live site's Elementor hero section
// (background_video_link: youtube.com/watch?v=3h3KXkEyxts).
const YOUTUBE_ID = "3h3KXkEyxts";

export default function HeroVideo() {
  return (
    <div className="relative aspect-[16/9] max-h-[560px] w-full overflow-hidden bg-brand-gray sm:aspect-[21/9]">
      <iframe
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
        src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_ID}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3`}
        title="Victoria Fones Real Estate"
        allow="autoplay; encrypted-media"
        aria-hidden="true"
      />
    </div>
  );
}
