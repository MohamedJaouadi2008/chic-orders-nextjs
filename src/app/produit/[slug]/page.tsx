import { Metadata } from 'next';
import { supabase } from '@/integrations/supabase/client';
import ProductPage from '@/views/ProductPage';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!product) {
    return { title: 'Produit Introuvable - Chic Orders' };
  }

  const description = product.description
    ? product.description.slice(0, 155)
    : `Achetez ${product.name}. Livraison disponible dans toute la Tunisie.`;

  return {
    title: `${product.name} - Chic Orders`,
    description,
    openGraph: {
      title: `${product.name} - Chic Orders`,
      description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default function Page() {
  return <ProductPage />;
}
