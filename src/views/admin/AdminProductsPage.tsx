import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { BulkStockModal } from "@/components/admin/BulkStockModal";
import {
  useAdminProducts,
  useAdminCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useAdminData";
import { useBulkStockUpdate } from "@/hooks/useAdminStockOperations";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatPrice } from "@/lib/formatters";
import { Loader2, Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/database";

type FilterActive = "all" | "active" | "inactive";
type FilterStock = "all" | "low" | "out";

const AdminProductsPage = () => {
  const { data: products, isLoading } = useAdminProducts();
  const { data: categories } = useAdminCategories();
  const { data: settings } = useSettings();
  const lowStockThreshold = settings?.low_stock_threshold || 10;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkStockUpdate = useBulkStockUpdate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkStock, setShowBulkStock] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<FilterActive>("all");
  const [filterStock, setFilterStock] = useState<FilterStock>("all");

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      if (filterCategory !== "all" && product.category_id !== filterCategory) {
        return false;
      }
      if (filterActive === "active" && !product.is_active) return false;
      if (filterActive === "inactive" && product.is_active) return false;
      if (filterStock === "low" && (product.stock >= lowStockThreshold || product.stock === 0)) return false;
      if (filterStock === "out" && product.stock !== 0) return false;

      return true;
    });
  }, [products, filterCategory, filterActive, filterStock, lowStockThreshold]);

  const allSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const openForm = (product?: Product) => {
    setEditingProduct(product || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    category_id?: string;
    season?: string;
    size_options: string[];
    images: string[];
    is_active: boolean;
  }) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
        toast.success("Produit modifié");
      } else {
        await createProduct.mutateAsync(data);
        toast.success("Produit créé");
      }
      closeForm();
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteProduct.mutateAsync(deleteId);
        toast.success("Produit supprimé");
        setDeleteId(null);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteId);
          return next;
        });
      } catch (error) {
        toast.error("Une erreur est survenue");
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        is_active: !product.is_active,
      });
      toast.success(product.is_active ? "Produit désactivé" : "Produit activé");
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleBulkStockUpdate = async (
    mode: "set" | "increment" | "decrement",
    amount: number
  ) => {
    await bulkStockUpdate.mutateAsync({
      productIds: Array.from(selectedIds),
      updateMode: mode,
      amount,
    });
    setSelectedIds(new Set());
  };

  // Stock badge helper
  const renderStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    }
    if (stock < lowStockThreshold) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-500 bg-yellow-500/10">
          {stock} (Faible)
        </Badge>
      );
    }
    return <span className="text-foreground">{stock}</span>;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-wide">Produits</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
              {filterCategory !== "all" || filterActive !== "all" || filterStock !== "all"
                ? " (filtré)"
                : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {someSelected && (
              <Button
                variant="outline"
                onClick={() => setShowBulkStock(true)}
              >
                <Package className="w-4 h-4 mr-2" />
                Stock ({selectedIds.size})
              </Button>
            )}
            <Button onClick={() => openForm()} className="btn-luxury">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Catégorie</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Statut</label>
            <Select
              value={filterActive}
              onValueChange={(v) => setFilterActive(v as FilterActive)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Stock</label>
            <Select
              value={filterStock}
              onValueChange={(v) => setFilterStock(v as FilterStock)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="low">Faible (1-{lowStockThreshold - 1})</SelectItem>
                <SelectItem value="out">Rupture (0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Tout sélectionner"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun produit
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={() => toggleSelect(product.id)}
                        aria-label={`Sélectionner ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-contain rounded bg-muted/20"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Tailles: {product.size_options.join(", ") || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name || "—"}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{renderStockBadge(product.stock)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={() => handleToggleActive(product)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openForm(product)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(product.id)}
                          title="Supprimer"
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

      {/* Bulk Stock Modal */}
      <BulkStockModal
        open={showBulkStock}
        onOpenChange={setShowBulkStock}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkStockUpdate}
        isLoading={bulkStockUpdate.isPending}
      />

      {/* Product Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            categories={categories || []}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isLoading={createProduct.isPending || updateProduct.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les commandes existantes conserveront leur
              historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProductsPage;
