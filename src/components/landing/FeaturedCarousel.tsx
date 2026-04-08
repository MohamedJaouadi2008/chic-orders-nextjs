"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { ProductWithPrice } from "@/types/database";
import { formatPrice } from "@/lib/formatters";
import { SaleBadge } from "@/components/product/SaleBadge";
import { useState, forwardRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeaturedCarouselProps {
  products: ProductWithPrice[];
  isLoading: boolean;
}

interface FeaturedProductCardProps {
  product: ProductWithPrice;
}

const FeaturedProductCard = forwardRef<HTMLAnchorElement, FeaturedProductCardProps>(
  ({ product }, ref) => {
    const hasDiscount = product.discount_percent > 0;
    const imageUrl = product.images[0] || "/placeholder.svg";
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Link
        ref={ref}
        href={`/produit/${product.slug}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - larger, cleaner */}
        <div className="relative aspect-[3/4] overflow-hidden bg-card">
          {hasDiscount && (
            <SaleBadge discountPercent={product.discount_percent} />
          )}
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-contain transition-transform duration-700 ease-out ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            loading="eager"
          />
          
          {/* Subtle overlay on hover */}
          <div 
            className={`absolute inset-0 bg-background/20 transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Product Info - editorial style */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-light tracking-wide text-foreground uppercase">
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
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
              <span className="text-sm font-light text-muted-foreground">
                {formatPrice(product.final_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }
);

FeaturedProductCard.displayName = "FeaturedProductCard";

export function FeaturedCarousel({ products, isLoading }: FeaturedCarouselProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  if (isLoading) {
    return (
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 md:py-40" ref={ref} id="featured">
      <div className="container mx-auto px-4">
        {/* Section Title - minimal with gold line */}
        <div className={`text-center mb-12 md:mb-20 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-lg md:text-2xl font-extralight tracking-[0.25em] uppercase mb-4 md:mb-6 text-foreground">
            Sélection Vedette
          </h2>
          <div className={`h-px w-16 bg-primary mx-auto ${isVisible ? 'animate-draw-line' : 'w-0'}`} />
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.slice(0, 6).map((product) => (
                <CarouselItem key={product.id} className="pl-4 basis-full">
                  <FeaturedProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary" />
            <CarouselNext className="right-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary" />
          </Carousel>
        </div>

        {/* Desktop: Grid - more spacing, bigger cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-12 lg:gap-16">
          {products.slice(0, 3).map((product, index) => (
            <div
              key={product.id}
              className={`${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: `${0.2 + index * 0.15}s` }}
            >
              <FeaturedProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All Link - gold outline */}
        <div 
          className={`text-center mt-20 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: "0.6s" }}
        >
          <Link href="/boutique">
            <button className="btn-outline-gold group">
              Voir toute la collection
              <ArrowRight className="inline-block ml-3 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
