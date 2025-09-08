'use client';

import { useState } from 'react';
import GlobeComponent from '@/components/Globe';
import LocationSelector from '@/components/LocationSelector';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🌍 Interactive Globe
          </h1>
          <p className="text-xl text-blue-200">
            국가와 도시를 선택해서 지구본에 핀을 표시하세요
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 items-start">
          {/* 위치 선택 패널 */}
          <div className="lg:col-span-1">
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          </div>

          {/* 지구본 */}
          <div className="lg:col-span-3 flex justify-center">
            <GlobeComponent
              width={800}
              height={600}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">기능</h2>
            <div className="grid md:grid-cols-4 gap-4 text-blue-100">
              <div className="bg-white/5 rounded p-3">
                <h3 className="font-semibold mb-2">🔄 회전</h3>
                <p className="text-sm">마우스 드래그로 지구본을 자유롭게 회전할 수 있습니다</p>
              </div>
              <div className="bg-white/5 rounded p-3">
                <h3 className="font-semibold mb-2">🔍 줌</h3>
                <p className="text-sm">마우스 휠로 줌인/줌아웃이 가능합니다</p>
              </div>
              <div className="bg-white/5 rounded p-3">
                <h3 className="font-semibold mb-2">🏙️ 도시 핀</h3>
                <p className="text-sm">도시를 선택하면 빨간 핀이 표시되고 더 가깝게 줌됩니다</p>
              </div>
              <div className="bg-white/5 rounded p-3">
                <h3 className="font-semibold mb-2">🌍 국가 핀</h3>
                <p className="text-sm">국가를 선택하면 초록 핀이 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
