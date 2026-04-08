import { Truck, Star, Clock } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

const signals = [
  {
    icon: Truck,
    title: "Livraison Discrète",
    description: "Emballage neutre et discret",
    stat: 48,
    statSuffix: "h",
    statLabel: "délai moyen",
  },
  {
    icon: Star,
    title: "Qualité Premium",
    description: "Matériaux sélectionnés avec soin",
    stat: 100,
    statSuffix: "%",
    statLabel: "satisfaites",
  },
  {
    icon: Clock,
    title: "Support WhatsApp",
    description: "Conseils personnalisés",
    stat: 24,
    statSuffix: "/7",
    statLabel: "disponible",
  },
];

function AnimatedStat({ value, suffix, enabled }: { value: number; suffix: string; enabled: boolean }) {
  const count = useCountUp({ end: value, duration: 2000, enabled });
  return (
    <span className="text-3xl md:text-4xl font-extralight text-primary">
      {count}{suffix}
    </span>
  );
}

export function TrustSignals() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="py-16 md:py-32 bg-card/50" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className={`text-center mb-10 md:mb-16 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-lg md:text-2xl font-extralight tracking-[0.25em] uppercase mb-4 md:mb-6 text-foreground">
            Nos Engagements
          </h2>
          <div className={`h-px w-16 bg-primary mx-auto ${isVisible ? 'animate-draw-line' : 'w-0'}`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 max-w-5xl mx-auto">
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            
            return (
              <div
                key={signal.title}
                className={`text-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                {/* Icon - simple gold outline */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 border border-primary/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Animated stat */}
                <div className="mb-4">
                  <AnimatedStat 
                    value={signal.stat} 
                    suffix={signal.statSuffix} 
                    enabled={isVisible}
                  />
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                    {signal.statLabel}
                  </p>
                </div>

                <h3 className="text-sm uppercase tracking-[0.2em] mb-2 font-light text-foreground">
                  {signal.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {signal.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
