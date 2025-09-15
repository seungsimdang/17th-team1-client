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
}

export const useClustering = ({ countries, zoomLevel }: UseClusteringProps) => {
  const [clusteredData, setClusteredData] = useState<ClusterData[]>([]);

  // 거리 기반 클러스터링 함수 (메모화)
  const clusterLocations = useCallback(
    (locations: CountryData[]): ClusterData[] => {
      const clusters: ClusterData[] = [];
      const countryGroups = new Map<string, CountryData[]>();

      // 같은 국가끼리 그룹화
      locations.forEach((location) => {
        const countryFlag = location.flag;
        if (!countryGroups.has(countryFlag)) {
          countryGroups.set(countryFlag, []);
        }
        countryGroups.get(countryFlag)!.push(location);
      });

      // 각 국가별로 클러스터 생성
      countryGroups.forEach((cities, flag) => {
        if (cities.length === 1) {
          // 단일 도시면 그대로 유지
          clusters.push({
            id: cities[0].id,
            name: cities[0].name,
            flag: cities[0].flag,
            lat: cities[0].lat,
            lng: cities[0].lng,
            color: cities[0].color,
            items: cities,
            count: 1,
          });
        } else {
          // 여러 도시면 클러스터로 통합
          const centerLat =
            cities.reduce((sum, city) => sum + city.lat, 0) / cities.length;
          const centerLng =
            cities.reduce((sum, city) => sum + city.lng, 0) / cities.length;

          const countryName = cities[0].name.split(",")[1]?.trim() || "국가";

          clusters.push({
            id: `cluster_${flag}`,
            name: `${flag} ${countryName} ${cities.length}개 도시`,
            flag: cities[0].flag,
            lat: centerLat,
            lng: centerLng,
            color: cities[0].color,
            items: cities,
            count: cities.length,
          });
        }
      });

      return clusters;
    },
    []
  );

  // 클러스터 데이터 계산
  const clusters = useMemo(() => {
    console.log("국가별 클러스터링 시작:", countries.length);

    if (!countries || countries.length === 0) return [];

    const result = clusterLocations(countries);
    console.log(`생성된 클러스터: ${result.length}개`);

    return result;
  }, [countries, clusterLocations]);

  // 상태 업데이트
  useEffect(() => {
    setClusteredData(clusters);
    console.log("클러스터 데이터 업데이트됨:", clusters.length, clusters);
  }, [clusters]);

  return {
    clusteredData,
    shouldShowClusters: zoomLevel <= 10,
  };
};
