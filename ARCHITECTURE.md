ARCHITECTURE.MD — سيدتي (Miss)

Audience: Marketing/SEO Expert
Last Updated: February 2026
Project: mylady.lovable.app

1. Project Overview
Site Type

SPA (Single Page Application) built with Vite + React.

Dynamic rendering on the client side; no server-side rendering (SSR) for product pages.

Pages do not reload; content is fetched from the database.

Content Sources
Content Type	Source	Editable by Marketing
Products (name, description, price, images)	Database via admin panel	✅ Yes
Categories	Database via admin panel	✅ Yes
Featured products	Admin panel	✅ Yes
Global texts (footer, header, homepage)	Code	❌ No
Global meta tags	index.html	❌ No
2. SEO Architecture
Automatic Behaviors
Element	Mechanism	Notes
Product title	Injected from product.name	Appears in <title> and H1
Product URL	Derived from slug	/produit/[slug]
Open Graph image	First product image	Shared previews use first image only
Structured content	H1/H2 applied in React components	Semantic HTML for products and categories
Mobile responsiveness	CSS Grid + Flexbox	All pages adaptive
Manual Control
Editable Field	Impact
name	Title, H1, search engine snippet
description	Page content, search indexing
slug	URL for indexing
images	Visuals for page and social previews
category	URL structure, navigation
Limitations

SPA with client-side rendering only.

Social crawlers (Facebook, WhatsApp) read global meta tags; product-specific meta is not rendered server-side.

Google indexing occurs after JS execution; meta tags per product do not exist in initial HTML.

Adding new pages or modifying global meta requires developer intervention.

3. Data Flow Diagram (Product Page Example)
┌─────────────┐
│ Database    │
│ (Products)  │
└─────┬───────┘
      │ API fetch
      ▼
┌─────────────┐
│ React SPA   │
│ Components  │
└─────┬───────┘
      │ Client-side render
      ▼
┌─────────────┐
│ Browser /   │
│ SEO crawler │
└─────────────┘


Implications:

Meta tags per product only exist in runtime DOM.

Social previews will show global defaults.

URLs are indexable; Googlebot will eventually render content.

4. Marketing Editable Fields Map
Field	Component	Notes
Product Name	product.name	Used for <title> and H1
Product Description	product.description	Indexed content; SEO-rich text
Slug	product.slug	URL path; must remain stable after indexing
Images	product.images	OG image = first uploaded image
Category Name	category.name	Displayed in navigation; impacts URL hierarchy
Featured Products	admin.featured	Displayed on homepage; limited selection

Constraints:

Slugs must not change once indexed.

Fields outside the admin panel (homepage text, global meta) require a developer.

5. SEO Considerations

Titles and H1 are generated from product.name.

Descriptions are injected dynamically; optimize within the admin panel.

Images: first uploaded image = OG/social preview.

SPA delays indexing by crawlers that do not execute JS immediately.

No server-side meta injection; consider prerendering or prerender.io if product-level OG previews are critical.

Canonical URLs are /produit/[slug].

6. Sitemap & Robots.txt Configuration

The site includes SEO crawling configuration files:

Sitemap (public/sitemap.xml)
- Located at: https://mylady.lovable.app/sitemap.xml
- Contains: Homepage (/) and Boutique (/boutique) URLs
- Priority: Homepage = 1.0, Boutique = 0.9
- Update frequency: Homepage weekly, Boutique daily
- Note: Product pages are not included (static sitemap); Googlebot discovers them via internal links

Robots.txt (public/robots.txt)
- Allows all major crawlers (Googlebot, Bingbot, social bots)
- References the sitemap for discovery
- Blocks admin panel (/gestion-de-commande-3xCCM21) from indexing

⚠️ Important:
- Do NOT edit these files without developer assistance
- The admin URL is intentionally hidden from search engines
- If product URLs need to be added to sitemap, contact developer

7. Category & Homepage Notes
Page	Editable	Limitations
Homepage hero	❌	Fixed in code
Featured products	✅	Choose high-SEO products
Categories	✅	Slug must remain stable
Category page text	❌	Fixed; cannot add descriptive content
7. Best Practices (Expert Level)

Maintain consistent naming conventions for products and categories.

Avoid changing slugs for indexed items.

Optimize product descriptions directly in admin panel with primary and secondary keywords.

Monitor product indexing status in Google Search Console.

Images: ensure high-quality first image for social previews; other images support engagement.

For social preview accuracy, consider optional pre-rendering service.

8. Best Practices (Expert Level)

Maintain consistent naming conventions for products and categories.

Avoid changing slugs for indexed items.

Optimize product descriptions directly in admin panel with primary and secondary keywords.

Monitor product indexing status in Google Search Console.

Images: ensure high-quality first image for social previews; other images support engagement.

For social preview accuracy, consider optional pre-rendering service.

9. Developer Contact

For technical updates:

Global meta tags or page structure changes.

Adding new pages or modifying SPA behavior.

Implementing pre-rendering or SSR for SEO.

Sitemap or robots.txt modifications.

End of Document — Architecture & SEO Guide
