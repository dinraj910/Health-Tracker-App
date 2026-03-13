import axios from 'axios';
import https from 'https';

/**
 * OpenFDA Drug Label API Service
 *
 * Provides search and detail lookup for FDA-approved drugs.
 * Endpoint: https://api.fda.gov/drug/label.json
 * No API key required (free tier: 40 requests/min, 1000/day)
 */

const BASE_URL = "https://api.fda.gov/drug/label.json";

// Force IPv4 to prevent Node.js ETIMEDOUT errors on systems with broken IPv6
const httpsAgent = new https.Agent({ family: 4 });

/**
 * Search drugs by name (brand or generic)
 * @param {string} query - Search term
 * @param {number} limit - Max results (default 20)
 * @param {number} skip - Offset for pagination
 * @returns {Promise<{results: Array, total: number}>}
 */
export async function searchDrugs(query, limit = 20, skip = 0) {
  if (!query || query.trim().length < 2) {
    return { results: [], total: 0 };
  }

  const searchTerm = encodeURIComponent(query.trim());

  // Search in brand_name and generic_name fields
  const searchQuery = `(openfda.brand_name:"${searchTerm}"+openfda.generic_name:"${searchTerm}")`;
  const url = `${BASE_URL}?search=${encodeURIComponent(searchQuery)}&limit=${limit}&skip=${skip}`;

  try {
    const response = await axios.get(url, { httpsAgent });
    const data = response.data;

    const results = (data.results || []).map((drug) => parseDrugLabel(drug));

    return {
      results,
      total: data.meta?.results?.total || results.length,
    };
  } catch (error) {
    // If the structured search fails (e.g. 404 because of complex query), try simple search
    if (error.response?.status === 404) {
      try {
        const simpleUrl = `${BASE_URL}?search=${searchTerm}&limit=${limit}&skip=${skip}`;
        const response2 = await axios.get(simpleUrl, { httpsAgent });
        const data2 = response2.data;
        const results = (data2.results || []).map((drug) => parseDrugLabel(drug));

        return {
          results,
          total: data2.meta?.results?.total || results.length,
        };
      } catch (err2) {
        if (err2.response?.status === 404) return { results: [], total: 0 };
        throw err2;
      }
    }
    throw error;
  }
}

/**
 * Get drug details by application number or set_id
 * @param {string} id - OpenFDA application number or set_id
 * @returns {Promise<Object|null>}
 */
export async function getDrugById(id) {
  // Try by set_id first, then by application_number
  const searches = [
    `set_id:"${id}"`,
    `openfda.application_number:"${id}"`,
    `id:"${id}"`,
  ];

  for (const search of searches) {
    try {
      const url = `${BASE_URL}?search=${encodeURIComponent(search)}&limit=1`;
      const response = await axios.get(url, { httpsAgent });

      if (response.data?.results && response.data.results.length > 0) {
        return parseDrugLabel(response.data.results[0], true);
      }
    } catch (error) {
      // Ignore 404s and try the next ID match
      if (error.response?.status === 404) continue;
      console.error("OpenFDA ID search error:", error.message);
    }
  }

  return null;
}

/**
 * Get drugs by category/purpose
 * @param {string} purpose - e.g. "pain relief", "antibiotic"
 * @param {number} limit
 * @returns {Promise<{results: Array, total: number}>}
 */
export async function getDrugsByCategory(purpose, limit = 20) {
  const searchTerm = encodeURIComponent(purpose.trim());
  const url = `${BASE_URL}?search=${encodeURIComponent(`purpose:"${searchTerm}"`)}&limit=${limit}`;

  try {
    const response = await axios.get(url, { httpsAgent });
    const data = response.data;
    
    const results = (data.results || []).map((drug) => parseDrugLabel(drug));

    return {
      results,
      total: data.meta?.results?.total || results.length,
    };
  } catch (error) {
    if (error.response?.status === 404) return { results: [], total: 0 };
    console.error("OpenFDA category search error:", error.message);
    return { results: [], total: 0 };
  }
}

/**
 * Parse raw OpenFDA drug label into a clean object
 */
function parseDrugLabel(drug, detailed = false) {
  const openfda = drug.openfda || {};

  const result = {
    id: drug.set_id || drug.id || openfda.application_number?.[0] || "",
    brandName: openfda.brand_name?.[0] || extractFirst(drug.openfda_brand_name) || "Unknown",
    genericName: openfda.generic_name?.[0] || extractFirst(drug.openfda_generic_name) || "",
    manufacturer: openfda.manufacturer_name?.[0] || "",
    productType: openfda.product_type?.[0] || "",
    route: openfda.route || [],
    substanceName: openfda.substance_name || [],
    rxcui: openfda.rxcui || [],

    // Key sections
    purpose: cleanArray(drug.purpose),
    indications: cleanArray(drug.indications_and_usage),
    dosage: cleanArray(drug.dosage_and_administration),
    warnings: cleanArray(drug.warnings),
    activeIngredient: cleanArray(drug.active_ingredient),
    inactiveIngredient: cleanArray(drug.inactive_ingredient),
    dosageForm: openfda.dosage_form || [],

    // Additional info
    categories: openfda.pharm_class_epc || [],  // Pharmacologic class
    mechanism: openfda.pharm_class_moa || [],   // Mechanism of action
  };

  // Add extra detail fields only when requested
  if (detailed) {
    result.adverseReactions = cleanArray(drug.adverse_reactions);
    result.drugInteractions = cleanArray(drug.drug_interactions);
    result.contraindications = cleanArray(drug.contraindications);
    result.precautions = cleanArray(drug.precautions);
    result.pregnancy = cleanArray(drug.pregnancy);
    result.pediatricUse = cleanArray(drug.pediatric_use);
    result.geriatricUse = cleanArray(drug.geriatric_use);
    result.overdosage = cleanArray(drug.overdosage);
    result.storage = cleanArray(drug.storage_and_handling);
    result.howSupplied = cleanArray(drug.how_supplied);
    result.description = cleanArray(drug.description);
    result.clinicalPharmacology = cleanArray(drug.clinical_pharmacology);
  }

  return result;
}

function cleanArray(arr) {
  if (!arr) return [];
  if (typeof arr === "string") return [arr];
  return arr.filter(Boolean).map((s) => (typeof s === "string" ? s.trim() : String(s)));
}

function extractFirst(val) {
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
}

export default { searchDrugs, getDrugById, getDrugsByCategory };
