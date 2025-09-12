'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

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
    (locations: CountryData[], distance: number): ClusterData[] => {
      const clusters: ClusterData[] = [];
      const processed = new Set<number>();

      locations.forEach((location, index) => {
        if (processed.has(index)) return;

        const cluster: ClusterData = {
          id: location.id,
          name: location.name,
          flag: location.flag,
          lat: location.lat,
          lng: location.lng,
          color: location.color,
          items: [location],
          count: 1,
        };

        // 주변의 가까운 위치들을 클러스터에 추가
        locations.forEach((otherLocation, otherIndex) => {
          if (otherIndex === index || processed.has(otherIndex)) return;

          const dist = Math.sqrt(
            Math.pow(location.lat - otherLocation.lat, 2) +
              Math.pow(location.lng - otherLocation.lng, 2)
          );

          if (dist < distance) {
            cluster.items.push(otherLocation);
            cluster.count++;
            processed.add(otherIndex);

            // 클러스터 중심점 재계산
            const totalLat = cluster.items.reduce(
              (sum, item) => sum + item.lat,
              0
            );
            const totalLng = cluster.items.reduce(
              (sum, item) => sum + item.lng,
              0
            );
            cluster.lat = totalLat / cluster.items.length;
            cluster.lng = totalLng / cluster.items.length;
          }
        });

        processed.add(index);
        clusters.push(cluster);
      });

      return clusters;
    },
    []
  );

  // 줌 레벨에 따른 클러스터링 거리 계산 (메모화)
  const getClusterDistance = useCallback((zoom: number): number => {
    if (zoom > 6) return 50; // 매우 멀리 - 최강 클러스터링
    if (zoom > 5) return 40; // 멀리 - 강한 클러스터링
    if (zoom > 4) return 30; // 중간 거리 - 중간 클러스터링
    if (zoom > 3) return 20; // 가까이 - 약한 클러스터링
    if (zoom > 2) return 15; // 더 가까이 - 매우 약한 클러스터링
    if (zoom > 1.5) return 10; // 매우 가까이 - 최소 클러스터링
    return 0; // 극도로 가까이 - 클러스터링 해제
  }, []);

  // 클러스터 데이터 계산
  const clusters = useMemo(() => {
    console.log('🎯 줌 레벨 변경됨:', zoomLevel);

    // countries 배열이 비어있으면 빈 배열 반환
    if (!countries || countries.length === 0) {
      return [];
    }

    // 줌 레벨이 너무 높으면 (너무 멀리서 보면) 빈 배열 반환
    if (zoomLevel > 10) {
      console.log('줌 레벨이 너무 높음. 클러스터 숨김');
      return [];
    }

    const clusterDistance = getClusterDistance(zoomLevel);
    console.log(`클러스터 거리: ${clusterDistance}`);

    const result = clusterLocations(countries, clusterDistance);
    console.log(`생성된 클러스터: ${result.length}개`);

    return result;
  }, [countries, zoomLevel, clusterLocations, getClusterDistance]);

  // 상태 업데이트
  useEffect(() => {
    setClusteredData(clusters);
    console.log('클러스터 데이터 업데이트됨:', clusters.length, clusters);
  }, [clusters]);

  return {
    clusteredData,
    shouldShowClusters: zoomLevel <= 10,
  };
};
