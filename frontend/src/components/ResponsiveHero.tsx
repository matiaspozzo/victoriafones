import Image from "next/image";

/**
 * Full-bleed page-top hero photo. Renders two crops — the backend generates a
 * landscape "desktop" conversion (1920x1080) and a near-portrait "mobile" one
 * (828x1104), since a 60vh-tall section is landscape on wide screens but much
 * closer to portrait on narrow ones; downscaling one crop for both loses too
 * much of the subject on the other breakpoint.
 */
export default function ResponsiveHero({
  desktop,
  mobile,
  className = "h-[60vh]",
}: {
  desktop: string;
  mobile: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Image src={mobile} alt="" fill priority className="object-cover md:hidden" sizes="100vw" />
      <Image src={desktop} alt="" fill priority className="hidden object-cover md:block" sizes="100vw" />
    </div>
  );
}
