import Anthropic from "@anthropic-ai/sdk";
import { env, isClaudeConfigured } from "../config/env.js";
import { congoProvinceIdsForPrompt } from "../constants/property-taxonomy.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface ParsedListing {
  property_category: "residential" | "commercial";
  property_subtype: string;
  rent: number;
  months_upfront: number;
  region?: string;
  town?: string;
  neighbourhood?: string;
  city?: string;
  fenced: boolean;
  water: boolean;
  borehole: boolean;
  parking: boolean;
  electricity_meter: "none" | "prepaid" | "postpaid";
  furnished: boolean;
  security: boolean;
  standby_generator: boolean;
  description: string;
}

export interface ParsedSearch {
  property_category?: "residential" | "commercial";
  property_subtype?: string;
  max_rent?: number;
  region?: string;
  town?: string;
  neighbourhood?: string;
  city?: string;
  water?: boolean;
  parking?: boolean;
  electricity_meter?: "none" | "prepaid" | "postpaid";
  furnished?: boolean;
  fenced?: boolean;
  borehole?: boolean;
  standby_generator?: boolean;
  raw_query: string;
}

export async function parseListingFromText(
  text: string,
  language: "en"
): Promise<ParsedListing | null> {
  if (!isClaudeConfigured) return null;

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Extract a DRC rental listing from this landlord message. Language: ${language}.
Return ONLY valid JSON with keys:
- property_category: "residential" or "commercial"
- property_subtype: one of single_room (chambre), studio, one_bedroom (2 pièces), two_bedroom (3 pièces), three_bedroom_plus (4 pièces), appartement, bungalow (villa), parcelle, servant_quarter (boyerie), maisonette (duplex); old ids double_room and bedsitter still valid. Commercial: shop, office, warehouse (hangar), restaurant, salon, workshop, showroom, commercial_space
- rent (number CDF/month), months_upfront (number)
- region (identifiant de province RDC — one of: ${congoProvinceIdsForPrompt()}; ex. kinshasa, haut_katanga, nord_kivu)
- town, neighbourhood (quarter)
- fenced (clôturé), water, borehole (forage / citerne), parking, electricity_meter (none|prepaid/token|postpaid SNEL), furnished, security (gardien), standby_generator/groupe électrogène (booleans except electricity_meter)
- description (professional paragraph)

Message: "${text}"`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return null;

  try {
    const json = block.text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(json) as ParsedListing;
  } catch {
    return null;
  }
}

export async function parseSearchFromText(
  text: string,
  language: "en"
): Promise<ParsedSearch> {
  if (!isClaudeConfigured) {
    return { raw_query: text };
  }

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Extract rental search filters from this tenant message en RDC. Language: ${language}.
Return ONLY valid JSON with optional keys: property_category (residential|commercial), property_subtype, max_rent, region, town, neighbourhood, city, water, parking, electricity_meter (none|prepaid|postpaid), furnished, fenced, borehole, standby_generator, raw_query.

region must be a identifiant de province RDC when present (one of: ${congoProvinceIdsForPrompt()}; ex. kinshasa, haut_katanga).
Residential subtypes: single_room (chambre), studio, one_bedroom (2 pièces), two_bedroom (3 pièces), three_bedroom_plus (4 pièces), appartement, bungalow (villa), parcelle, servant_quarter (boyerie), maisonette (duplex). Map Congolese words to these ids. Old ids bedsitter/double_room still valid.
Commercial subtypes: shop, office, warehouse, restaurant, salon, workshop, showroom, commercial_space.

Message: "${text}"`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return { raw_query: text };

  try {
    const json = block.text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(json) as ParsedSearch;
  } catch {
    return { raw_query: text };
  }
}

export async function compareHouses(
  houses: Array<{ house_id: string; type: string; rent: number; distance_km?: number; facilities: string }>,
  lang: "en"
): Promise<string> {
  if (!isClaudeConfigured) {
    return houses
      .map((h) => `*${h.house_id}*: ${h.rent.toLocaleString()} CDF — ${h.facilities}`)
      .join("\n");
  }

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Compare these DRC rental listings for a tenant. Language: ${lang}.
Include price fairness, facilities, and a recommendation. Be concise for WhatsApp.

Listings: ${JSON.stringify(houses)}`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "Comparaison indisponible.";
}

export async function suggestPriceAdjustment(
  house: { house_id: string; rent: number; neighbourhood: string | null; type: string },
  areaAvgRent: number,
  lang: "en"
): Promise<string> {
  if (!isClaudeConfigured) {
    const diff = house.rent - areaAvgRent;
    if (diff > 0) {
      return `Votre loyer est ${diff.toLocaleString("fr-CD")} CDF au-dessus de la moyenne du quartier. Envisagez de baisser.`;
    }
    return "Votre prix est compétitif.";
  }

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `A landlord's listing ${house.house_id} in ${house.neighbourhood ?? "RDC"} has had no unlocks in 2 weeks.
Rent: ${house.rent} CDF. Area average: ${areaAvgRent} CDF. Type: ${house.type}.
Suggest a price adjustment in ${lang}. Be specific with CDF amounts. Keep under 150 words.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

export async function generateRentalAgreement(
  house: {
    house_id: string;
    type: string;
    rent: number;
    months_upfront: number;
    neighbourhood: string | null;
    landlord_phone: string;
  },
  tenantPhone: string,
  lang: "en"
): Promise<string> {
  if (!isClaudeConfigured) {
    return `CONTRAT DE BAIL — ${house.house_id}\nPropriétaire : ${house.landlord_phone}\nLocataire : ${tenantPhone}\nLoyer : ${house.rent} CDF/mois\nCaution : ${house.months_upfront} mois`;
  }

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Generate a simple rental agreement template for the DRC (French).
Language: ${lang}. Property: ${house.type} in ${house.neighbourhood ?? "RDC"}.
Rent: ${house.rent} CDF/month. Deposit: ${house.months_upfront} months upfront.
Landlord phone: ${house.landlord_phone}. Tenant phone: ${tenantPhone}.
Include standard Congolese rental clauses (droit OHADA / bail). Format for WhatsApp.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "Impossible de générer le contrat.";
}

export async function transcribeVoiceNote(
  audioDescription: string,
  lang: "en"
): Promise<string | null> {
  if (!isClaudeConfigured) return null;

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `A WhatsApp user sent a voice note about housing en RDC (${lang}).
The system could not auto-transcribe audio yet. If this is a placeholder, return null.
Otherwise process this text as if it were transcribed speech about finding or listing a home:
"${audioDescription}"`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : null;
}
