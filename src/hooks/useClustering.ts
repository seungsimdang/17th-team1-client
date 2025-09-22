"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getContinent, getContinentClusterName, getCountryName } from "@/constants/countryMapping";

interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

interface ClusterData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
  items: CountryData[];
  count: number;
  clusterType?: "individual_city" | "country_cluster" | "continent_cluster";
}

interface UseClusteringProps {
  countries: CountryData[];
  zoomLevel: number;
  selectedClusterData?: CountryData[]; // 선택된 클러스터의 데이터
}

export const useClustering = ({ countries, zoomLevel, selectedClusterData }: UseClusteringProps) => {
  const [clusteredData, setClusteredData] = useState<ClusterData[]>([]);

  // 줌 레벨에 따른 클러스터링 거리 계산
  const getClusterDistance = useCallback((zoom: number): number => {
    // 줌 레벨이 높을수록(멀리서 볼 때) 클러스터링 거리를 크게 설정
    // 줌 레벨이 낮을수록(가까이서 볼 때) 클러스터링 거리를 작게 설정
    if (zoom >= 2.0) return 12; // 매우 멀리서 볼 때는 가까운 국가들만 클러스터링
    if (zoom >= 1.5) return 8; // 멀리서 볼 때는 중간 거리로 클러스터링
    if (zoom >= 1.0) return 5; // 중간 거리에서 볼 때는 작은 거리로 클러스터링
    if (zoom >= 0.5) return 3; // 가까이서 볼 때는 매우 작은 거리로 클러스터링
    if (zoom >= 0.3) return 2; // 매우 가까이서 볼 때는 작은 거리로 클러스터링
    if (zoom >= 0.2) return 1.5; // 줌인 상태에서도 같은 국가 클러스터링 유지
    if (zoom >= 0.1) return 1; // 더 가까워도 같은 국가는 클러스터링
    return 1; // 최대로 가까울 때도 같은 국가는 클러스터링
  }, []);

  // 지역 밀도 계산 함수
  const calculateRegionDensity = useCallback((locations: CountryData[]): Map<string, number> => {
    const densityMap = new Map<string, number>();

    // 유럽, 아시아, 아메리카 등 주요 지역별 밀도 계산
    locations.forEach((location) => {
      const lat = location.lat;
      const lng = location.lng;

      // 유럽 지역 (밀도 높음)
      if (lat >= 35 && lat <= 70 && lng >= -25 && lng <= 40) {
        densityMap.set(location.id, 2.0); // 유럽은 2배 밀도
      }
      // 동아시아 지역 (밀도 높음)
      else if (lat >= 20 && lat <= 50 && lng >= 100 && lng <= 150) {
        densityMap.set(location.id, 1.8); // 동아시아는 1.8배 밀도
      }
      // 북미 동부 (밀도 중간)
      else if (lat >= 25 && lat <= 50 && lng >= -100 && lng <= -60) {
        densityMap.set(location.id, 1.3); // 북미 동부는 1.3배 밀도
      }
      // 기타 지역
      else {
        densityMap.set(location.id, 1.0); // 기본 밀도
      }
    });

    return densityMap;
  }, []);

  // 거리 기반 클러스터링 함수 (메모화)
  const clusterLocations = useCallback(
    (locations: CountryData[], clusterDistance: number, currentZoomLevel: number): ClusterData[] => {
      // 매우 가까운 줌 (0.1 이하)에서는 클러스터링 완전 해제하여 개별 도시 표시
      if (currentZoomLevel <= 0.1 || clusterDistance <= 0) {
        return locations.map((location) => {
          return {
            id: `${location.id}_${location.lat}_${location.lng}`,
            name: location.name, // 개별 도시명 표시
            flag: location.flag,
            lat: location.lat,
            lng: location.lng,
            color: location.color,
            items: [location],
            count: 1,
            clusterType: "individual_city" as const,
          };
        });
      }

      const clusters: ClusterData[] = [];
      const processed = new Set<string>();
      const densityMap = calculateRegionDensity(locations);

      locations.forEach((location) => {
        const locationKey = `${location.id}_${location.lat}_${location.lng}`;
        if (processed.has(locationKey)) return;

        const nearbyLocations: CountryData[] = [location];
        processed.add(locationKey);

        // 지역 밀도에 따른 클러스터링 거리 조정
        const locationDensity = densityMap.get(location.id) || 1.0;
        const adjustedDistance = clusterDistance * locationDensity;

        // 주변 위치들 찾기 (줌 레벨에 따라 다른 로직)
        locations.forEach((otherLocation) => {
          const otherLocationKey = `${otherLocation.id}_${otherLocation.lat}_${otherLocation.lng}`;
          if (processed.has(otherLocationKey)) return;

          // 줌 레벨에 따른 클러스터링 조건
          let shouldCluster = false;

          if (currentZoomLevel >= 3.0) {
            // 디폴트 줌(3.0): 같은 대륙끼리만 클러스터링
            const sameContinent = getContinent(location.id) === getContinent(otherLocation.id);
            shouldCluster = sameContinent;
          } else {
            // 줌인 상태: 같은 국가끼리만 클러스터링 (최대 국가별)
            const sameCountry = location.id === otherLocation.id;
            shouldCluster = sameCountry;
          }

          if (!shouldCluster) return;

          const distance = Math.sqrt((location.lat - otherLocation.lat) ** 2 + (location.lng - otherLocation.lng) ** 2);

          if (distance <= adjustedDistance) {
            nearbyLocations.push(otherLocation);
            processed.add(otherLocationKey);
          }
        });

        if (nearbyLocations.length === 1) {
          // 단일 위치 처리: 같은 국가의 다른 도시들과 강제 클러스터링 시도
          const location = nearbyLocations[0];

          // 줌 레벨에 따른 클러스터링 조건으로 같은 그룹 위치들 찾기
          const sameGroupLocations = locations.filter((otherLocation) => {
            const otherLocationKey = `${otherLocation.id}_${otherLocation.lat}_${otherLocation.lng}`;
            if (processed.has(otherLocationKey)) return false;

            if (currentZoomLevel >= 3.0) {
              // 디폴트 줌: 같은 대륙
              return getContinent(location.id) === getContinent(otherLocation.id);
            } else {
              // 줌인 상태: 같은 국가만
              return location.id === otherLocation.id;
            }
          });

          if (sameGroupLocations.length > 1) {
            // 같은 그룹의 여러 위치들을 강제로 클러스터링
            sameGroupLocations.forEach((loc) => {
              const locKey = `${loc.id}_${loc.lat}_${loc.lng}`;
              processed.add(locKey);
            });

            const centerLat = sameGroupLocations.reduce((sum, loc) => sum + loc.lat, 0) / sameGroupLocations.length;
            const centerLng = sameGroupLocations.reduce((sum, loc) => sum + loc.lng, 0) / sameGroupLocations.length;

            // 줌 레벨에 따른 클러스터 이름 생성
            let clusterName: string;
            if (currentZoomLevel >= 3.0) {
              // 디폴트 줌: 대륙명 표시
              const countryIds = sameGroupLocations.map((loc) => loc.id);
              clusterName = getContinentClusterName(countryIds);
            } else {
              // 줌인 상태: 국가명 표시 (겹쳐진 도시가 있을 때만 숫자 표시)
              const countryName = getCountryName(location.id);
              if (sameGroupLocations.length > 1) {
                clusterName = `${countryName} +${sameGroupLocations.length}`;
              } else {
                clusterName = countryName;
              }
            }

            clusters.push({
              id: `group_cluster_${location.id}_${centerLat}_${centerLng}`,
              name: clusterName,
              flag: location.flag,
              lat: centerLat,
              lng: centerLng,
              color: location.color,
              items: sameGroupLocations,
              count: sameGroupLocations.length,
              clusterType: currentZoomLevel >= 3.0 ? "continent_cluster" : "country_cluster",
            });
          } else {
            // 진짜 단일 위치
            const displayName = currentZoomLevel >= 2.0 ? getCountryName(location.id) : location.name;
            clusters.push({
              id: `${location.id}_${location.lat}_${location.lng}`,
              name: displayName,
              flag: location.flag,
              lat: location.lat,
              lng: location.lng,
              color: location.color,
              items: nearbyLocations,
              count: 1,
              clusterType: currentZoomLevel >= 2.0 ? "country_cluster" : "individual_city",
            });
          }
        } else {
          // 여러 위치면 클러스터로 통합
          const centerLat = nearbyLocations.reduce((sum, loc) => sum + loc.lat, 0) / nearbyLocations.length;
          const centerLng = nearbyLocations.reduce((sum, loc) => sum + loc.lng, 0) / nearbyLocations.length;

          // 클러스터 이름 생성
          const countryIds = nearbyLocations.map((loc) => loc.id);
          const uniqueCountries = new Set(countryIds);

          // 가장 많은 국가의 플래그 사용
          const flagCounts = new Map<string, number>();
          nearbyLocations.forEach((loc) => {
            flagCounts.set(loc.flag, (flagCounts.get(loc.flag) || 0) + 1);
          });
          const mostCommonFlag = Array.from(flagCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

          // 줌 레벨에 따른 클러스터 이름 생성
          let clusterName: string;

          if (currentZoomLevel >= 3.0) {
            // 디폴트 줌: 대륙명 표시
            clusterName = getContinentClusterName(countryIds);
          } else {
            // 줌인 상태: 국가명 표시 (같은 국가면 국가명, 다른 국가면 대륙명)
            if (uniqueCountries.size === 1) {
              const countryCode = Array.from(uniqueCountries)[0];
              const countryName = getCountryName(countryCode);
              // 겹쳐진 도시가 있을 때만 숫자 표시
              if (nearbyLocations.length > 1) {
                clusterName = `${countryName} +${nearbyLocations.length}`;
              } else {
                clusterName = countryName;
              }
            } else {
              clusterName = getContinentClusterName(countryIds);
            }
          }

          clusters.push({
            id: `cluster_${location.id}_${centerLat}_${centerLng}`,
            name: clusterName,
            flag: mostCommonFlag,
            lat: centerLat,
            lng: centerLng,
            color: nearbyLocations[0].color,
            items: nearbyLocations,
            count: nearbyLocations.length,
            clusterType: currentZoomLevel >= 3.0 ? "continent_cluster" : "country_cluster",
          });
        }
      });

      return clusters;
    },
    [calculateRegionDensity],
  );

  // 클러스터 데이터 계산
  const clusters = useMemo(() => {
    // 선택된 클러스터 데이터가 있으면 사용, 없으면 전체 countries 사용
    const dataToCluster = selectedClusterData && selectedClusterData.length > 0 ? selectedClusterData : countries;

    console.log("줌 레벨 기반 클러스터링 시작:", dataToCluster.length, "줌 레벨:", zoomLevel);
    console.log("선택된 클러스터 데이터:", selectedClusterData ? "있음" : "없음");

    if (!dataToCluster || dataToCluster.length === 0) return [];

    // 단계적(계층형) 클러스터링: 선택 영역 + 중간 줌(≈0.5)에서는 나라 단위 클러스터링
    if (
      selectedClusterData &&
      selectedClusterData.length > 0 &&
      zoomLevel > 0.2 &&
      zoomLevel >= 0.3 &&
      zoomLevel <= 0.55
    ) {
      const grouped = new Map<string, CountryData[]>();
      dataToCluster.forEach((item) => {
        const key = item.flag || item.id;
        const arr = grouped.get(key) || [];
        arr.push(item);
        grouped.set(key, arr);
      });

      const countryClusters: ClusterData[] = Array.from(grouped.entries()).map(([key, items]) => {
        const centerLat = items.reduce((sum, loc) => sum + loc.lat, 0) / items.length;
        const centerLng = items.reduce((sum, loc) => sum + loc.lng, 0) / items.length;
        const groupFlag = items[0]?.flag || "";

        // 클러스터 이름 생성: 같은 국가면 국가명, 다른 국가면 대륙명
        const countryIds = items.map((item) => item.id);
        const uniqueCountries = new Set(countryIds);
        let clusterName: string;

        if (uniqueCountries.size === 1) {
          // 같은 국가의 여러 도시들
          const countryCode = Array.from(uniqueCountries)[0];
          const countryName = getCountryName(countryCode);
          clusterName = `${countryName} +${items.length}`;
        } else {
          // 다른 국가들 (대륙별)
          clusterName = getContinentClusterName(countryIds);
        }

        return {
          id: `country_${groupFlag || key}`,
          name: clusterName,
          flag: groupFlag,
          lat: centerLat,
          lng: centerLng,
          color: items[0]?.color || "#4a90e2",
          items,
          count: items.length,
          clusterType: "country_cluster" as const,
        };
      });

      console.log(`생성된 (나라) 클러스터: ${countryClusters.length}개`);
      return countryClusters;
    }

    const clusterDistance = getClusterDistance(zoomLevel);
    console.log("클러스터링 거리:", clusterDistance);

    const result = clusterLocations(dataToCluster, clusterDistance, zoomLevel);
    console.log(`생성된 클러스터: ${result.length}개`);

    return result;
  }, [countries, zoomLevel, selectedClusterData, clusterLocations, getClusterDistance]);

  // 상태 업데이트
  useEffect(() => {
    setClusteredData(clusters);
    console.log("클러스터 데이터 업데이트됨:", clusters.length, clusters);
  }, [clusters]);

  return {
    clusteredData,
    shouldShowClusters: true, // 항상 클러스터링 적용 (줌 레벨에 따라 거리만 조정)
  };
};
