import { useScrollReveal } from "@/hooks/useScrollReveal";

export function BrandStatement() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });

  return (
    <section className="py-20 md:py-48 relative bg-background" ref={ref}>
      {/* Subtle gold glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[100px] md:blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Gold divider line - top */}
          <div 
            className={`flex justify-center mb-8 md:mb-12 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 1s ease-out' }}
          >
            <div className={`h-px bg-primary ${isVisible ? 'w-16 md:w-24' : 'w-0'}`} style={{ transition: 'width 1s ease-out' }} />
          </div>

          {/* Main statement - confident and slow */}
          <p 
            className={`text-xl md:text-2xl lg:text-3xl font-extralight leading-relaxed text-foreground tracking-wide ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transition: 'all 1s ease-out 0.3s' }}
          >
            Chez <span className="text-primary font-bold">سيدتي</span>, chaque pièce est choisie 
            pour sublimer la femme moderne.
          </p>

          <p 
            className={`text-lg md:text-xl font-light text-muted-foreground mt-6 tracking-wide ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transition: 'all 1s ease-out 0.5s' }}
          >
            Style, qualité, caractère.
          </p>

          {/* Gold divider line - bottom */}
          <div 
            className={`flex justify-center mt-8 md:mt-12 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 1s ease-out 0.7s' }}
          >
            <div className={`h-px bg-primary ${isVisible ? 'w-16 md:w-24' : 'w-0'}`} style={{ transition: 'width 1s ease-out 0.7s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
