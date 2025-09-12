'use client';

import React, { useState, useCallback } from 'react';
import ReactGlobe from '@/components/ReactGlobe';
import { useClustering } from '@/hooks/useClustering';
import ClusterLabel from '@/components/ClusterLabel';

interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

interface TravelPattern {
  title: string;
  subtitle: string;
  countries: CountryData[];
}

const GlobePrototype = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [currentGlobeIndex, setCurrentGlobeIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(2.5);

  // 여행 패턴들
  const travelPatterns: TravelPattern[] = [
    {
      title: '아시아 문화 여행',
      subtitle: '전통과 현대가 공존하는 아시아의 매력',
      countries: [
        {
          id: 'JPN',
          name: '도쿄, 일본',
          flag: '🇯🇵',
          lat: 35.6762,
          lng: 139.6503,
          color: '#e91e63',
        },
        {
          id: 'JPN2',
          name: '오사카, 일본',
          flag: '🇯🇵',
          lat: 34.6937,
          lng: 135.5023,
          color: '#e91e63',
        },
        {
          id: 'JPN3',
          name: '교토, 일본',
          flag: '🇯🇵',
          lat: 35.0116,
          lng: 135.7681,
          color: '#e91e63',
        },
        {
          id: 'KOR',
          name: '서울, 한국',
          flag: '🇰🇷',
          lat: 37.5665,
          lng: 126.978,
          color: '#9c27b0',
        },
        {
          id: 'TWN',
          name: '타이베이, 대만',
          flag: '🇹🇼',
          lat: 25.033,
          lng: 121.5654,
          color: '#673ab7',
        },
        {
          id: 'THA',
          name: '방콕, 태국',
          flag: '🇹🇭',
          lat: 13.7563,
          lng: 100.5018,
          color: '#3f51b5',
        },
        {
          id: 'SGP',
          name: '싱가포르',
          flag: '🇸🇬',
          lat: 1.3521,
          lng: 103.8198,
          color: '#2196f3',
        },
      ],
    },
    {
      title: '세계 명소 순례',
      subtitle: '꿈에 그리던 세계 각국의 랜드마크들',
      countries: [
        {
          id: 'USA',
          name: '뉴욕, 미국',
          flag: '🇺🇸',
          lat: 40.7128,
          lng: -74.006,
          color: '#f44336',
        },
        {
          id: 'FRA',
          name: '파리, 프랑스',
          flag: '🇫🇷',
          lat: 48.8566,
          lng: 2.3522,
          color: '#e91e63',
        },
        {
          id: 'EGY',
          name: '카이로, 이집트',
          flag: '🇪🇬',
          lat: 30.0444,
          lng: 31.2357,
          color: '#9c27b0',
        },
        {
          id: 'BRA',
          name: '리우데자네이루, 브라질',
          flag: '🇧🇷',
          lat: -22.9068,
          lng: -43.1729,
          color: '#4caf50',
        },
        {
          id: 'AUS',
          name: '시드니, 호주',
          flag: '🇦🇺',
          lat: -33.8688,
          lng: 151.2093,
          color: '#00bcd4',
        },
      ],
    },
    {
      title: '유럽 로맨틱 여행',
      subtitle: '낭만적인 유럽의 고성과 거리들',
      countries: [
        {
          id: 'ITA',
          name: '로마, 이탈리아',
          flag: '🇮🇹',
          lat: 41.9028,
          lng: 12.4964,
          color: '#ff9800',
        },
        {
          id: 'ESP',
          name: '바르셀로나, 스페인',
          flag: '🇪🇸',
          lat: 41.3851,
          lng: 2.1734,
          color: '#4caf50',
        },
        {
          id: 'GBR',
          name: '런던, 영국',
          flag: '🇬🇧',
          lat: 51.5074,
          lng: -0.1278,
          color: '#2196f3',
        },
        {
          id: 'DEU',
          name: '베를린, 독일',
          flag: '🇩🇪',
          lat: 52.52,
          lng: 13.405,
          color: '#ff5722',
        },
        {
          id: 'CHE',
          name: '취리히, 스위스',
          flag: '🇨🇭',
          lat: 47.3769,
          lng: 8.5417,
          color: '#795548',
        },
      ],
    },
  ];

  const currentPattern = travelPatterns[currentGlobeIndex];

  // 클러스터링 훅 사용
  const { clusteredData, shouldShowClusters } = useClustering({
    countries: currentPattern.countries,
    zoomLevel,
  });

  // 줌 레벨에 따른 클러스터링 거리 계산 (UI 표시용)
  const getClusterDistance = (zoom: number): number => {
    if (zoom > 6) return 50;
    if (zoom > 5) return 40;
    if (zoom > 4) return 30;
    if (zoom > 3) return 20;
    if (zoom > 2) return 15;
    if (zoom > 1.5) return 10;
    return 0;
  };

  // 핸들러 함수들
  const handleCountrySelect = useCallback((countryId: string | null) => {
    setSelectedCountry(countryId);
  }, []);

  const handleZoomChange = useCallback((newZoomLevel: number) => {
    setZoomLevel(newZoomLevel);
  }, []);

  const handlePatternChange = (index: number) => {
    setCurrentGlobeIndex(index);
    setSelectedCountry(null);
  };

  const handleClusterClick = (cluster: any) => {
    // 클러스터 클릭 시 첫 번째 아이템을 선택
    if (cluster.items && cluster.items.length > 0) {
      handleCountrySelect(cluster.items[0].id);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0c1a2e 0%, #1a252f 50%, #2c3e50 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* 헤더 */}
      <div
        style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '800px' }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #4a90e2 0%, #64b5f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 15px 0',
            textAlign: 'center',
          }}
        >
          🌍 React Globe.gl Migration
        </h1>
        <div
          style={{
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            border: '1px solid rgba(74, 144, 226, 0.3)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: '0 0 8px 0', color: '#4a90e2' }}>
            {currentPattern.title}
          </h2>
          <p style={{ margin: '0', color: '#8892b0', fontSize: '14px' }}>
            {currentPattern.subtitle}
          </p>
        </div>

        {/* 패턴 선택 버튼 */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {travelPatterns.map((pattern, index) => (
            <button
              key={index}
              onClick={() => handlePatternChange(index)}
              style={{
                backgroundColor:
                  currentGlobeIndex === index
                    ? 'rgba(74, 144, 226, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                color: currentGlobeIndex === index ? '#4a90e2' : '#8892b0',
                border:
                  currentGlobeIndex === index
                    ? '2px solid #4a90e2'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '25px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
              }}
            >
              패턴 {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* React Globe 컴포넌트 */}
      <div
        style={{
          marginBottom: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        <ReactGlobe
          travelPatterns={travelPatterns}
          currentGlobeIndex={currentGlobeIndex}
          selectedCountry={selectedCountry}
          onCountrySelect={handleCountrySelect}
          onZoomChange={handleZoomChange}
        />

        {/* 클러스터 레이블 오버레이 */}
        {shouldShowClusters && clusteredData.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            {clusteredData.map((cluster, index) => (
              <div
                key={`${cluster.id}-${index}`}
                style={{
                  position: 'absolute',
                  // 여기서 실제 3D 좌표를 2D 화면 좌표로 변환하는 로직이 필요합니다
                  // 현재는 임시로 랜덤 위치를 사용합니다
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  pointerEvents: 'auto',
                }}
                onClick={() => handleClusterClick(cluster)}
              >
                <ClusterLabel cluster={cluster} onClick={handleClusterClick} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 클러스터링 정보 */}
      {clusteredData.length > 0 && shouldShowClusters && (
        <div
          style={{
            color: '#8892b0',
            fontSize: '12px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          현재 줌 레벨: {zoomLevel.toFixed(2)} | 클러스터 거리:{' '}
          {getClusterDistance(zoomLevel)} | 클러스터: {clusteredData.length}개
        </div>
      )}

      {/* 선택된 국가 정보 */}
      {selectedCountry && (
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '20px',
          }}
        >
          {(() => {
            const country = currentPattern.countries.find(
              (c: any) => c.id === selectedCountry
            );
            return country ? (
              <>
                <div style={{ fontSize: '30px', marginBottom: '10px' }}>
                  {country.flag}
                </div>
                <h3 style={{ margin: '0 0 5px 0', color: 'white' }}>
                  {country.name}
                </h3>
                <button
                  onClick={() => setSelectedCountry(null)}
                  style={{
                    backgroundColor: country.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 20px',
                    cursor: 'pointer',
                    marginTop: '10px',
                  }}
                >
                  닫기
                </button>
              </>
            ) : null;
          })()}
        </div>
      )}

      {/* 안내 메시지 */}
      <p
        style={{
          color: '#8892b0',
          fontSize: '12px',
          textAlign: 'center',
          marginTop: '20px',
          maxWidth: '600px',
        }}
      >
        ✨ React Globe.gl로 마이그레이션 완료! 위 버튼으로 다른 여행 패턴을
        확인하고, 지구본을 확대/축소하며 클러스터를 클릭해보세요.
      </p>
    </div>
  );
};

export default GlobePrototype;
