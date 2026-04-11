"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { CartDropdown } from "@/components/cart/CartDropdown";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-28">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center hover:opacity-80 transition-opacity translate-y-1 md:translate-y-2"
          >
            <img 
              src={logo.src} 
              alt="سيدتي" 
              className="h-24 md:h-32 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/boutique" 
              className="text-sm uppercase tracking-[0.15em] text-foreground/60 hover:text-primary transition-colors duration-300"
            >
              Boutique
            </Link>
            <CartDropdown />
          </nav>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <CartDropdown />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <Link
              href="/boutique"
              className="text-sm uppercase tracking-[0.15em] text-foreground/60 hover:text-primary transition-colors duration-300 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Boutique
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
