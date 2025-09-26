"use client";

import { City } from "@/types/city";
import { CityItem } from "./CityItem";

interface PopularCitiesListProps {
  cities: City[];
  selectedCityIds: Set<string>;
  onAddCity: (city: City) => void;
  onRemoveCity: (cityId: string) => void;
  isLoading?: boolean;
  isSearching?: boolean;
  hasSearched?: boolean;
}

export const PopularCitiesList = ({
  cities,
  selectedCityIds,
  onAddCity,
  onRemoveCity,
  isLoading = false,
  isSearching = false,
  hasSearched = false,
}: PopularCitiesListProps) => {
  const selectedCities = cities.filter((city) => selectedCityIds.has(city.id));
  const availableCities = cities.filter(
    (city) => !selectedCityIds.has(city.id)
  );

  if (cities.length === 0 && !isLoading && !isSearching && hasSearched) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-text-thirdly text-sm">검색 결과가 없습니다</div>
      </div>
    );
  }

  if (cities.length === 0 && (isSearching || !hasSearched)) {
    return null;
  }

  return (
    <div className="space-y-0">
      {selectedCities.map((city, index) => (
        <CityItem
          key={city.id}
          city={city}
          isSelected={true}
          onAdd={onAddCity}
          onRemove={onRemoveCity}
          showDivider={
            index < selectedCities.length - 1 || availableCities.length > 0
          }
        />
      ))}

      {availableCities.map((city, index) => (
        <CityItem
          key={city.id}
          city={city}
          isSelected={false}
          onAdd={onAddCity}
          onRemove={onRemoveCity}
          showDivider={index < availableCities.length - 1}
        />
      ))}
    </div>
  );
};
