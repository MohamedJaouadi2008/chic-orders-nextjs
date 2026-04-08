import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateTime } from "@/lib/formatters";
import type { Order, OrderStatus } from "@/types/database";

const statusColors: Record<OrderStatus, string> = {
  en_attente: "bg-yellow-500/20 text-yellow-500",
  confirmee: "bg-blue-500/20 text-blue-500",
  en_route: "bg-purple-500/20 text-purple-500",
  livree: "bg-green-500/20 text-green-500",
  annulee: "bg-red-500/20 text-red-500",
};

const statusLabels: Record<OrderStatus, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  en_route: "En route",
  livree: "Livrée",
  annulee: "Annulée",
};

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Détails de la commande</span>
            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Client
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Nom</p>
                <p className="font-medium">{order.client_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <p className="font-medium">{order.client_phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ville</p>
                <p className="font-medium">{order.client_city}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Adresse complète</p>
              <p className="font-medium">{order.client_address}</p>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Produit
            </h4>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="font-medium text-lg">{order.product_name_snapshot}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-muted-foreground">
                  Taille: <span className="text-foreground font-medium">{order.size_selected}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Prix
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix original</span>
                <span>{formatPrice(order.product_price_snapshot)}</span>
              </div>
              {order.discount_applied > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Remise</span>
                  <span>-{order.discount_applied}%</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.final_price)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="space-y-2 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Notes
              </h4>
              <p className="text-sm bg-muted/30 rounded-lg p-3">{order.notes}</p>
            </div>
          )}

          {/* Cancellation Info */}
          {order.status === "annulee" && order.status_change_reason && (
            <div className="space-y-2 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Raison d'annulation
              </h4>
              <p className="text-sm bg-destructive/10 text-destructive rounded-lg p-3">
                {order.status_change_reason}
              </p>
              {order.status_change_history && order.status_change_history.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-muted-foreground">Historique:</p>
                  {order.status_change_history.map((entry, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      {entry.from} → {entry.to} ({formatDateTime(entry.timestamp)})
                      {entry.reason && <span className="ml-2">— {entry.reason}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
