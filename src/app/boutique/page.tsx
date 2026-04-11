import { Metadata } from 'next';
import BoutiquePage from './BoutiquePage';

export const metadata: Metadata = {
  title: 'Boutique - سيدتي',
  description: 'Découvrez notre collection exclusive de mode féminine de luxe. Sacs, vêtements et accessoires de qualité pour la femme moderne.',
  openGraph: {
    title: 'Boutique - سيدتي',
    description: 'Découvrez notre collection exclusive de mode féminine de luxe. Sacs, vêtements et accessoires de qualité pour la femme moderne.',
    type: 'website',
    siteName: 'سيدتي',
  },
};

export default function Page() {
  return <BoutiquePage />;
}
