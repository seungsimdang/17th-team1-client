interface GlobeHeaderProps {
  isZoomed: boolean;
}

export const GlobeHeader = ({ isZoomed }: GlobeHeaderProps) => {
  return (
    <div className={`text-center pt-8 pb-4 transition-opacity duration-500 ${isZoomed ? "opacity-0" : "opacity-100"}`}>
      <div className="inline-flex items-center rounded-full px-4 py-2 text-xs font-bold mb-3 bg-surface-inverseprimary text-text-inverseprimary">
        AI 인사이트 준비중...
      </div>
      <h1 className="text-xl font-extrabold text-text-primary">N개 도시, N개국 여행자</h1>
    </div>
  );
};
