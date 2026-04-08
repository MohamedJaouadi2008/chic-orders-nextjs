import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { OrderStatus } from "@/types/database";

interface OrdersFilterBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: OrderStatus | "all";
  setStatusFilter: (v: OrderStatus | "all") => void;
  cityFilter: string;
  setCityFilter: (v: string) => void;
  cities: string[];
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  hasFilters: boolean;
  clearFilters: () => void;
}

export const OrdersFilterBar = ({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  cityFilter, setCityFilter, cities,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  minPrice, setMinPrice,
  hasFilters, clearFilters,
}: OrdersFilterBarProps) => {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg border border-border">
      {/* Search - full width */}
      <div className="col-span-2 space-y-1 sm:flex-1 sm:min-w-[200px]">
        <Label className="text-xs text-muted-foreground">Recherche</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Client, ville, produit..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Statut</Label>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as OrderStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="confirmee">Confirmée</SelectItem>
            <SelectItem value="en_route">En route</SelectItem>
            <SelectItem value="livree">Livrée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Ville</Label>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date from */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Du</Label>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full sm:w-[150px]" />
      </div>

      {/* Date to */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Au</Label>
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full sm:w-[150px]" />
      </div>

      {/* Min price + clear */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Prix min</Label>
        <Input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" className="w-full sm:w-[100px]" />
      </div>

      {hasFilters && (
        <div className="flex items-end">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Effacer
          </Button>
        </div>
      )}
    </div>
  );
};
