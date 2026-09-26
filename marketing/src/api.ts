export interface PublicStats {
  listings: {
    available: number;
    residential: number;
    commercial: number;
    total: number;
  };
  users: {
    tenants: number;
    landlords: number;
    total: number;
    newThisWeek: number;
  };
  updatedAt: string;
}

export interface PublicListingMedia {
  type: "image" | "video";
  url: string;
  thumbUrl?: string;
}

export interface PublicListing {
  houseId: string;
  type: string;
  propertyCategory: string;
  rent: number;
  location: string;
  media: PublicListingMedia[];
}

export interface PublicListingsResponse {
  listings: PublicListing[];
  updatedAt: string;
}

function apiBase(): string {
  const built = import.meta.env.VITE_API_URL as string | undefined;
  return (built ?? "").replace(/\/$/, "");
}

function publicUrl(path: string): string {
  const base = apiBase();
  return base ? `${base}${path}` : path;
}

export async function fetchPublicStats(): Promise<PublicStats> {
  const res = await fetch(publicUrl("/api/public/stats"));
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json() as Promise<PublicStats>;
}

export async function fetchPublicListings(): Promise<PublicListingsResponse> {
  const res = await fetch(publicUrl("/api/public/listings"));
  if (!res.ok) throw new Error("Failed to load listings");
  return res.json() as Promise<PublicListingsResponse>;
}

/** Resolve API-relative media paths when VITE_API_URL is set in production. */
export function mediaSrc(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return publicUrl(url);
}

export function mediaThumb(item: PublicListingMedia): string {
  return mediaSrc(item.thumbUrl || item.url);
}

export function formatCount(n: number): string {
  return n.toLocaleString("fr-CD");
}

export function formatRent(amount: number, _lang?: "en"): string {
  return `${amount.toLocaleString("fr-CD")} CDF`;
}

export function propertyLabel(type: string, _lang?: "en"): string {
  const labels: Record<string, string> = {
    room: "Chambre",
    single_room: "Chambre",
    double_room: "Chambre",
    bedsitter: "Studio",
    studio: "Studio",
    one_bedroom: "2 pièces",
    two_bedroom: "3 pièces",
    three_bedroom_plus: "4 pièces",
    appartement: "Appartement",
    maisonette: "Duplex",
    bungalow: "Villa",
    parcelle: "Parcelle",
    servant_quarter: "Boyerie",
    apartment: "Appartement",
    shop: "Boutique",
    office: "Bureau",
    warehouse: "Hangar",
  };
  return labels[type] ?? type.replace(/_/g, " ");
}
