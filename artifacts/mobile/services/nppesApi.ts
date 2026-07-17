import { Platform } from "react-native";

const THROTTLE_MS = 500;
let lastSearchTime = 0;

// ── Raw API shapes (NPPES response format) ──────────────────────────────────

interface RawTaxonomy {
  desc: string;
  primary: boolean;
  code?: string;
}

interface RawAddress {
  address_purpose: string;
  city: string;
  state: string;
  telephone_number?: string;
}

interface RawBasic {
  first_name?: string;
  last_name?: string;
  credential?: string;
  name?: string;
}

interface RawProvider {
  number: string;
  basic: RawBasic;
  taxonomies: RawTaxonomy[];
  addresses: RawAddress[];
}

interface RawResponse {
  result_count: number;
  results?: RawProvider[];
  Errors?: Array<{ description: string }>;
}

// ── Public types ────────────────────────────────────────────────────────────

export interface NPPESProvider {
  npi: string;
  fullName: string;
  credential: string;
  specialty: string;
  location: string;
  city: string;
  state: string;
  phone: string;
}

export interface NPPESSearchParams {
  firstName?: string;
  lastName?: string;
  npi?: string;
}

export interface NPPESSearchResult {
  providers: NPPESProvider[];
  count: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function extractSpecialty(taxonomies: RawTaxonomy[]): string {
  const primary = taxonomies.find((t) => t.primary);
  return primary?.desc ?? taxonomies[0]?.desc ?? "Healthcare Provider";
}

function extractLocation(addresses: RawAddress[]): {
  city: string;
  state: string;
  location: string;
  phone: string;
} {
  const loc =
    addresses.find((a) => a.address_purpose === "LOCATION") ?? addresses[0];
  if (!loc) return { city: "", state: "", location: "Location not listed", phone: "" };
  return {
    city: loc.city,
    state: loc.state,
    location: `${loc.city}, ${loc.state}`,
    phone: loc.telephone_number ?? "",
  };
}

function toProvider(raw: RawProvider): NPPESProvider {
  const { city, state, location, phone } = extractLocation(raw.addresses);
  const firstName = raw.basic.first_name ?? "";
  const lastName  = raw.basic.last_name ?? "";
  const credential = raw.basic.credential ?? "";
  const baseName  = raw.basic.name ?? `${firstName} ${lastName}`.trim();
  const fullName  = credential ? `${baseName}, ${credential}` : baseName;

  return {
    npi: raw.number,
    fullName,
    credential,
    specialty: extractSpecialty(raw.taxonomies),
    location,
    city,
    state,
    phone,
  };
}

// ── URL builder ─────────────────────────────────────────────────────────────
// Web preview: route through the backend proxy to avoid browser CORS restrictions.
// Native (iOS / Android APK): call NPPES directly — native apps have no CORS
// restrictions, and the Replit dev-domain proxy is unreachable from a real device.

const NPPES_DIRECT = "https://npiregistry.cms.hhs.gov/api/";

function buildSearchUrl(queryString: string): string {
  if (Platform.OS === "web") {
    // Relative URL — goes through the Replit shared proxy → backend → NPPES
    return `/api/providers/search?${queryString}`;
  }

  // Native: call NPPES registry directly (no proxy needed, no CORS on native)
  const params = new URLSearchParams(queryString);
  params.set("version", "2.1");
  return `${NPPES_DIRECT}?${params.toString()}`;
}

// ── Main export ─────────────────────────────────────────────────────────────

export async function searchNPPES(
  params: NPPESSearchParams
): Promise<NPPESSearchResult> {
  // 500 ms throttle
  const now = Date.now();
  const wait = THROTTLE_MS - (now - lastSearchTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastSearchTime = Date.now();

  const query = new URLSearchParams({ limit: "20" });
  if (params.npi)       query.set("number",     params.npi.trim());
  if (params.lastName)  query.set("last_name",  params.lastName.trim());
  if (params.firstName) query.set("first_name", params.firstName.trim());

  const url = buildSearchUrl(query.toString());

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        Accept:           "application/json",
        "Content-Type":   "application/json",
      },
    });
  } catch (err) {
    // Network-level failure (no internet, DNS, etc.)
    console.error("[nppesApi] Network error reaching proxy:", {
      url,
      message:   err instanceof Error ? err.message   : String(err),
      stack:     err instanceof Error ? err.stack      : null,
      platform:  Platform.OS,
      timestamp: new Date().toISOString(),
    });
    throw err;
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error("[nppesApi] Proxy returned non-OK status:", {
      status:    res.status,
      body,
      url,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Proxy error: HTTP ${res.status}`);
  }

  const data = (await res.json()) as RawResponse;

  if (data.Errors?.length) {
    console.error("[nppesApi] NPPES registry error:", data.Errors);
    throw new Error(data.Errors[0].description);
  }

  return {
    providers: (data.results ?? []).map(toProvider),
    count:     data.result_count,
  };
}
