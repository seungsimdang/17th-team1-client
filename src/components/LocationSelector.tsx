'use client';

import { useState } from 'react';

interface LocationSelectorProps {
  onLocationSelect: (location: string) => void;
  selectedLocation?: string;
}

const locations = {
  countries: ['대한민국', '미국', '일본', '중국', '영국', '프랑스', '독일'],
  cities: {
    '한국': ['서울', '부산', '인천', '대구', '대전', '광주', '울산', '세종', '제주'],
    '미국': ['뉴욕', '로스앤젤레스', '시카고', '휴스턴', '샌프란시스코', '라스베이거스', '마이애미'],
    '일본': ['도쿄', '오사카', '교토', '후쿠오카', '삿포로'],
    '중국': ['베이징', '상하이', '광저우', '선전', '홍콩'],
    '유럽': ['런던', '파리', '베를린', '로마', '마드리드', '암스테르담', '취리히'],
    '기타': ['시드니', '멜버른', '토론토', '두바이', '싱가포르', '방콕', '뭄바이', '상파울루']
  }
};

const allLocations = [
  ...locations.countries,
  ...Object.values(locations.cities).flat()
];

export default function LocationSelector({ onLocationSelect, selectedLocation }: LocationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'countries' | 'cities'>('search');

  const filteredLocations = allLocations.filter(location =>
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocationClick = (location: string) => {
    onLocationSelect(location);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClearPin = () => {
    onLocationSelect('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🌍 위치 선택
        </h3>

        {/* 탭 메뉴 */}
        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'search'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            검색
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'countries'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            국가
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'cities'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            도시
          </button>
        </div>

        {/* 검색 탭 */}
        {activeTab === 'search' && (
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="국가나 도시명을 입력하세요..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {isOpen && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationClick(location)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center"
                    >
                      <span className="mr-2">
                        {locations.countries.includes(location) ? '🌍' : '🏙️'}
                      </span>
                      {location}
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
        )}

        {/* 국가 탭 */}
        {activeTab === 'countries' && (
          <div className="mb-4">
            <div className="grid grid-cols-1 gap-2">
              {locations.countries.map((country) => (
                <button
                  key={country}
                  onClick={() => handleLocationClick(country)}
                  className={`px-4 py-2 text-left rounded-lg transition-colors flex items-center ${selectedLocation === country
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  <span className="mr-2">🌍</span>
                  {country}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 도시 탭 */}
        {activeTab === 'cities' && (
          <div className="mb-4 space-y-4">
            {Object.entries(locations.cities).map(([region, cities]) => (
              <div key={region}>
                <h4 className="text-sm font-medium text-gray-600 mb-2">{region}</h4>
                <div className="grid grid-cols-2 gap-1">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleLocationClick(city)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center ${selectedLocation === city
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <span className="mr-1">🏙️</span>
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 현재 선택된 위치 */}
        {selectedLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">선택된 위치:</p>
                <p className="font-semibold text-blue-800 flex items-center">
                  <span className="mr-1">
                    {locations.countries.includes(selectedLocation) ? '🌍' : '🏙️'}
                  </span>
                  {selectedLocation}
                </p>
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
