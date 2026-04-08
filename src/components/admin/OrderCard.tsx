import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, formatRelativeTime } from "@/lib/formatters";
import { Eye } from "lucide-react";
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

const getAllowedTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case "en_attente": return ["confirmee", "annulee"];
    case "confirmee": return ["en_route", "livree", "annulee"];
    case "en_route": return ["livree", "annulee"];
    case "livree": return ["en_route", "annulee"];
    case "annulee": return [];
    default: return [];
  }
};

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onStatusChange: (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => void;
  onView: (order: Order) => void;
  isUpdating: boolean;
}

export const OrderCard = ({ order, isSelected, onToggleSelect, onStatusChange, onView, isUpdating }: OrderCardProps) => {
  return (
    <div className="p-3 border border-border rounded-lg bg-card space-y-3">
      {/* Top row: checkbox, ID, view button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(order.id)}
            aria-label={`Sélectionner ${order.client_name}`}
          />
          <span className="font-mono text-sm text-primary font-medium">
            {order.short_id || "-"}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(order)}>
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      {/* Client + Product */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Client</p>
          <p className="font-medium truncate">{order.client_name}</p>
          <p className="text-xs text-muted-foreground">{order.client_city}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Produit</p>
          <p className="font-medium truncate">{order.product_name_snapshot}</p>
          <p className="text-xs text-muted-foreground">Taille: {order.size_selected}</p>
        </div>
      </div>

      {/* Bottom row: price, status, date */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium text-sm">{formatPrice(order.final_price)}</p>
          {order.discount_applied > 0 && (
            <p className="text-xs text-primary">-{order.discount_applied}%</p>
          )}
        </div>

        {order.status === "annulee" ? (
          <Badge className={statusColors[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        ) : (
          <Select
            value={order.status}
            onValueChange={v => onStatusChange(order.id, order.status, v as OrderStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[120px] h-7 text-xs">
              <Badge className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={order.status} disabled>
                {statusLabels[order.status]} (actuel)
              </SelectItem>
              {getAllowedTransitions(order.status).map(status => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelativeTime(order.created_at)}
        </p>
      </div>
    </div>
  );
};

export { statusColors, statusLabels, getAllowedTransitions };
