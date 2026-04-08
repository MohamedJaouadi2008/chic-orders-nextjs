"use client";
import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
}

export function useSEO({ title, description, canonicalUrl, ogImage, jsonLd }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    setMeta("description", description);

    // Open Graph
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    if (ogImage) setMetaProperty("og:image", ogImage);
    if (canonicalUrl) setMetaProperty("og:url", canonicalUrl);

    // Twitter
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (ogImage) setMeta("twitter:image", ogImage);

    // Canonical
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    // JSON-LD
    let script = document.querySelector<HTMLScriptElement>('script[data-seo-jsonld]');
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      // Cleanup JSON-LD on unmount
      const s = document.querySelector('script[data-seo-jsonld]');
      if (s) s.remove();
      // Cleanup canonical
      const c = document.querySelector('link[rel="canonical"]');
      if (c) c.remove();
    };
  }, [title, description, canonicalUrl, ogImage, jsonLd]);
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.content = content;
}
