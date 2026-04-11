"use client";
import { Suspense } from "react";
import MarketplacePage from "@/views/MarketplacePage";

export default function BoutiquePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <MarketplacePage />
    </Suspense>
  );
}
