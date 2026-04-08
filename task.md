# Migration to Next.js

1. [x] Planning phase
   - [x] Analyze codebase structure
   - [x] Determine routing migration plan
   - [x] Decide on data fetching updates
   - [x] Present implementation plan to user for review
2. [/] Project Initialization & Setup
   - [x] Install Next.js dependencies (`next`)
   - [x] Remove Vite and React Router dependencies
   - [x] Configure [next.config.mjs](file:///c:/Users/Mohamed/Desktop/chic-orders-main/next.config.mjs) and [tsconfig.json](file:///c:/Users/Mohamed/Desktop/chic-orders-main/tsconfig.json)
   - [x] Update [package.json](file:///c:/Users/Mohamed/Desktop/chic-orders-main/package.json) scripts
   - [x] Update [.env](file:///c:/Users/Mohamed/Desktop/chic-orders-main/.env) variable prefixes (`VITE_` -> `NEXT_PUBLIC_`)
3. [ ] Routing Architecture Migration (App Router)
   - [ ] Create base `src/app/layout.tsx` and migrate `Providers` and root `<App>` layout
   - [ ] Migrate Public Pages (`/`, `/boutique`, `/produit/[slug]`)
   - [ ] Implement `generateMetadata` for `/produit/[slug]` SEO
   - [ ] Migrate Admin Pages (`/gestion-de-commande-3xCCM21/*`)
4. [ ] Component Level Refactoring
   - [ ] Add `"use client"` directives to all Contexts, Shadcn UI, and interactive modules
   - [ ] Replace `<Link>` from `react-router-dom` with `next/link`
   - [ ] Replace `useNavigate` and `useParams` with `next/navigation`
5. [ ] Refinement & Verification
   - [ ] Clean up redundant Vite files ([src/App.tsx](file:///c:/Users/Mohamed/Desktop/chic-orders-main/src/App.tsx), [src/main.tsx](file:///c:/Users/Mohamed/Desktop/chic-orders-main/src/main.tsx), [index.html](file:///c:/Users/Mohamed/Desktop/chic-orders-main/index.html), [vite.config.ts](file:///c:/Users/Mohamed/Desktop/chic-orders-main/vite.config.ts))
   - [ ] Verify Next.js build process compilation
   - [ ] Run dev server and manually verify page routing and SEO tag generation
