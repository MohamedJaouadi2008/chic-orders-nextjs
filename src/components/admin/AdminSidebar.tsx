"use client";
import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingCart, Package, Tags, Star, Percent, Settings, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const ADMIN_BASE = "/gestion-de-commande-3xCCM21";
const navItems = [{
  href: `${ADMIN_BASE}/dashboard`,
  label: "Tableau de bord",
  icon: LayoutDashboard
}, {
  href: `${ADMIN_BASE}/commandes`,
  label: "Commandes",
  icon: ShoppingCart
}, {
  href: `${ADMIN_BASE}/produits`,
  label: "Produits",
  icon: Package
}, {
  href: `${ADMIN_BASE}/categories`,
  label: "Catégories",
  icon: Tags
}, {
  href: `${ADMIN_BASE}/selection-vedette`,
  label: "Sélection vedette",
  icon: Star
}, {
  href: `${ADMIN_BASE}/soldes`,
  label: "Soldes",
  icon: Percent
}, {
  href: `${ADMIN_BASE}/parametres`,
  label: "Paramètres",
  icon: Settings
}];
interface AdminSidebarProps {
  currentPath: string;
}
export function AdminSidebar({
  currentPath
}: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    signOut,
    user
  } = useAdmin();
  return <>
      {/* Mobile Menu Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-md border border-sidebar-border">
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn("fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300 lg:translate-x-0 py-0 my-0", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center">
              <img src={logo.src} alt="سيدتي" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
            const isActive = currentPath === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50")}>
                  <item.icon size={18} />
                  {item.label}
                </Link>;
          })}
          </nav>


          {/* User & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            {user && <p className="text-xs text-sidebar-foreground/50 mb-3 truncate">
                {user.email}
              </p>}
            <Button variant="ghost" onClick={signOut} className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut size={18} className="mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>;
}