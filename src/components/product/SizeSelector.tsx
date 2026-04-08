import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  disabled?: boolean;
}

export function SizeSelector({ sizes, selectedSize, onSelect, disabled }: SizeSelectorProps) {
  if (sizes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Taille unique
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onSelect(size)}
          disabled={disabled}
          className={cn(
            "min-w-[48px] h-12 px-4 border text-sm uppercase tracking-wider transition-all duration-300",
            selectedSize === size
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-transparent text-foreground hover:border-foreground/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
