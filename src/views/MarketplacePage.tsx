"use client";
import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useProductsWithPrices } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Search } from "lucide-react";
import type { ProductWithPrice } from "@/types/database";

type SortOption = "newest" | "price-asc" | "price-desc";
type AvailabilityFilter = "all" | "in-stock" | "on-sale";

const MarketplacePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categorySlug = searchParams.get("category") || undefined;
  
  const setSearchParams = useCallback((newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(pathname + "?" + params.toString());
  }, [searchParams, pathname, router]);

  const { data: products, isLoading } = useProductsWithPrices(categorySlug);
  const { data: categories } = useCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Get max price from products
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 10000;
    return Math.max(...products.map((p) => p.original_price));
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Filter by search query (name only)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
    }

    // Filter by availability
    if (availability === "in-stock") {
      filtered = filtered.filter((p) => p.stock > 0);
    } else if (availability === "on-sale") {
      filtered = filtered.filter((p) => p.discount_percent > 0);
    }

    // Filter by price range
    filtered = filtered.filter((p) => p.final_price >= priceRange[0] && p.final_price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.final_price - b.final_price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.final_price - a.final_price);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [products, searchQuery, sortBy, availability, priceRange]);

  const clearCategory = () => {
    setSearchParams({});
  };

  const currentCategory = categories?.find((c) => c.slug === categorySlug);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase mb-4">
            {currentCategory ? currentCategory.name : "Boutique"}
          </h1>
          <div className="w-16 h-px bg-primary mx-auto" />
          {currentCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCategory}
              className="mt-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Effacer le filtre
            </Button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-border">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="pl-9 bg-background"
            />
          </div>
          {/* Category Filter */}
          <Select
            value={categorySlug || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                setSearchParams({});
              } else {
                setSearchParams({ category: value });
              }
            }}
          >
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select value={availability} onValueChange={(value) => setAvailability(value as AvailabilityFilter)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Disponibilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les produits</SelectItem>
              <SelectItem value="in-stock">En stock</SelectItem>
              <SelectItem value="on-sale">En solde</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nouveautés</SelectItem>
              <SelectItem value="price-asc">Prix ↑</SelectItem>
              <SelectItem value="price-desc">Prix ↓</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <div className="flex items-center gap-4 flex-1 min-w-[200px]">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Prix: {priceRange[0]} - {priceRange[1]} TND
            </span>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              min={0}
              max={maxPrice}
              step={100}
              className="flex-1"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-8">
          {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
        </p>

        {/* Product Grid */}
        <ProductGrid products={filteredProducts} isLoading={isLoading} />
      </div>
    </PublicLayout>
  );
};

export default MarketplacePage;
