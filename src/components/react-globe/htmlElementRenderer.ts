import { ANIMATION_DURATION, GLOBE_CONFIG } from "@/constants/globe";
import { GROUP_RADIUS, ZOOM_LEVELS } from "@/constants/zoomLevels";
import { createClusterLabelStyles } from "@/styles/globeStyles";
import * as THREE from "three";

interface RenderElementParams {
  d: any;
  htmlElements: any[];
  zoomLevel: number;
  globeRef: React.RefObject<any>;
  displayPhase: "root" | "country" | "city";
  isAnimating: boolean;
  phaseTargetRef: React.MutableRefObject<"root" | "country" | "city" | null>;
  setActiveCountryFlag: (flag: string | null) => void;
  activeCountryFlagRef: React.MutableRefObject<string | null>;
  setActiveCountryItemIdList: (ids: string[] | null) => void;
  setDisplayPhase: (phase: "root" | "country" | "city") => void;
  setIsAnimating: (animating: boolean) => void;
  onClusterSelect?: (cluster: any) => void;
  onZoomChange: (zoom: number) => void;
  onCountrySelect: (countryId: string | null) => void;
}

// 화면 좌표 계산 함수
export const calculateScreenPosition = (lat: number, lng: number, globeRef: React.RefObject<any>) => {
  if (!globeRef.current) return { x: 0, y: 0 };

  // Globe 내부 Three.js 카메라 정보 접근
  const globe = globeRef.current;
  const camera = globe.camera();
  const renderer = globe.renderer();

  // 위도/경도를 3D 좌표로 변환
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const radius = 100; // Globe 반지름

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  // 3D 좌표를 화면 좌표로 투영
  const vector = new THREE.Vector3(x, y, z);
  vector.project(camera);

  const screenX = (vector.x * renderer.domElement.width) / 2 + renderer.domElement.width / 2;
  const screenY = -(vector.y * renderer.domElement.height) / 2 + renderer.domElement.height / 2;

  return { x: screenX, y: screenY };
};

// 라벨 위치 계산 함수
export const calculateLabelPosition = (
  d: any,
  htmlElements: any[],
  zoomLevel: number,
  globeRef: React.RefObject<any>,
) => {
  const currentPos = calculateScreenPosition(d.lat, d.lng, globeRef);

  // 주변 라벨들을 그룹핑하여 균등 각도 배치
  const groupRadius = zoomLevel <= ZOOM_LEVELS.RENDERING.CITY_LEVEL ? GROUP_RADIUS.CITY_LEVEL : GROUP_RADIUS.DEFAULT; // 도시단계에서 조금 더 타이트하게
  const neighbors = htmlElements
    .filter((other) => {
      const otherPos = calculateScreenPosition(other.lat, other.lng, globeRef);
      const distance = Math.sqrt((currentPos.x - otherPos.x) ** 2 + (currentPos.y - otherPos.y) ** 2);
      return distance < groupRadius;
    })
    .sort((a, b) => {
      // 안정적인 순서를 위해 id 기준 정렬
      const aId = String(a.id);
      const bId = String(b.id);
      return aId < bId ? -1 : aId > bId ? 1 : 0;
    });

  const groupSize = Math.max(neighbors.length, 1);
  const myGroupIndex = Math.max(
    neighbors.findIndex((item) => item.id === d.id),
    0,
  );
  const angleStep = 360 / groupSize;
  // 도시(개별) 라벨 단계에서는 거리도 동적 조정 (혼잡할수록 더 밖으로 배치)
  const isCityLevel = d.count === 1;
  // 기본 각도 분배 + 미세 분산(jitter)로 겹침 감소
  const jitter = myGroupIndex % 2 === 0 ? -8 : 8;
  const angleOffset = (myGroupIndex * angleStep + jitter + 360) % 360;
  // 혼잡할수록 더 멀리 라벨을 배치해 겹침 해소
  const dynamicDistance = isCityLevel
    ? Math.min(220, 90 + groupSize * 10) // 90~220px
    : Math.min(260, 120 + groupSize * 12); // 120~260px

  return { angleOffset, dynamicDistance, currentPos, isCityLevel };
};

// 화면 경계 제한 계산
export const calculateClampedDistance = (
  dynamicDistance: number,
  angleOffset: number,
  currentPos: { x: number; y: number },
  labelIndex: number,
  isCityLevel: boolean,
  globeRef: React.RefObject<any>,
) => {
  let clampedDistance = dynamicDistance;
  try {
    const renderer = globeRef.current?.renderer?.() || globeRef.current?.renderer?.();
    const width = renderer?.domElement?.width ?? window.innerWidth;
    const height = renderer?.domElement?.height ?? window.innerHeight;
    const margin = 16; // 화면 여백

    const baseAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    const baseAngle = baseAngles[labelIndex % baseAngles.length];
    const finalAngleDeg = (baseAngle + angleOffset) % 360;
    const radians = (finalAngleDeg * Math.PI) / 180;
    const ux = Math.cos(radians);
    const uy = Math.sin(radians);

    const minX = margin;
    const maxX = width - margin;
    const minY = margin;
    const maxY = height - margin;

    const maxDistX = Math.abs(ux) < 1e-4 ? Infinity : ux > 0 ? (maxX - currentPos.x) / ux : (minX - currentPos.x) / ux;
    const maxDistY = Math.abs(uy) < 1e-4 ? Infinity : uy > 0 ? (maxY - currentPos.y) / uy : (minY - currentPos.y) / uy;

    const maxAllowed = Math.max(0, Math.min(maxDistX, maxDistY));
    const minBaseline = isCityLevel ? 80 : 110;
    clampedDistance = Math.max(Math.min(dynamicDistance, maxAllowed), minBaseline);
  } catch {}

  return clampedDistance;
};

// 개별 도시 HTML 생성
export const createCityHTML = (d: any, styles: any, displayFlag: string, cityName: string) => {
  return `
    <div style="${styles.centerPoint}"></div>
    <div style="${styles.dottedLine}"></div>
    <div style="${styles.label}
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(148,203,255,0.2);
      border-radius: 50px;
      padding: 8px 12px;
      backdrop-filter: blur(8px);
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      position: relative;
      pointer-events: auto;
      width: max-content;
    ">
      <!-- 좌측 국기 이모지 -->
      <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${displayFlag}</span>
      <!-- 도시명 -->
      <span style="
        color: #ffffff;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 15px;
        font-weight: 500;
        line-height: 19px;
        white-space: nowrap;
      ">
        ${cityName}
      </span>
    </div>
  `;
};

// 대륙 클러스터 HTML 생성
export const createContinentHTML = (d: any, styles: any) => {
  return `
    <div style="${styles.centerPoint}"></div>
    <div style="${styles.dottedLine}"></div>
    <div style="${styles.label}
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50px;
      padding: 12px 16px;
      backdrop-filter: blur(8px);
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: max-content;
      pointer-events: auto;
    ">
      <span style="
        color: #ffffff;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 16px;
        font-weight: 500;
        line-height: 20px;
        white-space: nowrap;
      ">
        ${d.name}
      </span>
    </div>
  `;
};

// 국가 클러스터 HTML 생성
export const createCountryHTML = (
  d: any,
  styles: any,
  countryName: string,
  countNumber: string | null,
  flagEmoji: string,
) => {
  return `
    <div style="${styles.centerPoint}"></div>
    <div style="${styles.dottedLine}"></div>
    <div style="${styles.label}
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(148,203,255,0.2);
      border-radius: 50px;
      padding: 8px 12px;
      backdrop-filter: blur(8px);
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      position: relative;
      pointer-events: auto;
      width: max-content;
    ">
      <!-- 좌측 국기 이모지 -->
      <span style="font-size: 16px; line-height: 16px; pointer-events: none;">${flagEmoji}</span>
      <!-- 국가명 -->
      <span style="
        color: #ffffff;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 15px;
        font-weight: 500;
        line-height: 19px;
        white-space: nowrap;
      ">
        ${countryName}
      </span>
      <!-- 숫자 뱃지 (겹쳐진 도시가 있을 때만 표시) -->
      ${
        countNumber
          ? `
        <div style="
          background: rgba(89, 190, 229, 0.5);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <span style="
            color: #ffffff;
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 12px;
            font-weight: 500;
            line-height: 15px;
            text-align: center;
          ">
            ${countNumber}
          </span>
        </div>
      `
          : ""
      }
    </div>
  `;
};

// 클릭 핸들러 생성
export const createClickHandler = (params: RenderElementParams) => {
  const {
    d,
    globeRef,
    setActiveCountryFlag,
    activeCountryFlagRef,
    setActiveCountryItemIdList,
    setDisplayPhase,
    setIsAnimating,
    onClusterSelect,
    phaseTargetRef,
    isAnimating,
    displayPhase,
    onZoomChange,
    onCountrySelect,
  } = params;

  return (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (!globeRef.current) return;

    // 클러스터 타입으로 개별 도시인지 판단
    if (d.clusterType === "individual_city") {
      // 개별 도시 클러스터 클릭 시 - 바로 image-metadata로 이동
      const cityName = d.items && d.items[0]?.name ? d.items[0].name.split(",")[0] : d.name.split(",")[0];
      if (cityName) {
        const q = encodeURIComponent(cityName);
        window.location.href = `/image-metadata?city=${q}`;
        return;
      }
    }

    const targetLat = d.lat;
    const targetLng = d.lng;

    if (d.count > 1 && d.items && d.items.length > 1) {
      // 클러스터 클릭 시
      const uniqueFlags = new Set((d.items || []).map((it: any) => it.flag));
      const isMultiCountry = uniqueFlags.size > 1;

      // 상태 업데이트를 먼저 실행
      if (isMultiCountry) {
        setActiveCountryFlag(null);
        activeCountryFlagRef.current = null;
        setActiveCountryItemIdList(null);
        setDisplayPhase("country");
      } else if (d.flag) {
        setActiveCountryFlag(d.flag);
        activeCountryFlagRef.current = d.flag;
        const ids = (d.items || []).map((it: any) => it.id);
        setActiveCountryItemIdList(ids);
        setDisplayPhase("city");
      }

      // 클러스터 선택 콜백 호출
      if (onClusterSelect) {
        onClusterSelect(d);
      }

      // 타겟 줌 레벨 및 목표 phase 결정
      const targetAltitude = isMultiCountry ? GLOBE_CONFIG.CLUSTER_ZOOM_STAGE1 : GLOBE_CONFIG.CLUSTER_ZOOM;
      phaseTargetRef.current = isMultiCountry ? "country" : "city";

      // 애니메이션 중에는 기존 phase 유지 → 깜빡임 방지
      setIsAnimating(true);
      globeRef.current.pointOfView(
        {
          lat: targetLat,
          lng: targetLng,
          altitude: targetAltitude,
        },
        ANIMATION_DURATION.CAMERA_MOVE,
      );
      setTimeout(() => {
        setIsAnimating(false);
        if (phaseTargetRef.current) {
          setDisplayPhase(phaseTargetRef.current);
        }
        phaseTargetRef.current = null;
        onZoomChange(targetAltitude);
      }, ANIMATION_DURATION.CAMERA_MOVE + 30);
    } else {
      // 기존 로직 (개별 나라 클릭 시)
      if (d.flag) {
        setActiveCountryFlag(d.flag);
        activeCountryFlagRef.current = d.flag;
        if (d.items && d.items.length === 1) {
          setActiveCountryItemIdList([d.items[0].id]);
        }
      }

      // 부드러운 카메라 이동: 목표 phase/zoom을 애니 종료 시 반영
      phaseTargetRef.current = "city";
      globeRef.current.pointOfView(
        {
          lat: targetLat,
          lng: targetLng,
          altitude: GLOBE_CONFIG.FOCUS_ZOOM,
        },
        ANIMATION_DURATION.CAMERA_MOVE,
      );
      setTimeout(() => {
        setDisplayPhase("city");
        phaseTargetRef.current = null;
        onZoomChange(GLOBE_CONFIG.FOCUS_ZOOM);
      }, ANIMATION_DURATION.CAMERA_MOVE + 30);

      // 나라 선택
      const countryId = d.items && d.items.length === 1 ? d.items[0].id : d.id;
      onCountrySelect(countryId);
    }
  };
};

// 메인 HTML 요소 렌더링 함수
export const renderHtmlElement = (params: RenderElementParams): HTMLElement => {
  const { d, htmlElements, zoomLevel, globeRef } = params;

  if (typeof window === "undefined" || !document) {
    // SSR 환경에서는 빈 div 반환
    const el = document.createElement("div");
    el.style.display = "none";
    return el;
  }

  const el = document.createElement("div");
  // ensure positioned container so absolute children (+ button) place correctly
  el.style.position = "relative";
  el.style.zIndex = "999";
  el.style.pointerEvents = "auto";
  // anchor the origin exactly at the geo point regardless of zoom
  el.style.width = "0px";
  el.style.height = "0px";
  el.style.overflow = "visible";
  el.style.margin = "0";
  el.style.padding = "0";
  el.style.position = "relative";
  el.style.pointerEvents = "auto";

  const labelIndex = htmlElements.findIndex((item) => item.id === d.id);
  const { angleOffset, dynamicDistance, currentPos, isCityLevel } = calculateLabelPosition(
    d,
    htmlElements,
    zoomLevel,
    globeRef,
  );

  const clampedDistance = calculateClampedDistance(
    dynamicDistance,
    angleOffset,
    currentPos,
    labelIndex,
    isCityLevel,
    globeRef,
  );

  if (d.clusterType === "individual_city") {
    const baseItem = d.items && d.items.length === 1 ? d.items[0] : d;
    const displayFlag = baseItem.flag ?? d.flag;
    const cityName = (baseItem.name ?? d.name).split(",")[0];
    const styles = createClusterLabelStyles(labelIndex, angleOffset, clampedDistance);

    el.innerHTML = createCityHTML(d, styles, displayFlag, cityName);
  } else {
    const styles = createClusterLabelStyles(labelIndex, angleOffset, clampedDistance);

    // 대륙 클러스터인지 국가 클러스터인지 판단 (클러스터 이름으로 구분)
    const isContinentCluster =
      d.name.includes("아시아") ||
      d.name.includes("유럽") ||
      d.name.includes("북아메리카") ||
      d.name.includes("남아메리카") ||
      d.name.includes("오세아니아") ||
      d.name.includes("아프리카") ||
      d.name.includes("개국");

    if (isContinentCluster) {
      el.innerHTML = createContinentHTML(d, styles);
    } else {
      // 국가 클러스터: 새로운 컴팩트 디자인 (개별/겹치는 국가 모두 동일)
      const nameAndCount = d.name.split(" +");
      const countryName = nameAndCount[0];
      const countNumber = nameAndCount.length > 1 ? nameAndCount[1] : null;
      const flagEmoji = d.flag || (d.items && d.items[0]?.flag) || "";

      el.innerHTML = createCountryHTML(d, styles, countryName, countNumber, flagEmoji);
    }
  }

  const handleClick = createClickHandler(params);

  el.addEventListener("click", handleClick);
  el.addEventListener("mousedown", handleClick);
  el.onclick = handleClick;

  return el;
};
