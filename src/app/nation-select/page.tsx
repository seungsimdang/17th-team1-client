import { fetchCities } from "@/services/cityService";
import { NationSelectClient } from "@/components/nation-select/NationSelectClient";

export default async function NationSelectPage() {
  const initialCities = await fetchCities({ limit: 20 });
  return <NationSelectClient initialCities={initialCities} />;
}
