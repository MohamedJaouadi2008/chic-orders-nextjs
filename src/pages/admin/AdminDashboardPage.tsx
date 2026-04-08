import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminOrders, useAdminProducts } from "@/hooks/useAdminData";
import { formatPrice, formatRelativeTime } from "@/lib/formatters";
import { ShoppingCart, Package, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
const AdminDashboardPage = () => {
  const {
    data: orders,
    isLoading: ordersLoading
  } = useAdminOrders();
  const {
    data: products,
    isLoading: productsLoading
  } = useAdminProducts();
  const isLoading = ordersLoading || productsLoading;

  // Calculate stats
  const todayOrders = orders?.filter(order => {
    const orderDate = new Date(order.created_at).toDateString();
    return orderDate === new Date().toDateString();
  }) || [];
  const pendingOrders = orders?.filter(order => order.status === "en_attente") || [];
  const lowStockProducts = products?.filter(product => product.stock <= 3 && product.stock > 0) || [];
  const outOfStockProducts = products?.filter(product => product.stock === 0) || [];

  // Revenue from delivered orders only (accurate revenue)
  const deliveredOrders = orders?.filter(order => order.status === "livree") || [];
  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + parseFloat(String(order.final_price)), 0);

  // Recent orders
  const recentOrders = orders?.slice(0, 5) || [];
  if (isLoading) {
    return <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>;
  }
  return <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre boutique</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Commandes aujourd'hui
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En attente
              </CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stock faible
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lowStockProducts.length + outOfStockProducts.length}
              </div>
              {outOfStockProducts.length > 0 && <p className="text-xs text-destructive mt-1">
                  {outOfStockProducts.length} en rupture
                </p>}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenu estimé
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {deliveredOrders.length} commandes livrées
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Commandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? <p className="text-muted-foreground text-sm">Aucune commande</p> : <div className="space-y-4">
                  {recentOrders.map(order => <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{order.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.product_name_snapshot} • {order.size_selected}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(order.final_price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(order.created_at)}
                        </p>
                      </div>
                    </div>)}
                </div>}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Alertes de stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? <p className="text-muted-foreground text-sm">Tous les produits sont en stock</p> : <div className="space-y-4">
                  {outOfStockProducts.map(product => <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <p className="font-medium">{product.name}</p>
                      <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive rounded">
                        Rupture
                      </span>
                    </div>)}
                  {lowStockProducts.map(product => <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <p className="font-medium">{product.name}</p>
                      <span className="text-xs px-2 py-1 rounded bg-destructive text-primary-foreground">
                        {product.stock} restant{product.stock > 1 ? "s" : ""}
                      </span>
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>;
};
export default AdminDashboardPage;