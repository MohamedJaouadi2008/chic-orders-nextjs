import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminSales, useCreateSale, useUpdateSale, useDeleteSale } from "@/hooks/useAdminSales";
import { useAdminCategories, useAdminProducts } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import type { Sale } from "@/types/database";

const AdminSalesPage = () => {
  const { data: sales, isLoading } = useAdminSales();
  const { data: categories } = useAdminCategories();
  const { data: products } = useAdminProducts();
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    discount_percent: "",
    target_type: "category" as "product" | "category",
    target_ids: [] as string[],
    is_active: false,
    start_date: "",
    end_date: "",
    season: "" as "" | "summer" | "winter",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      discount_percent: "",
      target_type: "category",
      target_ids: [],
      is_active: false,
      start_date: "",
      end_date: "",
      season: "",
    });
    setEditingSale(null);
  };

  const openForm = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        name: sale.name,
        discount_percent: String(sale.discount_percent),
        target_type: sale.target_type,
        target_ids: sale.target_ids,
        is_active: sale.is_active,
        start_date: sale.start_date || "",
        end_date: sale.end_date || "",
        season: sale.season || "",
      });
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const saleData = {
      name: formData.name.trim(),
      discount_percent: Number(formData.discount_percent),
      target_type: formData.target_type,
      target_ids: formData.target_ids,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      season: formData.season || null,
    };

    if (editingSale) {
      await updateSale.mutateAsync({ id: editingSale.id, ...saleData });
    } else {
      await createSale.mutateAsync(saleData);
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSale.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const toggleTarget = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      target_ids: prev.target_ids.includes(id)
        ? prev.target_ids.filter((t) => t !== id)
        : [...prev.target_ids, id],
    }));
  };

  const targets = formData.target_type === "category" ? categories : products;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-wide">Soldes</h1>
            <p className="text-muted-foreground">Gérez vos campagnes de réduction</p>
          </div>
          <Button onClick={() => openForm()} className="btn-luxury">
            <Plus className="w-4 h-4 mr-2" />
            Créer une solde
          </Button>
        </div>

        {/* Sales Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune solde
                  </TableCell>
                </TableRow>
              ) : (
                sales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.name}</TableCell>
                    <TableCell className="text-primary">-{sale.discount_percent}%</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {sale.target_type === "category" ? "Catégories" : "Produits"} ({sale.target_ids.length})
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sale.start_date || sale.end_date
                        ? `${sale.start_date || "..."} → ${sale.end_date || "..."}`
                        : "Illimitée"}
                      {sale.season && (
                        <span className="ml-2 text-xs text-primary">
                          ({sale.season === "summer" ? "Été" : "Hiver"})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={sale.is_active}
                        onCheckedChange={(checked) =>
                          updateSale.mutate({ id: sale.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(sale)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(sale.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sale Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSale ? "Modifier la solde" : "Créer une solde"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la campagne</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Soldes d'été"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Réduction (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.discount_percent}
                onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type de cible</Label>
              <Select
                value={formData.target_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, target_type: v as "product" | "category", target_ids: [] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Catégories</SelectItem>
                  <SelectItem value="product">Produits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {formData.target_type === "category" ? "Catégories" : "Produits"} ciblés
              </Label>
              <ScrollArea className="h-40 border border-border rounded-md p-2">
                {targets?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      checked={formData.target_ids.includes(item.id)}
                      onCheckedChange={() => toggleTarget(item.id)}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début (optionnel)</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin (optionnel)</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Saison (optionnel)</Label>
              <Select
                value={formData.season || "none"}
                onValueChange={(v) =>
                  setFormData({ ...formData, season: v === "none" ? "" : v as "summer" | "winter" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Toutes saisons</SelectItem>
                  <SelectItem value="summer">Été (Avr–Sep)</SelectItem>
                  <SelectItem value="winter">Hiver (Oct–Mar)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                La solde se désactive automatiquement hors saison
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Activer immédiatement</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createSale.isPending || updateSale.isPending || formData.target_ids.length === 0}
              >
                {(createSale.isPending || updateSale.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingSale ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette solde ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les prix des produits seront mis à jour.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminSalesPage;
