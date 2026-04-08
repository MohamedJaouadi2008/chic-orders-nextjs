import { MessageCircle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSettings } from "@/hooks/useSettings";

export function ContactCTA() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const { data: settings } = useSettings();

  const whatsappNumber = settings?.whatsapp_number || "";
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : "#";

  return (
    <section className="py-16 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Gold line */}
          <div 
            className={`flex justify-center mb-8 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 1s ease-out' }}
          >
            <div className={`h-px bg-primary ${isVisible ? 'w-16' : 'w-0'}`} style={{ transition: 'width 1s ease-out' }} />
          </div>

          {/* Heading */}
          <h2 
            className={`text-2xl md:text-3xl font-extralight tracking-wide mb-4 text-foreground ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transition: 'all 1s ease-out 0.2s' }}
          >
            Besoin de conseils ?
          </h2>

          {/* Subtitle */}
          <p 
            className={`text-muted-foreground mb-10 font-light ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transition: 'all 1s ease-out 0.4s' }}
          >
            Notre équipe est à votre disposition
          </p>

          {/* WhatsApp CTA - gold outline style */}
          <div 
            className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transition: 'all 1s ease-out 0.6s' }}
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <button className="btn-outline-gold group">
                <MessageCircle className="inline-block mr-3 h-5 w-5" />
                Contactez-nous sur WhatsApp
              </button>
            </a>
          </div>

          {/* Bottom note */}
          <p 
            className={`text-xs text-muted-foreground mt-8 tracking-wider uppercase ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transition: 'opacity 1s ease-out 0.8s' }}
          >
            Réponse rapide • Conseils personnalisés
          </p>
        </div>
      </div>
    </section>
  );
}
