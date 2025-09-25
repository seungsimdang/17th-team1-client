"use client";

import { useState, useEffect } from "react";
import { City } from "@/types/city";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { NationSelectHeader } from "./NationSelectHeader";
import { PopularCitiesList } from "./PopularCitiesList";
import { NationSelectFooter } from "./NationSelectFooter";

interface NationSelectClientProps {
  initialCities: City[];
}

export const NationSelectClient = ({
  initialCities,
}: NationSelectClientProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCityList, setSelectedCityList] = useState<City[]>([]);

  // 무한 스크롤 훅 사용
  const {
    cities: allCities,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useInfiniteScroll({
    initialData: initialCities,
    limit: 20,
  });

  // 검색 필터링
  const filteredCities = allCities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      city.country.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedCityIds = new Set(selectedCityList.map((city) => city.id));

  const handleAddCity = (city: City) => {
    const isAlreadySelected = selectedCityIds.has(city.id);
    if (isAlreadySelected) return;

    const newCity = { ...city, selected: true };
    setSelectedCityList((prev) => [...prev, newCity]);
  };

  const handleRemoveCity = (cityId: string) => {
    setSelectedCityList((prev) => prev.filter((city) => city.id !== cityId));
  };

  const handleCreateGlobe = () => {
    // TODO: 지구본 생성 로직 구현
    console.log("Selected cities:", selectedCityList);
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="pb-40">
          <NationSelectHeader
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />

          {/* Popular Cities Section */}
          <div>
            <h2 className="text-text-primary text-lg font-bold mb-4">
              인기 여행지
            </h2>

            {error && (
              <div className="text-red-500 text-center py-4">
                도시를 불러오는 중 오류가 발생했습니다: {error}
              </div>
            )}

            <PopularCitiesList
              cities={filteredCities}
              selectedCityIds={selectedCityIds}
              onAddCity={handleAddCity}
              onRemoveCity={handleRemoveCity}
              isLoading={isLoading}
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
