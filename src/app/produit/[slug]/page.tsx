import { Metadata } from 'next';
import { supabaseServer } from '@/integrations/supabase/server';
import ProductPage from '@/views/ProductPage';

// Pre-render all product pages at build time for SEO
export async function generateStaticParams() {
  const { data: products } = await supabaseServer
    .from('products')
    .select('slug');

  return (products || []).map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;

  const { data: product } = await supabaseServer
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!product) {
    return {
      title: 'Produit Introuvable - سيدتي',
      description: 'Boutique de mode féminine de luxe. vêtements de qualité pour la femme moderne.',
    };
  }

  const description = product.description
    ? product.description.slice(0, 155)
    : `Achetez ${product.name} chez سيدتي. Livraison disponible dans toute la Tunisie.`;

  return {
    title: `${product.name} - سيدتي`,
    description,
    openGraph: {
      title: `${product.name} - سيدتي`,
      description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      type: 'website',
      siteName: 'سيدتي',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - سيدتي`,
      description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default function Page() {
  return <ProductPage />;
}
