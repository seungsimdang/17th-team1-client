import { ISO_CODE_MAP, LABEL_OFFSET, COLORS } from './constants';

// ISO 코드 변환 유틸리티
export const getISOCode = (countryId: string): string => {
  return ISO_CODE_MAP[countryId] || countryId;
};

// 점선 각도 및 길이 계산
export const calculateDottedLine = (
  offsetX: number = LABEL_OFFSET.X,
  offsetY: number = LABEL_OFFSET.Y
) => {
  const lineLength = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
  const angle = (Math.atan2(offsetY, offsetX) * 180) / Math.PI;
  return { lineLength, angle };
};

// 폴리곤 색상 계산
export const getPolygonColor = (
  feature: any,
  countries: any[],
  selectedCountry: string | null,
  getISOCode: (id: string) => string
) => {
  const isoCode = feature.id;
  const countryData = countries.find((c: any) => getISOCode(c.id) === isoCode);

  if (!countryData) return COLORS.INACTIVE_POLYGON;

  const isSelected =
    selectedCountry &&
    countries.find(
      (c) => c.id === selectedCountry && getISOCode(c.id) === isoCode
    );

  return isSelected ? countryData.color : `${countryData.color}44`;
};

// 폴리곤 레이블 생성
export const getPolygonLabel = (
  feature: any,
  countries: any[],
  getISOCode: (id: string) => string
): string => {
  const isoCode = feature.properties?.ISO_A3 || feature.id;
  const countryData = countries.find((c: any) => getISOCode(c.id) === isoCode);
  return countryData ? `${countryData.flag} ${countryData.name}` : '';
};

// 브라우저 줌 방지 이벤트 리스너
export const createZoomPreventListeners = () => {
  const preventZoom = (e: WheelEvent) => {
    if (e.ctrlKey) e.preventDefault();
  };

  const preventKeyboardZoom = (e: KeyboardEvent) => {
    if (
      e.ctrlKey &&
      (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')
    ) {
      e.preventDefault();
    }
  };

  const preventTouchZoom = (e: TouchEvent) => {
    if (e.touches.length > 1) e.preventDefault();
  };

  return { preventZoom, preventKeyboardZoom, preventTouchZoom };
};
