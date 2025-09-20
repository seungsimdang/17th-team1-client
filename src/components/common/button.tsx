import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { EMOJI_LIST } from "@/constants/emoji";
import useImage from "@/hooks/useImage";
import { cn } from "@/utils/cn";

type ImageUploadButtonProps = {
  photoType: string;
  disabled?: boolean;
  className?: string;
};

const iconButtonStyles = cn(
  "inline-flex justify-center items-center rounded-md outline outline-gray-200 bg-white disabled:opacity-40 text-gray-700 font-medium",
  "enabled:hover:bg-gray-50 enabled:hover:outline-gray-300 enabled:hover:text-gray-900 disabled:opacity-40",
);

export const buttonVariants = cva("inline-flex justify-center items-center rounded-md disabled:opacity-40", {
  variants: {
    variant: {
      primary: "bg-primary-600 enabled:hover:bg-primary-700 text-white",
      secondary: "bg-gray-200 enabled:hover:bg-gray-300 text-gray-700",
      outlined: "outline outline-gray-200 bg-white enabled:hover:bg-gray-50 text-gray-700",
    },
    size: {
      sm: "px-8 py-6 h-30 text-xs",
      md: "px-10 py-8 h-36 text-sm",
      lg: "p-10 h-41 text-sm",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export const iconButtonVariants = cva(iconButtonStyles, {
  variants: {
    size: {
      sm: "px-8 py-6 gap-4 text-xs",
      lg: "px-10 py-8 gap-6 text-sm",
      square: "h-36 w-36",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...(props as any)} />;
};

export const IconButton = ({
  className,
  icon,
  size,
  children,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof iconButtonVariants> & {
    icon: React.ReactNode;
    asChild?: boolean;
  }) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp data-slot="icon-button" className={cn(iconButtonVariants({ size }), className)} {...(props as any)}>
      {icon}
      {children}
    </Comp>
  );
};

export const ImageUploadButton = ({ photoType, disabled = false, className }: ImageUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, handleSelectFile, handleRemove } = useImage([photoType]);

  const uploadedImage = photos[photoType]?.url || null;

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleChangeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      handleSelectFile(photoType)(files[0]);
    }
    e.target.value = "";
  };

  const handleRemoveClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    handleRemove(photoType)();
  };

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "relative flex w-full shrink-0 flex-col justify-center gap-4 rounded-[30px] border border-dashed border-gray-200 bg-white outline-none disabled:bg-gray-100",
          !disabled && "hover:border-gray-300 hover:bg-gray-50",
          uploadedImage ? "items-start gap-10 p-0" : "aspect-square items-center gap-4 p-16",
          className,
        )}
        onClick={handleClick}
        disabled={disabled}
        aria-label={uploadedImage ? "이미지 업로드 버튼 (이미지가 업로드됨)" : "이미지 업로드 버튼"}
      >
        {uploadedImage ? (
          <Image
            src={uploadedImage}
            alt="업로드된 이미지"
            width={90}
            height={90}
            className="flex aspect-square !w-full shrink-0 items-center gap-10 self-stretch rounded-md object-cover"
          />
        ) : (
          <>
            <Camera size={16} className={disabled ? "text-gray-400" : "text-gray-700"} />
            {/* <span className={cn("text-xs font-medium", disabled ? "text-gray-400" : "text-gray-700")}>사진 업로드</span> */}
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChangeFileInput}
          className="hidden"
          disabled={disabled}
        />
      </button>

      {uploadedImage && (
        <button
          onClick={handleRemoveClick}
          className={cn(
            "absolute top-8 right-8 inline-flex aspect-square items-center rounded-full bg-[rgba(255,255,255,0.70)] p-2 text-gray-500 cursor-pointer",
            disabled ? "text-gray-400 cursor-not-allowed" : "hover:text-gray-600",
          )}
          type="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleRemoveClick(e);
            }
          }}
          aria-label="이미지 삭제"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export const EmogiUploadButton = ({ disabled = false, className }: ImageUploadButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const dialogId = useId();

  const handleClick = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setIsOpen(false);
  };

  const handleRemove = () => {
    setSelectedEmoji(null);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "relative w-20 h-20 rounded-full border-2 border-dashed border-gray-400 bg-gray-800 outline-none disabled:opacity-40 flex items-center justify-center group",
          !disabled && "hover:border-gray-300 hover:bg-gray-700",
          className,
        )}
        aria-label={selectedEmoji ? `이모지 업로드 버튼 (선택된 이모지: ${selectedEmoji})` : "이모지 업로드 버튼"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <div className="absolute -top-2 -left-2 w-4 h-4 border-2 border-dashed border-gray-400 bg-gray-800 transform rotate-45 rounded-sm" />

        {selectedEmoji ? (
          <div className="text-2xl">{selectedEmoji}</div>
        ) : (
          <div className="text-gray-300 text-2xl group-hover:text-gray-200 transition-colors">😊</div>
        )}
      </button>

      {selectedEmoji && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors cursor-pointer"
          type="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              handleRemove();
            }
          }}
          aria-label="이모지 삭제"
        >
          <X size={12} />
        </button>
      )}

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
          role="dialog"
          aria-labelledby={dialogId}
          aria-modal="true"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 id={dialogId} className="text-sm font-medium text-gray-700">
              이모지 선택
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              type="button"
              aria-label="이모지 선택 창 닫기"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                type="button"
                aria-label={`이모지 ${emoji} 선택`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
