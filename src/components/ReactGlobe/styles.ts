import { LABEL_OFFSET, COLORS } from "./constants";
import { calculateDottedLine } from "./utils";

// 개별 라벨 스타일 생성
// styles.ts
export const createSingleLabelStyles = (
  d: any,
  index: number = 0,
  angleOffset: number = 0
) => {
  const distance = 50; // 중심점에서의 거리

  // 기본 각도 + 오프셋 각도
  const baseAngles = [0, 45, 90, 135, 180, 225, 270, 315]; // 8방향
  const baseAngle = baseAngles[index % baseAngles.length];
  const finalAngle = (baseAngle + angleOffset) % 360;

  // 각도를 라디안으로 변환
  const radians = (finalAngle * Math.PI) / 180;

  // x, y 좌표 계산
  const offsetX = Math.cos(radians) * distance;
  const offsetY = Math.sin(radians) * distance;

  const { lineLength, angle } = calculateDottedLine(offsetX, offsetY);

  return {
    centerPoint: `
      position: absolute;
      top: -3px;
      left: -3px;
      width: 6px;
      height: 6px;
      background-color: rgba(255,255,255,0.9);
      border: 2px solid ${COLORS.WHITE_BORDER};
      border-radius: 50%;
      z-index: 10;
    `,
    dottedLine: `
      position: absolute;
      top: 0;
      left: 0;
      width: ${lineLength}px;
      height: 2px;
      background: repeating-linear-gradient(
        to right,
        rgba(255,255,255,0.8) 0px,
        rgba(255,255,255,0.8) 4px,
        transparent 4px,
        transparent 8px
      );
      transform: rotate(${angle}deg);
      transform-origin: 0 1px;
      z-index: 5;
    `,
    label: `
      background-color: white;
      color: #333;
      padding: 8px 16px;
      border-radius: 25px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: none;
      text-align: center;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      min-width: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      pointer-events: auto;
      position: absolute;
      z-index: ${20 + index};
      top: ${offsetY}px;
      left: ${offsetX}px;
      transform: translate(-50%, -50%);
      white-space: nowrap;
    `,
  };
};

// 클러스터 라벨 스타일 생성
export const createClusterLabelStyles = (d: any) => {
  const { lineLength, angle } = calculateDottedLine();

  return {
    centerPoint: `
      position: absolute;
      top: -3px;
      left: -3px;
      width: 6px;
      height: 6px;
      background-color: ${COLORS.CLUSTER};
      border-radius: 50%;
      z-index: 10;
    `,
    dottedLine: `
      position: absolute;
      top: 0;
      left: 0;
      width: ${lineLength}px;
      height: 2px;
      background: linear-gradient(to right, ${COLORS.CLUSTER} 50%, transparent 50%);
      background-size: 8px 2px;
      transform: rotate(${angle}deg);
      transform-origin: 0 1px;
      z-index: 5;
    `,
    label: `
      background-color: ${COLORS.CLUSTER_BG};
      color: white;
      padding: 10px 18px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 6px 16px rgba(0,0,0,0.4);
      border: 2px solid ${COLORS.CLUSTER};
      text-align: center;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      min-width: 100px;
      pointer-events: auto;
      position: absolute;
      z-index: 2;
      top: ${LABEL_OFFSET.Y}px;
      left: ${LABEL_OFFSET.X}px;
      transform: translateY(-50%);
      white-space: nowrap;
    `,
  };
};
