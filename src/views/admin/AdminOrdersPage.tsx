import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { StatusChangeReasonDialog } from "@/components/admin/StatusChangeReasonDialog";
import { OrdersFilterBar } from "@/components/admin/OrdersFilterBar";
import { OrderCard, statusColors, statusLabels, getAllowedTransitions } from "@/components/admin/OrderCard";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdminData";
import { useClearOrdersLog } from "@/hooks/useClearOrdersLog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatPrice, formatRelativeTime } from "@/lib/formatters";
import { exportOrdersToCSV } from "@/lib/csvExport";
import { Loader2, Eye, Download, CheckCircle, XCircle, Truck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types/database";

const requiresReason = (fromStatus: OrderStatus): boolean => fromStatus === "livree";

const AdminOrdersPage = () => {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const clearOrdersLog = useClearOrdersLog();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<{ status: OrderStatus; ids: string[] } | null>(null);
  const [statusChangeRequest, setStatusChangeRequest] = useState<{
    orderId: string; fromStatus: OrderStatus; toStatus: OrderStatus;
  } | null>(null);
  const [clearLogConfirm, setClearLogConfirm] = useState(false);
  const [bulkCancelReason, setBulkCancelReason] = useState<{ ids: string[] } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minPrice, setMinPrice] = useState("");

  const cities = useMemo(() => [...new Set(orders?.map(o => o.client_city) || [])].sort(), [orders]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = order.client_name.toLowerCase().includes(q)
          || order.client_city.toLowerCase().includes(q)
          || order.product_name_snapshot.toLowerCase().includes(q)
          || order.final_price.toString().includes(q)
          || order.short_id?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (cityFilter !== "all" && order.client_city !== cityFilter) return false;
      if (dateFrom) {
        const d = new Date(order.created_at).toISOString().split("T")[0];
        if (d < dateFrom) return false;
      }
      if (dateTo) {
        const d = new Date(order.created_at).toISOString().split("T")[0];
        if (d > dateTo) return false;
      }
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min) && order.final_price < min) return false;
      }
      return true;
    });
  }, [orders, searchQuery, statusFilter, cityFilter, dateFrom, dateTo, minPrice]);

  const allSelected = filteredOrders.length > 0 && selectedIds.size === filteredOrders.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(filteredOrders.map(o => o.id)));
  };
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const requestStatusChange = (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    if (currentStatus === newStatus) return;
    const allowed = getAllowedTransitions(currentStatus);
    if (!allowed.includes(newStatus)) {
      toast.error("Ce changement de statut n'est pas autorisé");
      return;
    }
    if (requiresReason(currentStatus)) {
      setStatusChangeRequest({ orderId, fromStatus: currentStatus, toStatus: newStatus });
    } else {
      handleStatusChange(orderId, newStatus);
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus, reason?: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status, reason });
      toast.success(`Statut mis à jour: ${statusLabels[status]}${reason ? ` (Raison: ${reason})` : ""}`);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleStatusChangeWithReason = (reason: string) => {
    if (!statusChangeRequest) return;
    handleStatusChange(statusChangeRequest.orderId, statusChangeRequest.toStatus, reason);
    setStatusChangeRequest(null);
  };

  const handleBulkStatusChange = async (reason?: string) => {
    if (!bulkAction) return;
    const validIds: string[] = [];
    let skipped = 0;
    for (const id of bulkAction.ids) {
      const order = orders?.find(o => o.id === id);
      if (!order) continue;
      if (getAllowedTransitions(order.status).includes(bulkAction.status)) {
        validIds.push(id);
      } else {
        skipped++;
      }
    }
    if (skipped > 0) toast.warning(`${skipped} commande(s) ignorée(s)`);
    if (validIds.length === 0) {
      toast.error("Aucune commande ne peut être mise à jour");
      setBulkAction(null);
      return;
    }
    try {
      for (const id of validIds) {
        await updateStatus.mutateAsync({ orderId: id, status: bulkAction.status, reason });
      }
      toast.success(`${validIds.length} commande(s) mises à jour`);
      setSelectedIds(new Set());
      setBulkAction(null);
    } catch {
      toast.error("Erreur lors de la mise à jour groupée");
    }
  };

  const openBulkAction = (status: OrderStatus) => {
    const ids = Array.from(selectedIds);
    if (status === "annulee") {
      setBulkCancelReason({ ids });
    }
    setBulkAction({ status, ids });
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) { toast.error("Aucune commande à exporter"); return; }
    const toExport = someSelected ? filteredOrders.filter(o => selectedIds.has(o.id)) : filteredOrders;
    exportOrdersToCSV(toExport);
    toast.success(`${toExport.length} commande(s) exportée(s)`);
  };

  const handleClearLog = async () => {
    const toClear = someSelected
      ? filteredOrders.filter(o => selectedIds.has(o.id)).map(o => o.id)
      : filteredOrders.map(o => o.id);
    if (toClear.length === 0) { toast.error("Aucune commande à supprimer"); return; }
    try {
      const result = await clearOrdersLog.mutateAsync(toClear);
      toast.success(`Log supprimé - ${result.archived_count} commande(s) archivée(s)`);
      setSelectedIds(new Set());
      setClearLogConfirm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("all"); setCityFilter("all");
    setDateFrom(""); setDateTo(""); setMinPrice("");
  };

  const hasFilters = !!(searchQuery || statusFilter !== "all" || cityFilter !== "all" || dateFrom || dateTo || minPrice);

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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-light tracking-wide">Commandes</h1>
            <p className="text-sm text-muted-foreground">
              {filteredOrders.length} commande{filteredOrders.length !== 1 ? "s" : ""}
              {hasFilters && " (filtré)"}
            </p>
          </div>

          {/* Action buttons - scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {someSelected && (
              <>
                <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => openBulkAction("en_route")}>
                  <Truck className="w-3.5 h-3.5 mr-1.5" />
                  En route ({selectedIds.size})
                </Button>
                <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => openBulkAction("livree")}>
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Livrée ({selectedIds.size})
                </Button>
                <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => openBulkAction("annulee")}>
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Annuler ({selectedIds.size})
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              CSV
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => setClearLogConfirm(true)}
              disabled={filteredOrders.length === 0}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Vider
            </Button>
          </div>
        </div>

        {/* Filters */}
        <OrdersFilterBar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          cityFilter={cityFilter} setCityFilter={setCityFilter} cities={cities}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          minPrice={minPrice} setMinPrice={setMinPrice}
          hasFilters={hasFilters} clearFilters={clearFilters}
        />

        {/* Mobile: Card layout */}
        <div className="block md:hidden space-y-3">
          {/* Select all */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Tout sélectionner" />
            <span className="text-xs text-muted-foreground">Tout sélectionner</span>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aucune commande</p>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedIds.has(order.id)}
                onToggleSelect={toggleSelect}
                onStatusChange={requestStatusChange}
                onView={setSelectedOrder}
                isUpdating={updateStatus.isPending}
              />
            ))
          )}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Tout sélectionner" />
                </TableHead>
                <TableHead className="w-[90px]">ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucune commande
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => (
                  <TableRow key={order.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell>
                      <Checkbox checked={selectedIds.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-primary font-medium">{order.short_id || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.client_name}</p>
                      <p className="text-sm text-muted-foreground">{order.client_city}</p>
                    </TableCell>
                    <TableCell>
                      <p className="truncate max-w-[200px]">{order.product_name_snapshot}</p>
                      <p className="text-sm text-muted-foreground">Taille: {order.size_selected}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatPrice(order.final_price)}</p>
                      {order.discount_applied > 0 && <p className="text-xs text-primary">-{order.discount_applied}%</p>}
                    </TableCell>
                    <TableCell>
                      {order.status === "annulee" ? (
                        <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                      ) : (
                        <Select
                          value={order.status}
                          onValueChange={v => requestStatusChange(order.id, order.status, v as OrderStatus)}
                          disabled={updateStatus.isPending}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={order.status} disabled>{statusLabels[order.status]} (actuel)</SelectItem>
                            {getAllowedTransitions(order.status).map(s => (
                              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatRelativeTime(order.created_at)}</p>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      {statusChangeRequest && (
        <StatusChangeReasonDialog
          open={!!statusChangeRequest}
          onOpenChange={open => !open && setStatusChangeRequest(null)}
          fromStatus={statusChangeRequest.fromStatus}
          toStatus={statusChangeRequest.toStatus}
          onConfirm={handleStatusChangeWithReason}
          isLoading={updateStatus.isPending}
        />
      )}

      {bulkCancelReason && bulkAction?.status === "annulee" && (
        <StatusChangeReasonDialog
          open={!!bulkCancelReason}
          onOpenChange={open => { if (!open) { setBulkCancelReason(null); setBulkAction(null); } }}
          fromStatus="en_attente"
          toStatus="annulee"
          onConfirm={(reason) => { handleBulkStatusChange(reason); setBulkCancelReason(null); }}
          isLoading={updateStatus.isPending}
        />
      )}

      <AlertDialog open={!!bulkAction && bulkAction.status !== "annulee"} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction?.status === "en_route" ? "Marquer comme en route ?" : "Marquer comme livrées ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction?.ids.length} commande(s) seront mises à jour.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleBulkStatusChange()}>
              {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearLogConfirm} onOpenChange={setClearLogConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vider le log des commandes ?</AlertDialogTitle>
            <AlertDialogDescription>
              {someSelected
                ? `${selectedIds.size} commande(s) sélectionnée(s) seront archivées.`
                : `${filteredOrders.length} commande(s) seront archivées.`}
              <span className="block mt-2 text-muted-foreground">
                Un email avec le fichier CSV sera envoyé. Les données seront conservées dans une table cachée.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLog}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={clearOrdersLog.isPending}
            >
              {clearOrdersLog.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Vider le log
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
