interface GlobeFooterProps {
  isZoomed: boolean;
}

export const GlobeFooter = ({ isZoomed }: GlobeFooterProps) => {
  return (
    <div className={`px-4 pb-4 space-y-2 transition-opacity duration-500 ${isZoomed ? "opacity-0" : "opacity-100"}`}>
      <button
        type="button"
        className="w-full text-text-inverseprimary font-bold py-3 rounded-2xl text-base bg-blue-theme cursor-pointer"
      >
        내 지구본 자랑하기
      </button>
      <button
        type="button"
        className="w-full bg-transparent text-text-primary font-bold py-3 rounded-2xl text-base cursor-pointer"
      >
        홈으로 이동
      </button>
    </div>
  );
};