// Globe 설정 상수
export const GLOBE_CONFIG = {
  WIDTH: 500, // 지구본 컴포넌트 너비 (px)
  HEIGHT: 500, // 지구본 컴포넌트 높이 (px)
  INITIAL_ALTITUDE: 2.5, // 초기 카메라 고도 (지구 반지름 배수)
  MIN_ZOOM: 0.3, // 최소 줌 레벨
  MAX_ZOOM: 3.0, // 최대 줌 레벨
  CLUSTER_ZOOM: 0.1, // 클러스터링이 활성화되는 줌 임계값
  FOCUS_ZOOM: 1.5, // 국가 포커스 시 줌 레벨
  MIN_DISTANCE: 50, // 클러스터링 최소 거리 (px)
  MAX_DISTANCE: 500, // 클러스터링 최대 거리 (px)
  ATMOSPHERE_ALTITUDE: 0.15, // 대기권 두께 (지구 반지름 배수)
  POLYGON_ALTITUDE: 0.01, // 국경선/폴리곤 높이 (지구 표면 기준)
  HTML_ALTITUDE: 0.01, // HTML 라벨 높이 (지구 표면 기준)
} as const;

// 라벨 오프셋 설정
export const LABEL_OFFSET = {
  X: 50, // 라벨 수평 오프셋 (px)
  Y: -30, // 라벨 수직 오프셋 (px)
} as const;

// 애니메이션 시간 (ms)
export const ANIMATION_DURATION = {
  CAMERA_MOVE: 1500, // 카메라 이동 애니메이션 시간
  INITIAL_SETUP: 1000, // 초기 설정 완료 대기 시간
  ZOOM_UPDATE_DELAY: 100, // 줌 업데이트 디바운스 시간
  SETUP_DELAY: 500, // 설정 지연 시간
} as const;

// 색상 설정
export const COLORS = {
  ATMOSPHERE: "#4a90e2", // 대기권 색상 (파란색)
  CLUSTER: "#4a90e2", // 클러스터 마커 색상
  CLUSTER_BG: "#2c3e50", // 클러스터 배경 색상 (어두운 회색)
  POLYGON_SIDE: "rgba(100,100,100,0.1)", // 폴리곤 측면 색상
  POLYGON_STROKE: "#fff", // 국경선 색상
  INACTIVE_POLYGON: "rgba(100, 100, 100, 0.02)", // 비활성 폴리곤 색상 (매우 연한 회색)
  WHITE_LABEL: "rgba(255,255,255,0.8)", // 흰색 라벨 텍스트 색상
  WHITE_BORDER: "rgba(255,255,255,0.6)", // 흰색 테두리 색상
} as const;

// ISO 코드 매핑 (국가 코드 표준화)
export const ISO_CODE_MAP: { [key: string]: string } = {
  JPN: "JPN", // 일본
  JPN2: "JPN", // 일본 (추가 코드)
  JPN3: "JPN", // 일본 (추가 코드)
  KOR: "KOR", // 한국
  TWN: "TWN", // 대만
  THA: "THA", // 태국
  SGP: "SGP", // 싱가포르
  USA: "USA", // 미국
  FRA: "FRA", // 프랑스
  EGY: "EGY", // 이집트
  BRA: "BRA", // 브라질
  AUS: "AUS", // 호주
  ITA: "ITA", // 이탈리아
  ESP: "ESP", // 스페인
  GBR: "GBR", // 영국
  DEU: "DEU", // 독일
  CHE: "CHE", // 스위스
} as const;

// 외부 리소스 URL
export const EXTERNAL_URLS = {
  // 세계 지도 GeoJSON 데이터 URL
  WORLD_GEOJSON:
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
  NIGHT_SKY_IMAGE: "//unpkg.com/three-globe/example/img/night-sky.png", // 배경 별하늘 이미지 URL
} as const;
