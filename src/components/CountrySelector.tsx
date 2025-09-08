'use client';

import { useState } from 'react';

interface CountrySelectorProps {
  onCountrySelect: (country: string) => void;
  selectedCountry?: string;
}

const countries = [
  '대한민국', '미국', '일본', '중국', '영국', '프랑스',
  '독일', '이탈리아', '스페인', '러시아', '브라질',
  '캐나다', '호주', '인도', '멕시코', '아르헨티나',
  '남아프리카공화국', '이집트', '터키', '태국'
];

export default function CountrySelector({ onCountrySelect, selectedCountry }: CountrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountryClick = (country: string) => {
    onCountrySelect(country);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClearPin = () => {
    onCountrySelect('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🌍 국가 선택
        </h3>

        {/* 검색 입력 */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="국가명을 입력하세요..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* 드롭다운 */}
          {isOpen && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountryClick(country)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {country}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* 빠른 선택 버튼들 */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">빠른 선택:</p>
          <div className="grid grid-cols-2 gap-2">
            {['대한민국', '미국', '일본', '중국'].map((country) => (
              <button
                key={country}
                onClick={() => handleCountryClick(country)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${selectedCountry === country
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* 현재 선택된 국가 */}
        {selectedCountry && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">선택된 국가:</p>
                <p className="font-semibold text-blue-800">📍 {selectedCountry}</p>
              </div>
              <button
                onClick={handleClearPin}
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
              >
                핀 제거
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
