import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime } from "@/lib/formatters";
import { Loader2, TrendingUp, TrendingDown, Minus, History } from "lucide-react";

interface StockLogEntry {
  id: string;
  product_id: string | null;
  product_name_snapshot: string;
  previous_stock: number;
  new_stock: number;
  change_amount: number;
  change_type: string;
  notes: string | null;
  created_at: string;
}

function useStockLogs() {
  return useQuery({
    queryKey: ["admin-stock-logs"],
    queryFn: async (): Promise<StockLogEntry[]> => {
      const { data, error } = await supabase
        .from("admin_stock_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return data || [];
    },
  });
}

const changeTypeLabels: Record<string, string> = {
  bulk_update: "Mise à jour groupée",
  manual_edit: "Modification manuelle",
  order_placed: "Commande passée",
  order_cancelled: "Commande annulée",
};

const AdminStockLogPage = () => {
  const { data: logs, isLoading } = useStockLogs();
  
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchProduct, setSearchProduct] = useState<string>("");

  // Get unique change types
  const changeTypes = useMemo(() => {
    const types = new Set(logs?.map(l => l.change_type) || []);
    return Array.from(types).sort();
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return (logs || []).filter(log => {
      if (typeFilter !== "all" && log.change_type !== typeFilter) return false;
      if (dateFrom) {
        const logDate = new Date(log.created_at).toISOString().split("T")[0];
        if (logDate < dateFrom) return false;
      }
      if (dateTo) {
        const logDate = new Date(log.created_at).toISOString().split("T")[0];
        if (logDate > dateTo) return false;
      }
      if (searchProduct && !log.product_name_snapshot.toLowerCase().includes(searchProduct.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [logs, typeFilter, dateFrom, dateTo, searchProduct]);

  const clearFilters = () => {
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearchProduct("");
  };

  const hasFilters = typeFilter !== "all" || dateFrom || dateTo || searchProduct;

  const renderChangeIcon = (amount: number) => {
    if (amount > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (amount < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const renderChangeBadge = (amount: number) => {
    if (amount > 0) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-500 bg-green-500/10">
          +{amount}
        </Badge>
      );
    } else if (amount < 0) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-500 bg-red-500/10">
          {amount}
        </Badge>
      );
    }
    return <Badge variant="outline">0</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-light tracking-wide">Journal des stocks</h1>
            <p className="text-muted-foreground">
              {filteredLogs.length} entrée{filteredLogs.length !== 1 ? "s" : ""}
              {hasFilters && " (filtré)"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Produit</Label>
            <Input
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              placeholder="Rechercher..."
              className="w-[180px]"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {changeTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {changeTypeLabels[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Du</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Au</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />
          </div>

          {hasFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Effacer
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Avant</TableHead>
                <TableHead className="text-center">Après</TableHead>
                <TableHead className="text-center">Changement</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune entrée dans le journal
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell>{renderChangeIcon(log.change_amount)}</TableCell>
                    <TableCell>
                      <p className="font-medium truncate max-w-[200px]">
                        {log.product_name_snapshot}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {changeTypeLabels[log.change_type] || log.change_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{log.previous_stock}</TableCell>
                    <TableCell className="text-center">{log.new_stock}</TableCell>
                    <TableCell className="text-center">
                      {renderChangeBadge(log.change_amount)}
                    </TableCell>
                    <TableCell>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]" title={log.notes}>
                          {log.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(log.created_at)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStockLogPage;
