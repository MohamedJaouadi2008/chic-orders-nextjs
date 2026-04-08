import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";
import { NewsletterForm } from "@/components/landing/NewsletterForm";

export function Footer() {
  const { data: settings } = useSettings();

  return (
    <footer className="bg-background border-t border-border/50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <Link 
              href="/" 
              className="text-xl font-extralight tracking-[0.3em] uppercase text-primary"
            >
              Miss
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light">
              Lingerie de qualité pour la femme moderne.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-primary mb-4 font-light">
              Navigation
            </h3>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/boutique" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-light"
              >
                Boutique
              </Link>
              <Link 
                href="/#featured" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-light"
              >
                Sélection Vedette
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-primary mb-4 font-light">
              Contact
            </h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground font-light">
              {settings?.whatsapp_number && (
                <a 
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-300"
                >
                  WhatsApp: {settings.whatsapp_number}
                </a>
              )}
              {settings?.telegram_username && (
                <a 
                  href={`https://t.me/${settings.telegram_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Telegram: @{settings.telegram_username}
                </a>
              )}
              {settings?.delivery_zones && (
                <p className="mt-2">
                  Zones de livraison: {settings.delivery_zones}
                </p>
              )}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <NewsletterForm />
          </div>
        </div>

        {/* Copyright & Credit */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Miss. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
