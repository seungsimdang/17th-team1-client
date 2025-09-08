'use client';

import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { feature } from 'topojson-client';

interface GlobeComponentProps {
  width?: number;
  height?: number;
  selectedLocation?: string;
  onLocationSelect?: (location: string) => void;
}

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  type: 'country' | 'city';
}

export default function GlobeComponent({
  width = 800,
  height = 600,
  selectedLocation,
  onLocationSelect
}: GlobeComponentProps) {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [pins, setPins] = useState<LocationData[]>([]);
  const [highlightedCountries, setHighlightedCountries] = useState<Set<string>>(new Set());

  // 국가와 도시 좌표 데이터
  const locationCoordinates: Record<string, { lat: number, lng: number, type: 'country' | 'city', country?: string }> = {
    // 국가
    '대한민국': { lat: 37.5665, lng: 126.9780, type: 'country' },
    '미국': { lat: 39.8283, lng: -98.5795, type: 'country' },
    '일본': { lat: 36.2048, lng: 138.2529, type: 'country' },
    '중국': { lat: 35.8617, lng: 104.1954, type: 'country' },
    '영국': { lat: 55.3781, lng: -3.4360, type: 'country' },
    '프랑스': { lat: 46.6034, lng: 1.8883, type: 'country' },
    '독일': { lat: 51.1657, lng: 10.4515, type: 'country' },

    // 한국 도시
    '서울': { lat: 37.5665, lng: 126.9780, type: 'city', country: 'South Korea' },
    '부산': { lat: 35.1796, lng: 129.0756, type: 'city', country: 'South Korea' },
    '인천': { lat: 37.4563, lng: 126.7052, type: 'city', country: 'South Korea' },
    '대구': { lat: 35.8714, lng: 128.6014, type: 'city', country: 'South Korea' },
    '대전': { lat: 36.3504, lng: 127.3845, type: 'city', country: 'South Korea' },
    '광주': { lat: 35.1595, lng: 126.8526, type: 'city', country: 'South Korea' },
    '울산': { lat: 35.5384, lng: 129.3114, type: 'city', country: 'South Korea' },
    '세종': { lat: 36.4800, lng: 127.2890, type: 'city', country: 'South Korea' },
    '제주': { lat: 33.4996, lng: 126.5312, type: 'city', country: 'South Korea' },

    // 미국 도시
    '뉴욕': { lat: 40.7128, lng: -74.0060, type: 'city', country: 'United States of America' },
    '로스앤젤레스': { lat: 34.0522, lng: -118.2437, type: 'city', country: 'United States of America' },
    '시카고': { lat: 41.8781, lng: -87.6298, type: 'city', country: 'United States of America' },
    '휴스턴': { lat: 29.7604, lng: -95.3698, type: 'city', country: 'United States of America' },
    '샌프란시스코': { lat: 37.7749, lng: -122.4194, type: 'city', country: 'United States of America' },
    '라스베이거스': { lat: 36.1699, lng: -115.1398, type: 'city', country: 'United States of America' },
    '마이애미': { lat: 25.7617, lng: -80.1918, type: 'city', country: 'United States of America' },

    // 일본 도시
    '도쿄': { lat: 35.6762, lng: 139.6503, type: 'city', country: 'Japan' },
    '오사카': { lat: 34.6937, lng: 135.5023, type: 'city', country: 'Japan' },
    '교토': { lat: 35.0116, lng: 135.7681, type: 'city', country: 'Japan' },
    '후쿠오카': { lat: 33.5904, lng: 130.4017, type: 'city', country: 'Japan' },
    '삿포로': { lat: 43.0642, lng: 141.3469, type: 'city', country: 'Japan' },

    // 중국 도시
    '베이징': { lat: 39.9042, lng: 116.4074, type: 'city', country: 'China' },
    '상하이': { lat: 31.2304, lng: 121.4737, type: 'city', country: 'China' },
    '광저우': { lat: 23.1291, lng: 113.2644, type: 'city', country: 'China' },
    '선전': { lat: 22.5431, lng: 114.0579, type: 'city', country: 'China' },
    '홍콩': { lat: 22.3193, lng: 114.1694, type: 'city', country: 'China' },

    // 유럽 도시
    '런던': { lat: 51.5074, lng: -0.1278, type: 'city', country: 'United Kingdom' },
    '파리': { lat: 48.8566, lng: 2.3522, type: 'city', country: 'France' },
    '베를린': { lat: 52.5200, lng: 13.4050, type: 'city', country: 'Germany' },
    '로마': { lat: 41.9028, lng: 12.4964, type: 'city', country: 'Italy' },
    '마드리드': { lat: 40.4168, lng: -3.7038, type: 'city', country: 'Spain' },
    '암스테르담': { lat: 52.3676, lng: 4.9041, type: 'city', country: 'Netherlands' },
    '취리히': { lat: 47.3769, lng: 8.5417, type: 'city', country: 'Switzerland' },

    // 기타 주요 도시
    '시드니': { lat: -33.8688, lng: 151.2093, type: 'city', country: 'Australia' },
    '멜버른': { lat: -37.8136, lng: 144.9631, type: 'city', country: 'Australia' },
    '토론토': { lat: 43.6532, lng: -79.3832, type: 'city', country: 'Canada' },
    '두바이': { lat: 25.2048, lng: 55.2708, type: 'city', country: 'United Arab Emirates' },
    '싱가포르': { lat: 1.3521, lng: 103.8198, type: 'city', country: 'Singapore' },
    '방콕': { lat: 13.7563, lng: 100.5018, type: 'city', country: 'Thailand' },
    '뭄바이': { lat: 19.0760, lng: 72.8777, type: 'city', country: 'India' },
    '상파울루': { lat: -23.5558, lng: -46.6396, type: 'city', country: 'Brazil' }
  };

  // 한국어 -> 영어 국가명 매핑
  const countryMapping: Record<string, string> = {
    '대한민국': 'South Korea',
    '미국': 'United States of America',
    '일본': 'Japan',
    '중국': 'China',
    '영국': 'United Kingdom',
    '프랑스': 'France',
    '독일': 'Germany'
  };

  useEffect(() => {
    if (!globeRef.current) return;

    // Globe 인스턴스 생성 (지구본 이미지 제거)
    const myGlobe = Globe()
      .width(width)
      .height(height)
      .backgroundColor('rgba(0,0,0,1)') // 검은 배경
      .showGlobe(false) // 기본 지구본 이미지 비활성화
      .showAtmosphere(true)
      .atmosphereColor('#4A90E2')
      .atmosphereAltitude(0.15);

    globeInstance.current = myGlobe;

    // 월드 아틀라스 데이터 로드
    fetch('//unpkg.com/world-atlas/countries-110m.json')
      .then(res => res.json())
      .then(countries => {
        const geoData = feature(countries, countries.objects.countries);

        myGlobe
          .polygonsData(geoData.features)
          .polygonAltitude(0.01)
          .polygonCapColor((d: any) => {
            const rawName = d.properties?.name || d.properties?.NAME || d.properties?.ADMIN || d.properties?.NAME_LONG;
            const countryKey = normalizeCountryName(rawName);

            if (normalizedHighlighted.has(countryKey)) {
              return '#ff4444';
            }
            return 'rgba(140, 160, 180, 0.35)';
          })
          .polygonSideColor((d: any) => {
            const rawName = d.properties?.name || d.properties?.NAME || d.properties?.ADMIN || d.properties?.NAME_LONG;
            const countryKey = normalizeCountryName(rawName);

            if (normalizedHighlighted.has(countryKey)) {
              return '#cc3333';
            }
            return 'rgba(90, 110, 130, 0.35)';
          })
          .polygonStrokeColor('#ffffff')
          //.polygonStrokeWidth(0.2)
          .polygonLabel((d: any) => `🌍 ${d.properties?.name || d.properties?.NAME || d.properties?.ADMIN || d.properties?.NAME_LONG}`)
          .onPolygonClick((polygon: any) => {
            console.log('Clicked country:', polygon.properties?.name);
          });
      });

    // 핀 설정
    myGlobe
      .pointsData(pins)
      .pointAltitude(0.15)
      .pointColor((d: any) => d.type === 'city' ? '#ffff00' : '#00ff00') // 노란색: 도시, 초록색: 국가
      .pointRadius((d: any) => d.type === 'city' ? 0.8 : 1.2)
      .pointLabel((d: any) => `${d.type === 'city' ? '🏙️' : '🌍'} ${d.name}`)
      .onPointClick((point: any) => {
        if (onLocationSelect) {
          onLocationSelect(point.name);
        }
      });

    // 컨테이너에 Globe 추가
    const globeElement = myGlobe(globeRef.current);

    // 자동 회전 설정
    myGlobe.controls().autoRotate = true;
    myGlobe.controls().autoRotateSpeed = 0.8;
    myGlobe.controls().enableZoom = true;
    myGlobe.controls().enablePan = true;

    return () => {
      if (globeRef.current) {
        globeRef.current.innerHTML = '';
      }
    };
  }, [width, height, pins, onLocationSelect, highlightedCountries]);

  // 선택된 위치가 변경되면 핀 업데이트 및 국가 하이라이트
  useEffect(() => {
    if (selectedLocation && locationCoordinates[selectedLocation]) {
      const locationData = locationCoordinates[selectedLocation];
      const newPin = {
        name: selectedLocation,
        lat: locationData.lat,
        lng: locationData.lng,
        type: locationData.type
      };

      setPins(prev => {
        const filtered = prev.filter(pin => pin.name !== selectedLocation);
        return [...filtered, newPin];
      });

      // 국가 하이라이트 업데이트
      setHighlightedCountries(prev => {
        const newSet = new Set(prev);

        if (locationData.type === 'country') {
          const englishName = countryMapping[selectedLocation];
          if (englishName) {
            newSet.add(englishName);
          }
        } else if (locationData.type === 'city' && locationData.country) {
          newSet.add(locationData.country);
        }

        return newSet;
      });

      // 해당 위치로 카메라 이동
      if (globeInstance.current) {
        const altitude = locationData.type === 'city' ? 1.5 : 2.5;
        globeInstance.current.pointOfView({
          lat: locationData.lat,
          lng: locationData.lng,
          altitude: altitude
        }, 1000);
      }
    }
  }, [selectedLocation]);

  const handleClearAll = () => {
    setPins([]);
    setHighlightedCountries(new Set());
    if (onLocationSelect) {
      onLocationSelect('');
    }
  };

  // 국가명 정규화 유틸 (공백/구두점 제거, 소문자)
  const normalizeCountryName = (name?: string) =>
    (name || '')
      .toLowerCase()
      .replace(/[^a-z]/g, '');

  // 선택된 국가명 집합(정규화) 생성
  const normalizedHighlighted = new Set(
    Array.from(highlightedCountries).map(n => normalizeCountryName(n))
  );

  return (
    <div className="flex flex-col items-center">
      <div
        ref={globeRef}
        className="border border-gray-300 rounded-lg overflow-hidden shadow-lg"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          🖱️ 마우스로 지구본을 회전하고 줌인/줌아웃할 수 있습니다
        </p>
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          <span>• 드래그: 회전</span>
          <span>• 휠: 줌</span>
          <span>• 노란 핀: 도시</span>
          <span>• 초록 핀: 국가</span>
          <span>• 빨간 색칠: 선택된 국가</span>
        </div>

        {pins.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
          >
            모든 핀 제거
          </button>
        )}
      </div>

      {/* 하이라이트된 국가 목록 표시 */}
      {highlightedCountries.size > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium mb-2">색칠된 국가:</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(highlightedCountries).map(country => (
              <span key={country} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                🌍 {country}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
