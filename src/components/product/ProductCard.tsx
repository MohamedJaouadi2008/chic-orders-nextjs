import Link from "next/link";
import type { ProductWithPrice } from "@/types/database";
import { SaleBadge } from "./SaleBadge";
import { formatPrice } from "@/lib/formatters";
import { useSettings } from "@/hooks/useSettings";

interface ProductCardProps {
  product: ProductWithPrice;
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: settings } = useSettings();
  const lowStockThreshold = settings?.low_stock_threshold || 10;
  const hasDiscount = product.discount_percent > 0;
  const imageUrl = product.images[0] || "/placeholder.svg";

  return (
    <Link
      href={`/produit/${product.slug}`}
      className="product-card group block"
    >
      {/* Image Container - Tall aspect ratio for luxury feel */}
      <div className="relative aspect-product overflow-hidden bg-muted/10 rounded-lg">
        {hasDiscount && (
          <SaleBadge discountPercent={product.discount_percent} />
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className="product-card-image w-full h-full object-contain transition-all duration-500 group-hover:brightness-110"
          loading="lazy"
        />
        
        {/* Quick View Overlay */}
        <div className="quick-view-overlay">
          <span className="text-xs uppercase tracking-widest font-light text-foreground">
            Voir le produit
          </span>
        </div>
      </div>

      {/* Product Info - Minimal text */}
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-light tracking-wide text-foreground truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-medium text-primary">
                {formatPrice(product.final_price)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-light text-foreground">
              {formatPrice(product.final_price)}
            </span>
          )}
        </div>
        {/* Stock indicator - uses configurable threshold */}
        {product.stock <= lowStockThreshold && product.stock > 0 && (
          <p className="text-xs text-primary">
            Plus que {product.stock} en stock
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-muted-foreground">
            Rupture de stock
          </p>
        )}
      </div>
    </Link>
  );
}
