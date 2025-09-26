import type {
  CityApiResponse,
  CityApiParams,
  City,
  CitySearchResponse,
} from "@/types/city";
import { transformApiDataToCity } from "@/utils/countryFlagMapping";
import { apiGet } from "@/lib/apiClient";

export const fetchCities = async (
  params: CityApiParams = {}
): Promise<City[]> => {
  try {
    const data = await apiGet<CityApiResponse>("/cities/favorites", params);
    return data.cityResponseList.map(transformApiDataToCity);
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    throw error;
  }
};

export const searchCities = async (keyword: string): Promise<City[]> => {
  try {
    const data = await apiGet<CitySearchResponse>("/cities", { keyword });
    return data.cities.map(transformApiDataToCity);
  } catch (error) {
    console.error("Failed to search cities:", error);
    throw error;
  }
};
