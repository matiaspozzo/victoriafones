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
  es: { house: "Casa", apartment: "Apartamento", land: "Terreno", chacra: "Chacra", commercial: "Comercial" },
  en: { house: "House", apartment: "Apartment", land: "Land", chacra: "Farm", commercial: "Commercial" },
  pt: { house: "Casa", apartment: "Apartamento", land: "Terreno", chacra: "Chácara", commercial: "Comercial" },
};
