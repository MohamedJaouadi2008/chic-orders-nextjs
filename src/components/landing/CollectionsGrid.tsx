import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CategoryTile } from "./CategoryTile";
import type { Tables } from "@/integrations/supabase/types";

interface CollectionsGridProps {
  categories: Tables<"categories">[];
}

export function CollectionsGrid({ categories }: CollectionsGridProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Title - minimal */}
        <div className={`text-center mb-10 md:mb-16 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-lg md:text-2xl font-extralight tracking-[0.25em] uppercase mb-4 md:mb-6 text-foreground">
            Collections
          </h2>
          <div className={`h-px w-16 bg-primary mx-auto ${isVisible ? 'animate-draw-line' : 'w-0'}`} />
        </div>

        {/* 2x2 Grid - dark tiles with gold accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {categories.slice(0, 4).map((category, index) => (
            <CategoryTile
              key={category.id}
              category={category}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
