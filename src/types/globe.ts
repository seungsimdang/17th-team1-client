export interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

export interface TravelPattern {
  title: string;
  subtitle: string;
  countries: CountryData[];
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
}

export interface ReactGlobeProps {
  travelPatterns: TravelPattern[];
  currentGlobeIndex: number;
  selectedCountry: string | null;
  onCountrySelect: (countryId: string | null) => void;
  onZoomChange: (zoomLevel: number) => void;
  onClusterSelect?: (cluster: ClusterData) => void;
  clusteredData: ClusterData[];
  shouldShowClusters: boolean;
  zoomLevel: number;
  selectedClusterData?: CountryData[];
  snapZoomTo?: number | null;
}
