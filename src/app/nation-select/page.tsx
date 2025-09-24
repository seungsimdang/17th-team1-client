"use client";

import { useState } from "react";
import { CloseIcon, PlusIcon } from "@/assets/icons";
import { Button } from "@/components/common/button";
import { Chip } from "@/components/common/chip";
import { SearchInput } from "@/components/common/input";

// 도시 데이터 타입 (더미 데이터)
type City = {
  id: string;
  name: string;
  country: string;
  flag: string;
  selected?: boolean;
};

// 인기 여행지 (더미 데이터)
const popularCities: City[] = [
  { id: "1", name: "도쿄", country: "일본", flag: "🇯🇵" },
  { id: "2", name: "오사카", country: "일본", flag: "🇯🇵" },
  { id: "3", name: "상하이", country: "중국", flag: "🇨🇳" },
  { id: "4", name: "베이징", country: "중국", flag: "🇨🇳" },
  { id: "5", name: "방콕", country: "태국", flag: "🇹🇭" },
  { id: "6", name: "싱가포르", country: "싱가포르", flag: "🇸🇬" },
  { id: "7", name: "런던", country: "영국", flag: "🇬🇧" },
];

const selectedCities: City[] = [
  { id: "8", name: "로마", country: "이탈리아", flag: "🇮🇹", selected: true },
  { id: "9", name: "파리", country: "프랑스", flag: "🇫🇷", selected: true },
];

const NationSelectPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCityList, setSelectedCityList] = useState<City[]>(selectedCities);
  const isButtonEnabled = selectedCityList.length > 0;

  const notSelectedPopularCities = popularCities.filter(city => !selectedCityList.some(({ id }) => id === city.id));
  const hasAvailablePopularCities = notSelectedPopularCities.length > 0;

  const handleAddCity = (city: City) => {
    const isAlreadySelected = selectedCityList.some((({ id }) => id === city.id));
    if (isAlreadySelected) return;

    const newCity = { ...city, selected: true };
    setSelectedCityList((prev) => [...prev, newCity]);
  };

  const handleRemoveCity = (cityId: string) => {
    setSelectedCityList((prev) => {
      const filtered = prev.filter((({ id }) => id !== cityId));
      return filtered;
    });
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 pt-4 pb-3" />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="pb-40">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-text-primary text-2xl font-bold leading-[31px] mb-10">
              그동안 여행했던 도시들을
              <br />
              선택해보세요.
            </h1>

            <SearchInput
              placeholder="도시/나라를 검색해주세요."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Popular Cities Section */}
          <div>
            <h2 className="text-text-primary text-lg font-bold mb-4">인기 여행지</h2>

            <div className="space-y-0">
              {/* Selected Cities */}
              {selectedCityList.map((city, index) => (
                <div key={city.id}>
                  <div className="flex items-center justify-between py-[18px]">
                    <span className="text-[#66717D] font-medium">
                      {city.flag} {city.name}, {city.country}
                    </span>
                    <Button
                      variant="gray"
                      size="xs"
                      onClick={() => handleRemoveCity(city.id)}
                      className="w-6 items-center justify-center bg-transparent"
                    >
                      <CloseIcon width={10} height={10} />
                    </Button>
                  </div>
                  {(() => {
                    const isNotLastSelectedCity = index < selectedCityList.length - 1;
                    const isLastSelectedCity = index === selectedCityList.length - 1;
                    const shouldShowDividerBetweenSections = isLastSelectedCity && hasAvailablePopularCities;

                    return (isNotLastSelectedCity || shouldShowDividerBetweenSections) && (
                      <div className="border-b border-surface-placeholder--8" />
                    );
                  })()}
                </div>
              ))}

              {/* Popular Cities List */}
              {notSelectedPopularCities.map((city, index, filteredArray) => (
                <div key={city.id}>
                  <div className="flex items-center justify-between py-[18px]">
                    <span className="text-text-primary text-base font-medium">
                      {city.flag} {city.name}, {city.country}
                    </span>
                    <Button
                      variant="gray"
                      size="xs"
                      onClick={() => handleAddCity(city)}
                      className="w-6 items-center justify-center"
                    >
                      <PlusIcon width={10} height={10} />
                    </Button>
                  </div>
                  {index < filteredArray.length - 1 ? (
                    <div className="border-b border-surface-placeholder--8" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="sticky bottom-0">
        <div className="bg-surface-thirdly mx-auto w-full max-w-[512px] px-4 py-6">
          {/* Selected Cities Chips */}
          {selectedCityList.length > 0 && (
            <div className="mb-4">
              <p className="text-text-thirdly text-xs mb-3 font-bold">
                {selectedCityList.length}개 도시 방문
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {selectedCityList.map(({ id, flag, name, country }) => (
                  <Chip
                    key={id}
                    variant="gray"
                    size="md"
                    removable
                    onRemove={() => handleRemoveCity(id)}
                    className="flex-shrink-0"
                  >
                    {flag} {name}, {country}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <Button
            variant={isButtonEnabled ? "primary" : "disabled"}
            size="lg"
            className="w-full"
            disabled={!isButtonEnabled}
            onClick={() => { }}
          >
            내 지구본 생성하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NationSelectPage;