"use client";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X } from "lucide-react";

type SizeMode = "letters" | "numbers";

const LETTER_SIZES = ["S", "M", "L", "XL", "XXL"];

interface ProductSizeSelectorProps {
  value: string[];
  onChange: (sizes: string[]) => void;
  disabled?: boolean;
}

function detectSizeMode(sizes: string[]): SizeMode {
  if (sizes.length === 0) return "letters";
  const hasLetters = sizes.some(s => LETTER_SIZES.includes(s.toUpperCase()));
  return hasLetters ? "letters" : "numbers";
}

export function ProductSizeSelector({ value, onChange, disabled }: ProductSizeSelectorProps) {
  const [mode, setMode] = useState<SizeMode>(() => detectSizeMode(value));
  const [numberInput, setNumberInput] = useState("");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [step, setStep] = useState("2");

  useEffect(() => {
    if (value.length > 0) {
      setMode(detectSizeMode(value));
    }
  }, [value]);

  const handleModeChange = (newMode: SizeMode) => {
    setMode(newMode);
    onChange([]);
  };

  const handleLetterToggle = (size: string, checked: boolean) => {
    if (checked) {
      const newSizes = [...value, size].sort(
        (a, b) => LETTER_SIZES.indexOf(a) - LETTER_SIZES.indexOf(b)
      );
      onChange(newSizes);
    } else {
      onChange(value.filter(s => s !== size));
    }
  };

  const handleAddNumber = () => {
    const num = numberInput.trim();
    if (num && !value.includes(num)) {
      const newSizes = [...value, num].sort((a, b) => Number(a) - Number(b));
      onChange(newSizes);
    }
    setNumberInput("");
  };

  const handleRemoveNumber = (size: string) => {
    onChange(value.filter(s => s !== size));
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNumber();
    }
  };

  const handleGenerateRange = () => {
    const min = parseInt(minSize, 10);
    const max = parseInt(maxSize, 10);
    const stepVal = parseInt(step, 10) || 2;

    if (isNaN(min) || isNaN(max) || min > max || stepVal < 1) return;

    const generated: string[] = [];
    for (let i = min; i <= max; i += stepVal) {
      generated.push(String(i));
    }

    // Merge with existing and remove duplicates
    const merged = [...new Set([...value, ...generated])].sort((a, b) => Number(a) - Number(b));
    onChange(merged);
    setMinSize("");
    setMaxSize("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Tailles</Label>
        <RadioGroup
          value={mode}
          onValueChange={(v) => handleModeChange(v as SizeMode)}
          className="flex gap-4"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="letters" id="letters" />
            <Label htmlFor="letters" className="font-normal cursor-pointer">
              Lettres
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="numbers" id="numbers" />
            <Label htmlFor="numbers" className="font-normal cursor-pointer">
              Numéros
            </Label>
          </div>
        </RadioGroup>
      </div>

      {mode === "letters" ? (
        <div className="flex flex-wrap gap-4">
          {LETTER_SIZES.map((size) => (
            <div key={size} className="flex items-center gap-2">
              <Checkbox
                id={`size-${size}`}
                checked={value.includes(size)}
                onCheckedChange={(checked) => handleLetterToggle(size, !!checked)}
                disabled={disabled}
              />
              <Label htmlFor={`size-${size}`} className="font-normal cursor-pointer">
                {size}
              </Label>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Min/Max Range Generator */}
          <div className="p-3 border border-border rounded-md space-y-3 bg-muted/30">
            <Label className="text-xs text-muted-foreground">Générer une plage</Label>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                  placeholder="34"
                  disabled={disabled}
                  className="w-20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  placeholder="42"
                  disabled={disabled}
                  className="w-20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pas</Label>
                <Input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(e.target.value)}
                  placeholder="2"
                  disabled={disabled}
                  className="w-16"
                  min="1"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGenerateRange}
                disabled={disabled || !minSize || !maxSize}
              >
                Générer
              </Button>
            </div>
          </div>

          {/* Manual Add */}
          <div className="flex gap-2">
            <Input
              type="number"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              onKeyDown={handleNumberKeyDown}
              placeholder="Ajouter une taille..."
              disabled={disabled}
              className="w-40"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddNumber}
              disabled={disabled || !numberInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {value.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {value.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => handleRemoveNumber(size)}
                    className="hover:text-destructive"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {value.length === 0 && (
        <p className="text-xs text-destructive">
          Au moins une taille requise
        </p>
      )}
    </div>
  );
}
