import Image from "next/image";

/**
 * Static hero banner used on every non-homepage page (the homepage uses the
 * looping video instead). Capped at 400px tall with the page title overlaid,
 * mirroring the live site's per-page hero images.
 */
export default function PageHero({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative max-h-[400px] w-full overflow-hidden">
      <div className="relative h-[400px] w-full">
        <Image src={image} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/85 via-brand-primary/40 to-brand-primary/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <h1 className="max-w-2xl font-heading text-3xl font-medium leading-tight text-white sm:text-4xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-2 max-w-2xl text-white/85">{subtitle}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
