"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type UpdateMode = "set" | "increment" | "decrement";

interface BulkStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (mode: UpdateMode, amount: number) => Promise<void>;
  isLoading?: boolean;
}

export function BulkStockModal({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  isLoading,
}: BulkStockModalProps) {
  const [mode, setMode] = useState<UpdateMode>("set");
  const [amount, setAmount] = useState("");

  const handleConfirm = async () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 0) return;
    
    await onConfirm(mode, numAmount);
    setAmount("");
    setMode("set");
    onOpenChange(false);
  };

  const isValid = amount !== "" && parseInt(amount, 10) >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mise à jour groupée du stock</DialogTitle>
          <DialogDescription>
            {selectedCount} produit(s) sélectionné(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as UpdateMode)}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="set" id="set" />
              <Label htmlFor="set" className="font-normal cursor-pointer">
                Définir le stock à
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="increment" id="increment" />
              <Label htmlFor="increment" className="font-normal cursor-pointer">
                Ajouter au stock
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="decrement" id="decrement" />
              <Label htmlFor="decrement" className="font-normal cursor-pointer">
                Retirer du stock
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="amount">Quantité</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
