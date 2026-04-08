"use client";
import { ReactNode, useEffect } from "react";
import {  useRouter, usePathname  } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2 } from "lucide-react";
interface AdminLayoutProps {
  children: ReactNode;
}
export function AdminLayout({
  children
}: AdminLayoutProps) {
  const {
    isAdmin,
    isLoading
  } = useAdmin();
  const navigate = useRouter();
  const location = usePathname();
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/gestion-de-commande-3xCCM21");
    }
  }, [isAdmin, isLoading, navigate]);
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  if (!isAdmin) {
    return null;
  }
  return <div className="min-h-screen bg-background flex">
      <AdminSidebar currentPath={location.pathname} />
      <main className="flex-1 lg:ml-64 py-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>;
}