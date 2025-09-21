"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useClustering } from "@/hooks/useClustering";

// ReactGlobe을 동적 import로 로드 (SSR 방지)
const ReactGlobe = dynamic(() => import("@/components/ReactGlobe"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, #2c3e50 0%, #1a252f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "14px",
      }}
    >
      🌍 Globe 로딩 중...
    </div>
  ),
});

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
  const [selectedClusterData, setSelectedClusterData] = useState<CountryData[] | null>(null); // 선택된 클러스터의 데이터
  const [zoomStack, setZoomStack] = useState<number[]>([]);
  const [snapZoomTo, setSnapZoomTo] = useState<number | null>(2.5);
  const [, setSelectionStack] = useState<(CountryData[] | null)[]>([]); // 선택 경로 스택
  const [isZoomed, setIsZoomed] = useState(false); // 줌 상태 추적

  // 줌 상태 감지 (초기 줌 레벨 2.5에서 줌 인 했을 때 줌된 것으로 간주)
  useEffect(() => {
    const isCurrentlyZoomed = zoomLevel < 2.4; // 2.5보다 작으면 줌 인 된 것
    console.log("Zoom debug:", { zoomLevel, isCurrentlyZoomed });
    setIsZoomed(isCurrentlyZoomed);
  }, [zoomLevel]);

  // 여행 패턴들 (메모화)
  const travelPatterns: TravelPattern[] = useMemo(
    () => [
      {
        title: "아시아 문화 여행",
        subtitle: "전통과 현대가 공존하는 아시아의 매력",
        countries: [
          {
            id: "JPN",
            name: "도쿄, 일본",
            flag: "🇯🇵",
            lat: 35.6762,
            lng: 139.6503,
            color: "#e91e63",
          },
          {
            id: "JPN",
            name: "오사카, 일본",
            flag: "🇯🇵",
            lat: 34.6937,
            lng: 135.5023,
            color: "#e91e63",
          },
          {
            id: "JPN",
            name: "교토, 일본",
            flag: "🇯🇵",
            lat: 36.0116,
            lng: 135.7681,
            color: "#e91e63",
          },
          {
            id: "JPN",
            name: "요코하마, 일본",
            flag: "🇯🇵",
            lat: 35.4437,
            lng: 139.638,
            color: "#e91e63",
          },
          {
            id: "JPN",
            name: "나고야, 일본",
            flag: "🇯🇵",
            lat: 35.1815,
            lng: 136.9066,
            color: "#e91e63",
          },
          {
            id: "JPN",
            name: "후쿠오카, 일본",
            flag: "🇯🇵",
            lat: 33.5904,
            lng: 130.4017,
            color: "#e91e63",
          },
          {
            id: "JPN",
            name: "삿포로, 일본",
            flag: "🇯🇵",
            lat: 43.0642,
            lng: 141.3469,
            color: "#e91e63",
          },
          {
            id: "JPN",
            name: "센다이, 일본",
            flag: "🇯🇵",
            lat: 38.2682,
            lng: 140.8694,
            color: "#e91e63",
          },
          {
            id: "JPN",
            name: "히로시마, 일본",
            flag: "🇯🇵",
            lat: 34.3853,
            lng: 132.4553,
            color: "#e91e63",
          },
          {
            id: "KOR",
            name: "서울, 한국",
            flag: "🇰🇷",
            lat: 37.5665,
            lng: 126.978,
            color: "#9c27b0",
          },
          {
            id: "KOR",
            name: "부산, 한국",
            flag: "🇰🇷",
            lat: 35.1796,
            lng: 129.0756,
            color: "#9c27b0",
          },
          {
            id: "KOR",
            name: "대구, 한국",
            flag: "🇰🇷",
            lat: 35.8714,
            lng: 128.6014,
            color: "#9c27b0",
          },
          {
            id: "KOR",
            name: "인천, 한국",
            flag: "🇰🇷",
            lat: 37.4563,
            lng: 126.7052,
            color: "#9c27b0",
          },
          {
            id: "KOR",
            name: "광주, 한국",
            flag: "🇰🇷",
            lat: 35.1595,
            lng: 126.8526,
            color: "#9c27b0",
          },
          {
            id: "TWN",
            name: "타이베이, 대만",
            flag: "🇹🇼",
            lat: 25.033,
            lng: 121.5654,
            color: "#673ab7",
          },
          {
            id: "THA",
            name: "방콕, 태국",
            flag: "🇹🇭",
            lat: 13.7563,
            lng: 100.5018,
            color: "#3f51b5",
          },
          {
            id: "SGP",
            name: "싱가포르",
            flag: "🇸🇬",
            lat: 1.3521,
            lng: 103.8198,
            color: "#2196f3",
          },
        ],
      },
      {
        title: "세계 명소 순례",
        subtitle: "꿈에 그리던 세계 각국의 랜드마크들",
        countries: [
          {
            id: "USA",
            name: "뉴욕, 미국",
            flag: "🇺🇸",
            lat: 40.7128,
            lng: -74.006,
            color: "#f44336",
          },
          {
            id: "FRA",
            name: "파리, 프랑스",
            flag: "🇫🇷",
            lat: 48.8566,
            lng: 2.3522,
            color: "#e91e63",
          },
          {
            id: "EGY",
            name: "카이로, 이집트",
            flag: "🇪🇬",
            lat: 30.0444,
            lng: 31.2357,
            color: "#9c27b0",
          },
          {
            id: "BRA",
            name: "리우데자네이루, 브라질",
            flag: "🇧🇷",
            lat: -22.9068,
            lng: -43.1729,
            color: "#4caf50",
          },
          {
            id: "AUS",
            name: "시드니, 호주",
            flag: "🇦🇺",
            lat: -33.8688,
            lng: 151.2093,
            color: "#00bcd4",
          },
        ],
      },
      {
        title: "유럽 로맨틱 여행",
        subtitle: "낭만적인 유럽의 고성과 거리들",
        countries: [
          // 독일
          {
            id: "GER1",
            name: "드레스덴, 독일",
            flag: "🇩🇪",
            lat: 51.0504,
            lng: 13.7373,
            color: "#ff9800",
          },
          {
            id: "GER2",
            name: "베를린, 독일",
            flag: "🇩🇪",
            lat: 52.52,
            lng: 13.405,
            color: "#ff9800",
          },
          {
            id: "GER3",
            name: "마르부르크, 독일",
            flag: "🇩🇪",
            lat: 50.8021,
            lng: 8.7667,
            color: "#ff9800",
          },
          {
            id: "GER4",
            name: "에센, 독일",
            flag: "🇩🇪",
            lat: 51.4556,
            lng: 7.0116,
            color: "#ff9800",
          },
          {
            id: "GER5",
            name: "도르트문트, 독일",
            flag: "🇩🇪",
            lat: 51.5136,
            lng: 7.4653,
            color: "#ff9800",
          },
          {
            id: "GER6",
            name: "쾰른, 독일",
            flag: "🇩🇪",
            lat: 50.9375,
            lng: 6.9603,
            color: "#ff9800",
          },
          {
            id: "GER7",
            name: "프랑크푸르트, 독일",
            flag: "🇩🇪",
            lat: 50.1109,
            lng: 8.6821,
            color: "#ff9800",
          },
          {
            id: "GER8",
            name: "하이델베르크, 독일",
            flag: "🇩🇪",
            lat: 49.3988,
            lng: 8.6724,
            color: "#ff9800",
          },
          {
            id: "GER9",
            name: "뮌헨, 독일",
            flag: "🇩🇪",
            lat: 48.1351,
            lng: 11.582,
            color: "#ff9800",
          },
          {
            id: "GER10",
            name: "뒤셀도르프, 독일",
            flag: "🇩🇪",
            lat: 51.2277,
            lng: 6.7735,
            color: "#ff9800",
          },

          // 프랑스
          {
            id: "FRA1",
            name: "니스, 프랑스",
            flag: "🇫🇷",
            lat: 43.7102,
            lng: 7.262,
            color: "#2196f3",
          },
          {
            id: "FRA2",
            name: "노르망디 - 몽생미셸, 프랑스",
            flag: "🇫🇷",
            lat: 48.6361,
            lng: -1.5115,
            color: "#2196f3",
          },
          {
            id: "FRA3",
            name: "콜마르, 프랑스",
            flag: "🇫🇷",
            lat: 48.0794,
            lng: 7.3584,
            color: "#2196f3",
          },
          {
            id: "FRA4",
            name: "파리, 프랑스",
            flag: "🇫🇷",
            lat: 48.8566,
            lng: 2.3522,
            color: "#2196f3",
          },
          {
            id: "FRA5",
            name: "스트라스부르, 프랑스",
            flag: "🇫🇷",
            lat: 48.5734,
            lng: 7.7521,
            color: "#2196f3",
          },

          // 네덜란드
          {
            id: "NLD1",
            name: "루르몬드, 네덜란드",
            flag: "🇳🇱",
            lat: 51.1944,
            lng: 5.9944,
            color: "#4caf50",
          },
          {
            id: "NLD2",
            name: "벤로, 네덜란드",
            flag: "🇳🇱",
            lat: 51.3703,
            lng: 6.1662,
            color: "#4caf50",
          },
          {
            id: "NLD3",
            name: "아인트호번, 네덜란드",
            flag: "🇳🇱",
            lat: 51.4416,
            lng: 5.4697,
            color: "#4caf50",
          },
          {
            id: "NLD4",
            name: "잔세 스칸스, 네덜란드",
            flag: "🇳🇱",
            lat: 52.4742,
            lng: 4.8175,
            color: "#4caf50",
          },
          {
            id: "NLD5",
            name: "암스테르담, 네덜란드",
            flag: "🇳🇱",
            lat: 52.3676,
            lng: 4.9041,
            color: "#4caf50",
          },

          // 오스트리아
          {
            id: "AUT1",
            name: "빈, 오스트리아",
            flag: "🇦🇹",
            lat: 48.2082,
            lng: 16.3738,
            color: "#e91e63",
          },

          // 포르투갈
          {
            id: "PRT1",
            name: "리스본, 포르투갈",
            flag: "🇵🇹",
            lat: 38.7223,
            lng: -9.1393,
            color: "#9c27b0",
          },
          {
            id: "PRT2",
            name: "포르투, 포르투갈",
            flag: "🇵🇹",
            lat: 41.1579,
            lng: -8.6291,
            color: "#9c27b0",
          },

          // 덴마크
          {
            id: "DNK1",
            name: "코펜하겐, 덴마크",
            flag: "🇩🇰",
            lat: 55.6761,
            lng: 12.5683,
            color: "#f44336",
          },

          // 노르웨이/아이슬란드 (오로라 관광)
          {
            id: "NOR1",
            name: "오로라 관광 (노르웨이/아이슬란드)",
            flag: "🇳🇴",
            lat: 69.6492,
            lng: 18.9553, // 트롬소 좌표 사용
            color: "#00bcd4",
          },

          // 체코
          {
            id: "CZE1",
            name: "프라하, 체코",
            flag: "🇨🇿",
            lat: 50.0755,
            lng: 14.4378,
            color: "#795548",
          },

          // 헝가리
          {
            id: "HUN1",
            name: "부다페스트, 헝가리",
            flag: "🇭🇺",
            lat: 47.4979,
            lng: 19.0402,
            color: "#607d8b",
          },

          // 벨기에
          {
            id: "BEL1",
            name: "브뤼셀, 벨기에",
            flag: "🇧🇪",
            lat: 50.8503,
            lng: 4.3517,
            color: "#ffc107",
          },

          // 몰타
          {
            id: "MLT1",
            name: "몰타",
            flag: "🇲🇹",
            lat: 35.9375,
            lng: 14.3754,
            color: "#ff5722",
          },

          // 이탈리아
          {
            id: "ITA2",
            name: "로마, 이탈리아",
            flag: "🇮🇹",
            lat: 41.9028,
            lng: 12.4964,
            color: "#ff5722",
          },
          {
            id: "ITA3",
            name: "피사, 이탈리아",
            flag: "🇮🇹",
            lat: 43.7228,
            lng: 10.4017,
            color: "#ff5722",
          },
          {
            id: "ITA4",
            name: "피렌체, 이탈리아",
            flag: "🇮🇹",
            lat: 43.7696,
            lng: 11.2558,
            color: "#ff5722",
          },
          {
            id: "ITA5",
            name: "베니스, 이탈리아",
            flag: "🇮🇹",
            lat: 45.4408,
            lng: 12.3155,
            color: "#ff5722",
          },
          {
            id: "ITA6",
            name: "밀라노, 이탈리아",
            flag: "🇮🇹",
            lat: 45.4642,
            lng: 9.19,
            color: "#ff5722",
          },

          // 그리스
          {
            id: "GRC1",
            name: "아테네, 그리스",
            flag: "🇬🇷",
            lat: 37.9838,
            lng: 23.7275,
            color: "#3f51b5",
          },

          // 스위스
          {
            id: "CHE1",
            name: "인터라켄, 스위스",
            flag: "🇨🇭",
            lat: 46.6863,
            lng: 7.8632,
            color: "#009688",
          },

          // 영국
          {
            id: "GBR1",
            name: "런던, 영국",
            flag: "🇬🇧",
            lat: 51.5074,
            lng: -0.1278,
            color: "#673ab7",
          },

          // 스페인
          {
            id: "ESP1",
            name: "바르셀로나, 스페인",
            flag: "🇪🇸",
            lat: 41.3851,
            lng: 2.1734,
            color: "#ffeb3b",
          },

          // 에스토니아
          {
            id: "EST1",
            name: "탈린, 에스토니아",
            flag: "🇪🇪",
            lat: 59.437,
            lng: 24.7536,
            color: "#cddc39",
          },
        ],
      },
    ],
    [],
  );

  const currentPattern = useMemo(() => travelPatterns[currentGlobeIndex], [travelPatterns, currentGlobeIndex]);

  // 클러스터링 훅 사용
  const { clusteredData, shouldShowClusters } = useClustering({
    countries: currentPattern.countries,
    zoomLevel,
    selectedClusterData: selectedClusterData || undefined,
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

  // 히스테리시스 임계값 (줌인/줌아웃 다르게)
  const CITY_TO_COUNTRY_IN = 0.24; // 도시→나라 (줌인 시 진입 기준)
  const CITY_TO_COUNTRY_OUT = 0.3; // 도시→나라 (줌아웃 시 이탈 기준)
  const COUNTRY_TO_ROOT_IN = 0.55; // 나라→루트 (줌인 시 진입 기준)
  const COUNTRY_TO_ROOT_OUT = 0.8; // 나라→루트 (줌아웃 시 이탈 기준)

  const handleZoomChange = useCallback(
    (newZoomLevel: number) => {
      setZoomLevel((prev) => {
        const rounded = Number(newZoomLevel.toFixed(2));

        // 클릭으로 인한 줌인인 경우 즉시 반영 (부드러운 애니메이션을 위해)
        if (rounded < prev - 0.1) {
          return rounded;
        }

        // 줌아웃 시작을 감지하면 직전 단계로 스냅
        if (rounded > prev + 0.01 && zoomStack.length > 0) {
          const last = zoomStack[zoomStack.length - 1];
          setSnapZoomTo(last);
          setZoomStack((s) => s.slice(0, -1));
          // 선택 경로도 한 단계 상위로 복원
          setSelectionStack((stack) => {
            if (stack.length === 0) {
              setSelectedClusterData(null);
              return stack;
            }
            const newStack = stack.slice(0, -1);
            const parent = newStack.length > 0 ? newStack[newStack.length - 1] : null;
            setSelectedClusterData(parent || null);
            return newStack;
          });
          return prev;
        }

        // 상위로 충분히 멀어지면 초기화
        if (rounded >= COUNTRY_TO_ROOT_OUT && selectedClusterData) {
          setSelectedClusterData(null);
          setZoomStack([]);
          setSnapZoomTo(null);
          setSelectionStack([]);
        }

        // 스냅 스택이 없는 일반 줌아웃 경로에서 임계값 교차 시 상위로 복원
        if (rounded > prev + 0.01 && zoomStack.length === 0) {
          // 도시 → 나라 경계 상향 교차
          if (prev <= CITY_TO_COUNTRY_OUT && rounded >= CITY_TO_COUNTRY_OUT) {
            setSelectionStack((stack) => {
              if (stack.length === 0) return stack;
              const newStack = stack.slice(0, -1);
              const parent = newStack.length > 0 ? newStack[newStack.length - 1] : null;
              setSelectedClusterData(parent || null);
              return newStack;
            });
          }
        }

        // 작은 변화도 반영 (더 부드러운 줌)
        if (Math.abs(prev - rounded) >= 0.02) {
          return rounded;
        }

        return prev;
      });
    },
    [selectedClusterData, zoomStack],
  );

  // 클러스터 선택 핸들러
  const handleClusterSelect = useCallback(
    (cluster: any) => {
      // 현재 줌/선택을 스택에 저장하고 선택 갱신
      setZoomStack((prev) => [...prev, zoomLevel]);
      setSelectionStack((stack) => [...stack, selectedClusterData ? [...selectedClusterData] : null]);
      setSelectedClusterData(cluster.items);
    },
    [zoomLevel, selectedClusterData],
  );

  // 휠로 줌아웃 시, 가까운 스냅 지점으로 자동 복귀 (직전 스택 단계)
  useEffect(() => {
    if (typeof snapZoomTo === "number") {
      const t = setTimeout(() => setSnapZoomTo(null), 120);
      return () => clearTimeout(t);
    }
  }, [snapZoomTo]);

  const [expandedCluster, setExpandedCluster] = useState<string | null>(null); // 추가

  // 핸들러 함수 추가
  const handleClusterExpand = useCallback((clusterId: string | null) => {
    setExpandedCluster(clusterId);
  }, []);

  const handlePatternChange = (index: number) => {
    setCurrentGlobeIndex(index);
    setSelectedCountry(null);
    setSelectedClusterData(null);
    setZoomLevel(2.5);
    setZoomStack([]);
    setSnapZoomTo(null);
    setSelectionStack([]);
  };

  return (
    <div
      className="w-full overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 text-text-primary flex flex-col max-w-[600px] mx-auto relative font-sans"
      style={{
        height: "100dvh", // Dynamic Viewport Height - 모바일 브라우저의 실제 보이는 영역
      }}
    >
      {/* 상단 정보 */}
      <div
        className={`text-center pt-8 px-6 pb-4 transition-opacity duration-500 ${isZoomed ? "opacity-0" : "opacity-100"}`}
      >
        <div className="inline-flex items-center rounded-full px-4 py-2 text-xs font-bold mb-3 bg-surface-inverseprimary text-text-inverseprimary">
          AI 인사이트 준비중...
        </div>
        <h1 className="text-xl font-extrabold text-text-primary">N개 도시, N개국 여행자</h1>
      </div>

      {/* React Globe 컴포넌트 */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* 테스트용 패턴 버튼들 */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
          {travelPatterns.map((pattern, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePatternChange(index)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 ${
                currentGlobeIndex === index
                  ? "bg-blue-theme text-text-inverseprimary"
                  : "bg-surface-placeholder--8 text-text-secondary hover:bg-surface-placeholder--16"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="w-full h-full flex items-center justify-center">
          <ReactGlobe
            travelPatterns={travelPatterns}
            currentGlobeIndex={currentGlobeIndex}
            selectedCountry={selectedCountry}
            onCountrySelect={handleCountrySelect}
            onZoomChange={handleZoomChange}
            onClusterSelect={handleClusterSelect}
            clusteredData={clusteredData}
            shouldShowClusters={shouldShowClusters}
            zoomLevel={zoomLevel}
            selectedClusterData={selectedClusterData || undefined}
            snapZoomTo={snapZoomTo}
          />
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className={`px-4 pb-4 space-y-2 transition-opacity duration-500 ${isZoomed ? "opacity-0" : "opacity-100"}`}>
        <button
          type="button"
          className="w-full text-text-inverseprimary font-bold py-3 rounded-2xl text-base bg-blue-theme cursor-pointer"
        >
          내 지구본 자랑하기
        </button>
        <button
          type="button"
          className="w-full bg-transparent text-text-primary font-bold py-3 rounded-2xl text-base cursor-pointer"
        >
          홈으로 이동
        </button>
      </div>

      {/* 줌 시 나타나는 돌아가기 버튼 */}
      <div
        className={`absolute bottom-4 right-4 transition-opacity duration-500 ${isZoomed ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <button
          type="button"
          onClick={() => {
            setZoomLevel(2.5);
            setSnapZoomTo(2.5);
          }}
          className="flex items-center gap-2 bg-surface-placeholder--16 backdrop-blur-sm text-text-primary px-4 py-3 rounded-full font-medium text-sm hover:bg-surface-placeholder--8 transition-all duration-200"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="뒤로가기 화살표"
          >
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M12 5L5 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default GlobePrototype;
