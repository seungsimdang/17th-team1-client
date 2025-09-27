// 클러스터링 관련 타입 정의
export interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

export interface ClusterData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
  items: CountryData[];
  count: number;
  clusterType?: "individual_city" | "country_cluster" | "continent_cluster";
  isExpanded?: boolean;
}

export interface ClusteringState {
  mode: "country" | "city" | "continent";
  expandedCountry: string | null;
  selectedCluster: string | null;
  clusteredData: ClusterData[];
  isZoomed: boolean;
  lastInteraction: number;
  clickBasedExpansion: boolean;
  rotationPosition: { lat: number; lng: number };
  lastSignificantRotation: number;
  isZoomAnimating: boolean; // 줌 애니메이션 중인지 여부
}

import type { GlobeInstance } from "globe.gl";

export interface UseCountryBasedClusteringProps {
  countries: CountryData[];
  zoomLevel: number;
  selectedClusterData?: CountryData[];
  globeRef: React.RefObject<GlobeInstance | null>;
  onSelectionStackChange?: (newStack: (CountryData[] | null)[]) => void;
}
