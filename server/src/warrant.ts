import WarrantClient from "@warrantdev/warrant-node";

const { WARRANT_API_KEY, WARRANT_URL } = process.env;
if (!WARRANT_API_KEY) {
  throw new Error("WARRANT_API_KEY is required");
}
if (!WARRANT_URL) {
  throw new Error("WARRANT_URL is required");
}

export const warrant = new WarrantClient.WarrantClient({
  apiKey: WARRANT_API_KEY,
  endpoint: WARRANT_URL,
});
