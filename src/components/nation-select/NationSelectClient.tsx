"use client";

import { useState } from "react";
import { City } from "@/types/city";
import { useCitySearch } from "@/hooks/useCitySearch";
import { NationSelectHeader } from "./NationSelectHeader";
import { PopularCitiesList } from "./PopularCitiesList";
import { NationSelectFooter } from "./NationSelectFooter";

interface NationSelectClientProps {
  initialCities: City[];
}

export const NationSelectClient = ({
  initialCities,
}: NationSelectClientProps) => {
  const [selectedCityList, setSelectedCityList] = useState<City[]>([]);

  const {
    searchResults,
    isSearching,
    searchError,
    searchKeyword,
    setSearchKeyword,
    clearSearch,
    hasSearched,
  } = useCitySearch();

  const isSearchingMode = searchKeyword.trim().length > 0;
  const displayCities = isSearchingMode ? searchResults : initialCities;
  const displayError = isSearchingMode ? searchError : null;
  const displayLoading = isSearchingMode ? isSearching : false;

  const selectedCityIds = new Set(selectedCityList.map((city) => city.id));

  const handleAddCity = (city: City) => {
    if (selectedCityIds.has(city.id)) return;
    setSelectedCityList((prev) => [...prev, { ...city, selected: true }]);
  };

  const handleRemoveCity = (cityId: string) => {
    setSelectedCityList((prev) => prev.filter((city) => city.id !== cityId));
  };

  const handleCreateGlobe = () => {
    console.log("Selected cities:", selectedCityList);
  };

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    if (value.trim().length === 0) {
      clearSearch();
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />

      <div className="flex-1 overflow-y-auto px-4">
        <div className="">
          <NationSelectHeader
            searchValue={searchKeyword}
            onSearchChange={handleSearchChange}
          />

          <div>
            <h2 className="text-text-primary text-lg font-bold mb-4">
              {isSearchingMode ? `"${searchKeyword}" 검색 결과` : "인기 여행지"}
            </h2>

            {displayError && (
              <div
                className="text-red-500 text-center py-4"
                role="alert"
                aria-live="polite"
              >
                {isSearchingMode
                  ? "검색 중 오류가 발생했습니다"
                  : "도시를 불러오는 중 오류가 발생했습니다"}
                <div className="mt-1 text-xs text-text-thirdly break-words">
                  {typeof displayError === "string"
                    ? displayError
                    : String(displayError)}
                </div>
              </div>
            )}

            <PopularCitiesList
              cities={displayCities}
              selectedCityIds={selectedCityIds}
              onAddCity={handleAddCity}
              onRemoveCity={handleRemoveCity}
              isLoading={displayLoading}
              isSearching={isSearchingMode && isSearching}
              hasSearched={isSearchingMode && hasSearched}
            />
          </div>
        </div>
      </div>

      <NationSelectFooter
        selectedCities={selectedCityList}
        onRemoveCity={handleRemoveCity}
        onCreateGlobe={handleCreateGlobe}
      />
    </div>
  );
};
