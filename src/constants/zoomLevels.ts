/**
 * Globe 줌 레벨 상수 정의
 * 클러스터링, 렌더링, 상태 관리에서 사용되는 모든 줌 레벨 임계값
 */

// 기본 줌 레벨
export const ZOOM_LEVELS = {
  // 초기/기본 줌 레벨
  DEFAULT: 2.5,

  // 줌 상태 판단 기준
  ZOOM_THRESHOLD: 2.4, // 이보다 작으면 줌인된 상태

  // 클러스터링 거리 계산용 줌 레벨
  CLUSTERING: {
    VERY_FAR: 2.0, // 매우 멀리서 볼 때 - 가까운 국가들만 클러스터링
    FAR: 1.5, // 멀리서 볼 때 - 중간 거리로 클러스터링
    MEDIUM: 1.0, // 중간 거리에서 볼 때 - 작은 거리로 클러스터링
    CLOSE: 0.5, // 가까이서 볼 때 - 매우 작은 거리로 클러스터링
    VERY_CLOSE: 0.3, // 매우 가까이서 볼 때 - 작은 거리로 클러스터링
    ZOOMED_IN: 0.2, // 줌인 상태에서도 같은 국가 클러스터링 유지
    DETAILED: 0.1, // 더 가까워도 같은 국가는 클러스터링
  },

  // 렌더링 관련 줌 레벨
  RENDERING: {
    CITY_LEVEL: 0.2, // 도시 단계 렌더링 기준
    COUNTRY_MIN: 0.3, // 국가 레벨 최소 줌
    COUNTRY_MAX: 0.55, // 국가 레벨 최대 줌
  },

  // 기타 줌 관련 임계값
  THRESHOLDS: {
    ZOOM_DETECTION: 0.01, // 줌 변화 감지 임계값
  },
} as const;

// 클러스터링 거리 매핑
export const CLUSTERING_DISTANCE_MAP = {
  [ZOOM_LEVELS.CLUSTERING.VERY_FAR]: 12,
  [ZOOM_LEVELS.CLUSTERING.FAR]: 8,
  [ZOOM_LEVELS.CLUSTERING.MEDIUM]: 5,
  [ZOOM_LEVELS.CLUSTERING.CLOSE]: 3,
  [ZOOM_LEVELS.CLUSTERING.VERY_CLOSE]: 2,
  [ZOOM_LEVELS.CLUSTERING.ZOOMED_IN]: 1.5,
  [ZOOM_LEVELS.CLUSTERING.DETAILED]: 1,
} as const;

// 렌더링용 그룹 반지름
export const GROUP_RADIUS = {
  CITY_LEVEL: 120, // 도시 단계에서 타이트하게
  DEFAULT: 140, // 기본 반지름
} as const;

// 브라우저 뷰포트 기본값
export const VIEWPORT_DEFAULTS = {
  WIDTH: 600,
  HEIGHT: 800,
} as const;

// 타입 정의
export type ZoomLevel = typeof ZOOM_LEVELS;
export type ClusteringDistance = typeof CLUSTERING_DISTANCE_MAP;
export type GroupRadius = typeof GROUP_RADIUS;
export type ViewportDefaults = typeof VIEWPORT_DEFAULTS;
