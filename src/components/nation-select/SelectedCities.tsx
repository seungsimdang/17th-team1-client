import type { City } from "@/types/city";
import { Chip } from "@/components/common/chip";

interface SelectedCitiesProps {
  selectedCities: City[];
  onRemoveCity: (cityId: string) => void;
}

export const SelectedCities = ({
  selectedCities,
  onRemoveCity,
}: SelectedCitiesProps) => {
  if (selectedCities.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-text-thirdly text-xs mb-3 font-bold">
        {selectedCities.length}개 도시 방문
      </p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {selectedCities.map(({ id, flag, name, country }) => (
          <Chip
            key={id}
            variant="gray"
            size="md"
            removable
            onRemove={() => onRemoveCity(id)}
            className="flex-shrink-0"
          >
            {flag} {name}, {country}
          </Chip>
        ))}
      </div>
    </div>
  );
};
