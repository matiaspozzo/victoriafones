/** Plain-text summary from RichEditor HTML (property.description) — for
    contexts that can't render markup, like a JSON-LD "description" field. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function priceOnRequestLabel(locale: string): string {
  return locale === "en" ? "Price on request" : locale === "pt" ? "Consultar preço" : "Consultar";
}

export function formatUsd(price: number | null, locale: string): string {
  if (price === null) {
    return priceOnRequestLabel(locale);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(price: number | null, locale: string): string {
  if (price === null) {
    return priceOnRequestLabel(locale);
  }

  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price);
}

export const OPERATION_LABELS: Record<string, Record<string, string>> = {
  es: { sale: "Venta", rent: "Alquiler", sale_and_rent: "Venta y Alquiler" },
  en: { sale: "Sale", rent: "Rent", sale_and_rent: "Sale & Rent" },
  pt: { sale: "Venda", rent: "Aluguel", sale_and_rent: "Venda e Aluguel" },
};

export const TYPE_LABELS: Record<string, Record<string, string>> = {
  es: { house: "Casa", apartment: "Departamento", land: "Terreno", chacra: "Chacra", commercial: "Comercial" },
  en: { house: "House", apartment: "Apartment", land: "Land", chacra: "Farm", commercial: "Commercial" },
  pt: { house: "Casa", apartment: "Apartamento", land: "Terreno", chacra: "Chácara", commercial: "Comercial" },
};

export const BEDROOMS_LABEL: Record<string, string> = { es: "dormitorios", en: "bedrooms", pt: "quartos" };
export const BATHROOMS_LABEL: Record<string, string> = { es: "baños", en: "bathrooms", pt: "banheiros" };

const OPERATION_PHRASE: Record<string, Record<string, string>> = {
  es: { sale: "en venta", rent: "en alquiler", sale_and_rent: "en venta y alquiler" },
  en: { sale: "for sale", rent: "for rent", sale_and_rent: "for sale and rent" },
  pt: { sale: "à venda", rent: "para alugar", sale_and_rent: "à venda e para alugar" },
};

const LOCATION_CONNECTOR: Record<string, string> = { es: "en", en: "in", pt: "em" };

/**
 * Auto-generated meta description for a property, used only when there's no
 * manually-written seo_description/excerpt for it (most listings today —
 * see the May SEO audit: 0/100 published properties had either set).
 * e.g. "Casa en venta en Laguna Escondida, José Ignacio. 4 dormitorios, 5
 * baños, 500 m². $3,200,000."
 */
export function propertyMetaDescription(
  property: {
    type: string;
    operation: string;
    neighborhood: { slug: string; name: string } | null;
    bedrooms: number | null;
    bathrooms: number | null;
    built_area_m2: number | null;
    lot_area_m2: number | null;
    price_usd: number | null;
  },
  locale: string,
): string {
  const typeLabel = TYPE_LABELS[locale]?.[property.type] ?? property.type;
  const operationPhrase = OPERATION_PHRASE[locale]?.[property.operation] ?? "";
  const connector = LOCATION_CONNECTOR[locale] ?? LOCATION_CONNECTOR.es;
  // "Otras Zonas" is a sibling of José Ignacio under Punta del Este, not a
  // sub-zone of it (see the neighborhood tree in CLAUDE.md) — appending
  // "José Ignacio" to it would misdescribe the property's actual location.
  const region = property.neighborhood?.slug === "otras-zonas" ? "Punta del Este" : "José Ignacio";
  const location = property.neighborhood ? `${connector} ${property.neighborhood.name}, ${region}` : region;
  const area = property.built_area_m2 ?? property.lot_area_m2;

  const stats = [
    property.bedrooms ? `${property.bedrooms} ${BEDROOMS_LABEL[locale] ?? BEDROOMS_LABEL.es}` : null,
    property.bathrooms ? `${property.bathrooms} ${BATHROOMS_LABEL[locale] ?? BATHROOMS_LABEL.es}` : null,
    area ? `${area} m²` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const price = formatUsd(property.price_usd, locale);

  return [`${typeLabel} ${operationPhrase} ${location}.`, stats ? `${stats}.` : null, `${price}.`]
    .filter(Boolean)
    .join(" ");
}
