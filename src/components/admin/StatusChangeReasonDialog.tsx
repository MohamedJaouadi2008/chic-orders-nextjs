"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@/types/database";

const statusLabels: Record<OrderStatus, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  en_route: "En route",
  livree: "Livrée",
  annulee: "Annulée",
};

interface StatusChangeReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function StatusChangeReasonDialog({
  open,
  onOpenChange,
  fromStatus,
  toStatus,
  onConfirm,
  isLoading,
}: StatusChangeReasonDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raison du changement de statut</DialogTitle>
          <DialogDescription>
            Vous changez le statut de "{statusLabels[fromStatus]}" à "{statusLabels[toStatus]}".
            Veuillez indiquer la raison de ce changement.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Client a demandé un retour, erreur de livraison..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!reason.trim() || isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
