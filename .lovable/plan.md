

# Fix All Audit Issues

## Summary

After thorough re-investigation, here is the corrected status:
- **Triggers are correctly attached** (short_id, price snapshot, stock decrement, stock restore, updated_at) -- all 5 are live on the `orders` table.
- **No foreign keys exist** in the entire public schema -- this is the real data integrity gap.
- **RLS has a critical permissive INSERT policy** on `orders`.
- **Edge function `clear-orders-log`** uses broken raw SMTP code instead of nodemailer.
- **Branding inconsistencies** in emails and admin login.
- **404 page** is in English.
- **Bulk cancel** skips reason prompt.

---

## Phase 1: Database Fixes (SQL Migrations)

### 1.1 Add Foreign Key Constraints
Create migration to add FK relationships:
- `orders.product_id` -> `products.id` (SET NULL on delete, so orders survive product deletion)
- `featured_products.product_id` -> `products.id` (CASCADE on delete)
- `admin_stock_log.product_id` -> `products.id` (SET NULL on delete)
- `user_roles.user_id` -> `auth.users(id)` (CASCADE on delete)

### 1.2 Fix RLS on `orders` Table
- Drop the policy `Public can create orders` (WITH CHECK true) -- orders are created via `create_order` RPC (SECURITY DEFINER), so no public INSERT policy is needed.

### 1.3 Fix RLS on `archived_orders` Table
- Drop the policy `System can archive orders` (INSERT WITH CHECK true) -- archival happens via `archive_and_clear_orders` RPC (SECURITY DEFINER), so no public INSERT policy is needed.

---

## Phase 2: Edge Function Fixes

### 2.1 Fix `clear-orders-log/index.ts`
- Replace the broken raw SMTP code (lines 214-298) with `nodemailer` (same pattern already used in `send-order-confirmation` and `send-newsletter-welcome`).
- Fix hardcoded owner email `samsari.owner@gmail.com` to use `GMAIL_USER` env var.

### 2.2 Fix Branding in Email Functions
- `send-order-confirmation/index.ts` line 179: Change `"MSSI Boutique"` to `"MyLady"`.
- `send-newsletter-welcome/index.ts` line 98: Change `"MSSI Boutique"` to `"MyLady"`.

---

## Phase 3: Frontend Fixes

### 3.1 Fix Admin Login Branding
- `src/pages/admin/AdminLoginPage.tsx` line 62: Change `"Miss Admin"` to `"MyLady Admin"`.

### 3.2 Fix Cart Storage Key
- `src/contexts/CartContext.tsx` line 22: Change `"sayyidati-cart"` to `"mylady-cart"`.

### 3.3 Fix 404 Page Language
- `src/pages/NotFound.tsx`: Translate to French ("Page non trouvee", "Retour a l'accueil").

### 3.4 Fix Bulk Cancel Missing Reason
- `src/pages/admin/AdminOrdersPage.tsx`: When bulk action is `"annulee"`, show a reason dialog (reuse `StatusChangeReasonDialog`) instead of directly updating. Apply the reason to each order in the batch.

---

## Phase 4: Performance (Low Priority)

### 4.1 N+1 Price Query
- In `useProductsWithPrices`, the `calculate_product_final_price` RPC is called once per product. This is a known limitation. A proper fix requires creating a new SQL function `calculate_all_product_prices()` that returns prices for all active products in a single query. This will be noted but can be deferred.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/[new]` | FK constraints, drop 2 RLS policies |
| `supabase/functions/clear-orders-log/index.ts` | Replace raw SMTP with nodemailer |
| `supabase/functions/send-order-confirmation/index.ts` | Fix branding |
| `supabase/functions/send-newsletter-welcome/index.ts` | Fix branding |
| `src/pages/admin/AdminLoginPage.tsx` | Fix branding |
| `src/contexts/CartContext.tsx` | Fix storage key |
| `src/pages/NotFound.tsx` | Translate to French |
| `src/pages/admin/AdminOrdersPage.tsx` | Add reason dialog for bulk cancel |

## What Is NOT Changed
- Stale cart prices (medium risk, but fixing requires significant refactor of CartContext to re-fetch prices on checkout -- deferred)
- N+1 price query (performance, deferred)
- 5-minute notification window (intentional security trade-off, documented)
- Static sitemap without product URLs (products are discovered via internal links)

