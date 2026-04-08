import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminFeaturedProducts, useAddFeaturedProduct, useUpdateFeaturedPosition, useRemoveFeaturedProduct } from "@/hooks/useAdminSales";
import { useAdminProducts } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminProducts as useProducts } from "@/hooks/useAdminData";
import { Loader2, Plus, Trash2 } from "lucide-react";

const AdminFeaturedPage = () => {
  const { data: featured, isLoading } = useAdminFeaturedProducts();
  const { data: products } = useProducts();
  const addFeatured = useAddFeaturedProduct();
  const updatePosition = useUpdateFeaturedPosition();
  const removeFeatured = useRemoveFeaturedProduct();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [position, setPosition] = useState("0");

  // Calculate next available position
  const getNextPosition = () => {
    if (!featured || featured.length === 0) return 0;
    const maxPosition = Math.max(...featured.map(f => f.position));
    return maxPosition + 1;
  };

  const handleOpenAddModal = () => {
    setPosition(String(getNextPosition()));
    setIsAddOpen(true);
  };

  // Products not already featured
  const featuredProductIds = new Set(featured?.map((f) => f.product_id) || []);
  const availableProducts = products?.filter((p) => !featuredProductIds.has(p.id) && p.is_active) || [];

  const handleAdd = async () => {
    if (!selectedProduct) return;
    await addFeatured.mutateAsync({
      product_id: selectedProduct,
      position: Number(position) || 0,
    });
    setIsAddOpen(false);
    setSelectedProduct("");
    setPosition("0");
  };

  const handlePositionChange = async (id: string, newPosition: number) => {
    await updatePosition.mutateAsync({ id, position: newPosition });
  };

  const handleRemove = async (id: string) => {
    await removeFeatured.mutateAsync(id);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-wide">Sélection Vedette</h1>
            <p className="text-muted-foreground">Produits mis en avant sur la page d'accueil</p>
          </div>
          <Button onClick={handleOpenAddModal} className="btn-luxury">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Featured Products Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featured?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Aucun produit vedette
                  </TableCell>
                </TableRow>
              ) : (
                featured?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-20"
                        value={item.position}
                        onChange={(e) => handlePositionChange(item.id, Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product?.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span className="font-medium">{item.product?.name || "Produit supprimé"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Modifiez la position pour changer l'ordre d'affichage (0 = premier).
        </p>
      </div>

      {/* Add Featured Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un produit vedette</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produit</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAdd} disabled={!selectedProduct || addFeatured.isPending}>
                {addFeatured.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminFeaturedPage;
