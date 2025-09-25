import { City } from "@/types/city";
import { CityItem } from "./CityItem";

interface PopularCitiesListProps {
  cities: City[];
  selectedCityIds: Set<string>;
  onAddCity: (city: City) => void;
  onRemoveCity: (cityId: string) => void;
  isLoading?: boolean;
}

export const PopularCitiesList = ({
  cities,
  selectedCityIds,
  onAddCity,
  onRemoveCity,
  isLoading = false,
}: PopularCitiesListProps) => {
  const selectedCities = cities.filter((city) => selectedCityIds.has(city.id));
  const availableCities = cities.filter(
    (city) => !selectedCityIds.has(city.id)
  );

  return (
    <div className="space-y-0">
      {/* Selected Cities */}
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

      {/* Available Cities */}
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

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="text-text-thirdly text-sm">도시를 불러오는 중...</div>
        </div>
      )}
    </div>
  );
};
