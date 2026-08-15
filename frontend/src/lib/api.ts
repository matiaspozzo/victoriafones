const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type PropertySummary = {
  id: number;
  code: string;
  operation: "sale" | "rent" | "sale_and_rent";
  type: "house" | "apartment" | "land" | "chacra" | "commercial";
  neighborhood: { id: number; slug: string; name: string } | null;
  price_usd: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_area_m2: number | null;
  lot_area_m2: number | null;
  year_built: number | null;
  featured: boolean;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  lat: string | null;
  lng: string | null;
};

export type PropertyDetail = PropertySummary & {
  status: string;
  year_built: number | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  images: Array<{ thumb: string; card: string; full: string }>;
  hero_images: Array<{ thumb: string; card: string; full: string }>;
  amenities: Array<{ id: number; slug: string; icon: string | null; name: string }>;
  rental_prices: Array<{ label: string; price_usd: number }>;
};

type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
  price_bounds?: { min: number; max: number };
};

async function apiFetch<T>(path: string, locale: string, searchParams?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`/api${path}`, API_URL);
  url.searchParams.set("locale", locale);

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600, tags: ["properties"] } });

  if (!res.ok) {
    throw new Error(`API request failed: ${url.toString()} (${res.status})`);
  }

  return res.json();
}

export async function getProperties(locale: string, params?: Record<string, string | undefined>) {
  return apiFetch<Paginated<PropertySummary>>("/properties", locale, params);
}

export async function getProperty(locale: string, slug: string) {
  return apiFetch<{ data: PropertyDetail }>(`/properties/${slug}`, locale);
}

export type PageHeader = {
  hero_title: string;
  hero_subtitle: string;
  hero_image: { desktop: string | null; mobile: string | null };
  navbar_style: "white" | "blue";
  rental_disabled: boolean;
  rental_disabled_message: string;
};

export async function getPageHeader(locale: string, key: string): Promise<PageHeader | null> {
  try {
    const pages = await apiFetch<Record<string, PageHeader>>("/pages", locale);
    return pages[key] ?? null;
  } catch {
    return null;
  }
}

export type HomeZoneCard = { label: string; link: string; image: string | null };

export type HomeContent = {
  about_title: string;
  about_body: string;
  zones_title: string;
  seo_title: string;
  seo_description: string;
  cards: HomeZoneCard[];
};

export async function getHomeContent(locale: string): Promise<HomeContent | null> {
  try {
    return await apiFetch<HomeContent>("/home", locale);
  } catch {
    return null;
  }
}

export type SiteSettings = {
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
  additional_scripts: string | null;
};

export async function getSiteSettings(locale: string): Promise<SiteSettings | null> {
  try {
    return await apiFetch<SiteSettings>("/site-settings", locale);
  } catch {
    return null;
  }
}

export type Neighborhood = {
  id: number;
  parent_id: number | null;
  slug: string;
  name: string;
  description: string | null;
  hero_image: { desktop: string | null; mobile: string | null };
  navbar_style: "white" | "blue";
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  // Absent entirely (not []) past the API's 2-level eager-load depth — leaf
  // nodes have no "children" key at all in the JSON.
  children?: Neighborhood[];
};

export async function getNeighborhoods(locale: string) {
  return apiFetch<{ data: Neighborhood[] }>("/neighborhoods", locale);
}

/** Depth-first lookup by slug through the neighborhood tree returned by getNeighborhoods. */
export function findNeighborhoodBySlug(tree: Neighborhood[], slug: string): Neighborhood | null {
  for (const node of tree) {
    if (node.slug === slug) return node;

    const match = findNeighborhoodBySlug(node.children ?? [], slug);
    if (match) return match;
  }

  return null;
}
