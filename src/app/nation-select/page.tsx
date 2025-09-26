import { fetchCities } from "@/services/cityService";
import { NationSelectClient } from "@/components/nation-select/NationSelectClient";

export const dynamic = "force-dynamic";

export default async function NationSelectPage() {
  try {
    const initialCities = await fetchCities({ limit: 20 });
    return <NationSelectClient initialCities={initialCities} />;
  } catch (error) {
    console.error("Failed to fetch initial cities:", error);
    return <NationSelectClient initialCities={[]} />;
  }
}
