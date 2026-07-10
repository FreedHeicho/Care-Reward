const BASE_URL = "https://npiregistry.cms.hhs.gov/api/";
const THROTTLE_MS = 500;
const REQUEST_LIMIT = 20;

let lastSearchTime = 0;

// ── Raw API shapes ──────────────────────────────────────────────────────────

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
  const lastName = raw.basic.last_name ?? "";
  const credential = raw.basic.credential ?? "";
  const baseName = raw.basic.name ?? `${firstName} ${lastName}`.trim();
  const fullName = credential ? `${baseName}, ${credential}` : baseName;

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

// ── Main export ─────────────────────────────────────────────────────────────

export async function searchNPPES(
  params: NPPESSearchParams
): Promise<NPPESSearchResult> {
  const now = Date.now();
  const wait = THROTTLE_MS - (now - lastSearchTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastSearchTime = Date.now();

  const query = new URLSearchParams({
    version: "2.1",
    limit: String(REQUEST_LIMIT),
  });

  if (params.npi)       query.set("number",     params.npi.trim());
  if (params.lastName)  query.set("last_name",  params.lastName.trim());
  if (params.firstName) query.set("first_name", params.firstName.trim());

  const res = await fetch(`${BASE_URL}?${query.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: RawResponse = await res.json();

  if (data.Errors?.length) throw new Error(data.Errors[0].description);

  return {
    providers: (data.results ?? []).map(toProvider),
    count: data.result_count,
  };
}
