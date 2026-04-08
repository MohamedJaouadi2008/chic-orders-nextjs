"use client";
import Link from "next/link";
import type { Tables } from "@/integrations/supabase/types";
import { useState } from "react";

interface CategoryTileProps {
  category: Tables<"categories">;
  index: number;
  isVisible: boolean;
}

export function CategoryTile({ category, index, isVisible }: CategoryTileProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/boutique?category=${category.slug}`}
      className={`group relative aspect-[4/3] sm:aspect-square bg-card overflow-hidden ${
        isVisible ? 'animate-fade-in' : 'opacity-0'
      }`}
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dark overlay - gets slightly lighter on hover */}
      <div 
        className={`absolute inset-0 bg-background/60 transition-all duration-700 ${
          isHovered ? 'bg-background/40' : 'bg-background/60'
        }`}
      />

      {/* Content positioned at center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        <h3 
          className={`text-xl md:text-2xl font-extralight tracking-[0.2em] uppercase transition-all duration-500 ${
            isHovered ? 'text-primary' : 'text-foreground'
          }`}
        >
          {category.name}
        </h3>
        
        {/* Gold underline on hover */}
        <div 
          className={`h-px bg-primary mt-4 transition-all duration-500 ${
            isHovered ? 'w-16 opacity-100' : 'w-0 opacity-0'
          }`}
        />
        
        {/* Discover text */}
        <span 
          className={`text-xs uppercase tracking-[0.3em] mt-4 transition-all duration-500 ${
            isHovered ? 'text-primary opacity-100 translate-y-0' : 'text-muted-foreground opacity-0 translate-y-2'
          }`}
        >
          Découvrir
        </span>
      </div>

      {/* Gold corner accents on hover */}
      <div className="absolute top-4 left-4 w-8 h-8 pointer-events-none">
        <div 
          className={`absolute top-0 left-0 h-px bg-primary transition-all duration-500 ${
            isHovered ? 'w-full' : 'w-0'
          }`}
        />
        <div 
          className={`absolute top-0 left-0 w-px bg-primary transition-all duration-500 delay-75 ${
            isHovered ? 'h-full' : 'h-0'
          }`}
        />
      </div>
      
      <div className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none">
        <div 
          className={`absolute bottom-0 right-0 h-px bg-primary transition-all duration-500 ${
            isHovered ? 'w-full' : 'w-0'
          }`}
        />
        <div 
          className={`absolute bottom-0 right-0 w-px bg-primary transition-all duration-500 delay-75 ${
            isHovered ? 'h-full' : 'h-0'
          }`}
        />
      </div>
    </Link>
  );
}
