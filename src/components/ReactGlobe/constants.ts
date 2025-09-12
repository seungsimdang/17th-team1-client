// Globe 설정 상수
export const GLOBE_CONFIG = {
  WIDTH: 500,
  HEIGHT: 500,
  INITIAL_ALTITUDE: 2.5,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 5.0,
  CLUSTER_ZOOM: 0.8,
  FOCUS_ZOOM: 1.5,
  MIN_DISTANCE: 50,
  MAX_DISTANCE: 500,
  ATMOSPHERE_ALTITUDE: 0.15,
  POLYGON_ALTITUDE: 0.01,
  HTML_ALTITUDE: 0.01,
} as const;

// 라벨 오프셋 설정
export const LABEL_OFFSET = {
  X: 50,
  Y: -30,
} as const;

// 애니메이션 시간
export const ANIMATION_DURATION = {
  CAMERA_MOVE: 1500,
  INITIAL_SETUP: 1000,
  ZOOM_UPDATE_DELAY: 100,
  SETUP_DELAY: 500,
} as const;

// 색상 설정
export const COLORS = {
  ATMOSPHERE: '#4a90e2',
  CLUSTER: '#4a90e2',
  CLUSTER_BG: '#2c3e50',
  POLYGON_SIDE: 'rgba(0, 100, 0, 0.15)',
  POLYGON_STROKE: 'rgba(255, 255, 255, 0.5)',
  INACTIVE_POLYGON: 'rgba(100, 100, 100, 0.02)',
  WHITE_LABEL: 'rgba(255,255,255,0.8)',
  WHITE_BORDER: 'rgba(255,255,255,0.6)',
} as const;

// ISO 코드 매핑
export const ISO_CODE_MAP: { [key: string]: string } = {
  JPN: 'JPN',
  JPN2: 'JPN',
  JPN3: 'JPN',
  KOR: 'KOR',
  TWN: 'TWN',
  THA: 'THA',
  SGP: 'SGP',
  USA: 'USA',
  FRA: 'FRA',
  EGY: 'EGY',
  BRA: 'BRA',
  AUS: 'AUS',
  ITA: 'ITA',
  ESP: 'ESP',
  GBR: 'GBR',
  DEU: 'DEU',
  CHE: 'CHE',
} as const;

// 외부 리소스 URL
export const EXTERNAL_URLS = {
  WORLD_GEOJSON:
    'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
  NIGHT_SKY_IMAGE: '//unpkg.com/three-globe/example/img/night-sky.png',
} as const;
