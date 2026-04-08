"use client";
import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SizeSelector } from "@/components/product/SizeSelector";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { SaleBadge } from "@/components/product/SaleBadge";
import { OrderModal } from "@/components/order/OrderModal";
import { useProduct } from "@/hooks/useProducts";
import { useSettings } from "@/hooks/useSettings";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";
import { ChevronLeft, ChevronRight, Ruler, Loader2, ShoppingCart, X } from "lucide-react";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { data: settings } = useSettings();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Dynamic SEO
  const seoData = useMemo(() => {
    if (!product) return null;
    const baseUrl = "https://mylady.lovable.app";
    const url = `${baseUrl}/produit/${product.slug}`;
    const title = `${product.name} - سيدتي Boutique`;
    const description = product.description
      ? product.description.slice(0, 155)
      : `Achetez ${product.name} à ${product.final_price} TND. Livraison disponible dans toute la Tunisie.`;
    
    return {
      title,
      description,
      canonicalUrl: url,
      ogImage: product.images[0] || undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || description,
        image: product.images,
        url,
        brand: { "@type": "Brand", name: "سيدتي" },
        offers: {
          "@type": "Offer",
          price: product.final_price,
          priceCurrency: "TND",
          availability: product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url,
          ...(product.discount_percent > 0 && {
            priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          }),
        },
        ...(product.category && {
          category: product.category.name,
        }),
      },
    };
  }, [product]);

  useSEO({
    title: seoData?.title || "سيدتي - Boutique de Mode Femme",
    description: seoData?.description || "Boutique de mode féminine de luxe.",
    canonicalUrl: seoData?.canonicalUrl,
    ogImage: seoData?.ogImage,
    jsonLd: seoData?.jsonLd || undefined,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-light mb-4">Produit non trouvé</h1>
          <Link href="/boutique">
            <Button variant="outline">Retour à la boutique</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const hasDiscount = product.discount_percent > 0;
  const isOutOfStock = product.stock === 0;
  const canOrder = selectedSize && !isOutOfStock;

  const handleOrder = () => {
    if (canOrder) {
      setIsOrderModalOpen(true);
    }
  };

  const handleAddToCart = () => {
    if (product && selectedSize && !isOutOfStock) {
      addToCart(product, selectedSize, 1);
      toast({
        title: "Ajouté au panier",
        description: `${product.name} (Taille: ${selectedSize}) a été ajouté au panier.`,
      });
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Back Link */}
        <Link
          href="/boutique"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour à la boutique
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-product bg-muted/10 overflow-hidden cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            >
              {hasDiscount && <SaleBadge discountPercent={product.discount_percent} />}
              <img
                src={product.images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-foreground"
                        : "border-transparent hover:border-foreground/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pt-8">
            {/* Category */}
            {product.category && (
              <Link
                href={`/boutique?category=${product.category.slug}`}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {product.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-light tracking-wide mt-2 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-medium text-primary">
                    {formatPrice(product.final_price)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="text-sm text-primary">
                    -{product.discount_percent}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-light">
                  {formatPrice(product.final_price)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm uppercase tracking-widest">
                  Taille
                </label>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Ruler className="w-3 h-3" />
                  Guide des tailles
                </button>
              </div>
              <SizeSelector
                sizes={product.size_options}
                selectedSize={selectedSize}
                onSelect={setSelectedSize}
                disabled={isOutOfStock}
              />
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {isOutOfStock ? (
                <p className="text-sm text-destructive">Rupture de stock</p>
              ) : product.stock <= (settings?.low_stock_threshold ?? 10) ? (
                <p className="text-sm text-primary">
                  Plus que {product.stock} en stock
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">En stock</p>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!canOrder}
              variant="outline"
              className="w-full h-12 text-base gap-2 mb-3"
            >
              <ShoppingCart size={18} />
              {isOutOfStock
                ? "Rupture de stock"
                : !selectedSize
                ? "Sélectionnez une taille"
                : "Ajouter au panier"}
            </Button>

            {/* Direct Order Button */}
            <Button
              onClick={handleOrder}
              disabled={!canOrder}
              className="w-full btn-luxury h-14 text-base"
            >
              {isOutOfStock
                ? "Rupture de stock"
                : !selectedSize
                ? "Sélectionnez une taille"
                : "Commander directement"}
            </Button>

            {/* Trust Signals */}
            <div className="mt-8 pt-8 border-t border-border space-y-3">
              <p className="text-xs text-muted-foreground">
                ✓ Livraison discrète
              </p>
              <p className="text-xs text-muted-foreground">
                ✓ Paiement à la livraison
              </p>
              <p className="text-xs text-muted-foreground">
                ✓ Support WhatsApp disponible
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-50 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-8 h-8" />
          </button>
          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-50"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev + 1) % product.images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-50"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i); }}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === selectedImageIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <img
            src={product.images[selectedImageIndex] || "/placeholder.svg"}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modals */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {product && selectedSize && (
        <OrderModal
          product={product}
          selectedSize={selectedSize}
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}
    </PublicLayout>
  );
};

export default ProductPage;
