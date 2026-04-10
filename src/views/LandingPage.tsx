import { PublicLayout } from "@/components/layout/PublicLayout";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";
import { useCategories } from "@/hooks/useCategories";

// Landing page sections
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedCarousel } from "@/components/landing/FeaturedCarousel";
import { BrandStatement } from "@/components/landing/BrandStatement";
import { CollectionsGrid } from "@/components/landing/CollectionsGrid";
import { TrustSignals } from "@/components/landing/TrustSignals";
import { ContactCTA } from "@/components/landing/ContactCTA";

const LandingPage = () => {
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: categories } = useCategories();

  return (
    <PublicLayout>
      {/* 1. Full-viewport Hero */}
      <HeroSection />

      {/* 2. Featured Products Carousel/Grid */}
      <FeaturedCarousel 
        products={featuredProducts || []} 
        isLoading={featuredLoading} 
      />

      {/* 3. Brand Statement */}
      <BrandStatement />

      {/* 4. Collections (Categories) Grid */}
      <CollectionsGrid categories={categories || []} />

      {/* 5. Trust Signals */}
      <TrustSignals />

      {/* 6. Contact CTA */}
      <ContactCTA />
    </PublicLayout>
  );
};

export default LandingPage;
