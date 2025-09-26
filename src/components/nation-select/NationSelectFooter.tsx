import { Button } from "@/components/common/button";
import type { City } from "@/types/city";
import { SelectedCities } from "./SelectedCities";

interface NationSelectFooterProps {
  selectedCities: City[];
  onRemoveCity: (cityId: string) => void;
  onCreateGlobe: () => void;
}

export const NationSelectFooter = ({ selectedCities, onRemoveCity, onCreateGlobe }: NationSelectFooterProps) => {
  const isButtonEnabled = selectedCities.length > 0;

  return (
    <div className="sticky bottom-0 flex justify-center">
      <div className="bg-surface-thirdly w-full max-w-[512px] px-4 py-6">
        <SelectedCities selectedCities={selectedCities} onRemoveCity={onRemoveCity} />

        <Button
          variant={isButtonEnabled ? "primary" : "disabled"}
          size="lg"
          className="w-full"
          disabled={!isButtonEnabled}
          onClick={onCreateGlobe}
        >
          내 지구본 생성하기
        </Button>
      </div>
    </div>
  );
};
