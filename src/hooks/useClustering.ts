"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

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
    if (zoom >= 2.0) return 8; // 매우 멀리서 볼 때는 큰 거리로 클러스터링
    if (zoom >= 1.5) return 6; // 멀리서 볼 때는 중간 거리로 클러스터링
    if (zoom >= 1.0) return 4; // 중간 거리에서 볼 때는 작은 거리로 클러스터링
    if (zoom >= 0.5) return 2; // 가까이서 볼 때는 매우 작은 거리로 클러스터링
    if (zoom >= 0.3) return 1.5; // 매우 가까이서 볼 때는 작은 거리로 클러스터링
    if (zoom >= 0.2) return 0; // 국가 단위로 분해 (개별 표시)
    if (zoom >= 0.1) return 0; // 더 가까워도 개별 표시 유지
    return 0; // 최대로 가까울 땐 항상 개별 표시
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
    (locations: CountryData[], clusterDistance: number): ClusterData[] => {
      if (clusterDistance <= 0) {
        // 클러스터링을 하지 않는 경우, 모든 위치를 개별적으로 반환
        return locations.map((location) => ({
          id: location.id,
          name: location.name,
          flag: location.flag,
          lat: location.lat,
          lng: location.lng,
          color: location.color,
          items: [location],
          count: 1,
        }));
      }

      const clusters: ClusterData[] = [];
      const processed = new Set<string>();
      const densityMap = calculateRegionDensity(locations);

      locations.forEach((location) => {
        if (processed.has(location.id)) return;

        const nearbyLocations: CountryData[] = [location];
        processed.add(location.id);

        // 지역 밀도에 따른 클러스터링 거리 조정
        const locationDensity = densityMap.get(location.id) || 1.0;
        const adjustedDistance = clusterDistance * locationDensity;

        // 주변 위치들 찾기
        locations.forEach((otherLocation) => {
          if (processed.has(otherLocation.id)) return;

          const distance = Math.sqrt(
            Math.pow(location.lat - otherLocation.lat, 2) +
            Math.pow(location.lng - otherLocation.lng, 2)
          );

          if (distance <= adjustedDistance) {
            nearbyLocations.push(otherLocation);
            processed.add(otherLocation.id);
          }
        });

        if (nearbyLocations.length === 1) {
          // 단일 위치면 그대로 유지
          clusters.push({
            id: nearbyLocations[0].id,
            name: nearbyLocations[0].name,
            flag: nearbyLocations[0].flag,
            lat: nearbyLocations[0].lat,
            lng: nearbyLocations[0].lng,
            color: nearbyLocations[0].color,
            items: nearbyLocations,
            count: 1,
          });
        } else {
          // 여러 위치면 클러스터로 통합
          const centerLat =
            nearbyLocations.reduce((sum, loc) => sum + loc.lat, 0) / nearbyLocations.length;
          const centerLng =
            nearbyLocations.reduce((sum, loc) => sum + loc.lng, 0) / nearbyLocations.length;

          // 클러스터 이름 생성 (가장 많은 국가의 플래그 사용)
          const flagCounts = new Map<string, number>();
          nearbyLocations.forEach((loc) => {
            flagCounts.set(loc.flag, (flagCounts.get(loc.flag) || 0) + 1);
          });
          const mostCommonFlag = Array.from(flagCounts.entries())
            .sort((a, b) => b[1] - a[1])[0][0];

          clusters.push({
            id: `cluster_${location.id}`,
            name: `${mostCommonFlag} ${nearbyLocations.length}개 지역`,
            flag: mostCommonFlag,
            lat: centerLat,
            lng: centerLng,
            color: nearbyLocations[0].color,
            items: nearbyLocations,
            count: nearbyLocations.length,
          });
        }
      });

      return clusters;
    },
    [calculateRegionDensity]
  );

  // 클러스터 데이터 계산
  const clusters = useMemo(() => {
    // 선택된 클러스터 데이터가 있으면 사용, 없으면 전체 countries 사용
    const dataToCluster = selectedClusterData && selectedClusterData.length > 0 ? selectedClusterData : countries;
    
    console.log("줌 레벨 기반 클러스터링 시작:", dataToCluster.length, "줌 레벨:", zoomLevel);
    console.log("선택된 클러스터 데이터:", selectedClusterData ? "있음" : "없음");

    if (!dataToCluster || dataToCluster.length === 0) return [];

    // 단계적(계층형) 클러스터링: 선택 영역 + 중간 줌(≈0.5)에서는 나라 단위 클러스터링
    if (selectedClusterData && selectedClusterData.length > 0 && zoomLevel > 0.2 && zoomLevel >= 0.3 && zoomLevel <= 0.55) {
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
        const groupFlag = items[0]?.flag || '';
        return {
          id: `country_${groupFlag || key}`,
          name: `${groupFlag} ${items.length}개 지역`,
          flag: groupFlag,
          lat: centerLat,
          lng: centerLng,
          color: items[0]?.color || '#4a90e2',
          items,
          count: items.length,
        };
      });

      console.log(`생성된 (나라) 클러스터: ${countryClusters.length}개`);
      return countryClusters;
    }

    const clusterDistance = getClusterDistance(zoomLevel);
    console.log("클러스터링 거리:", clusterDistance);

    const result = clusterLocations(dataToCluster, clusterDistance);
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
