import { defineMiddleware } from "astro:middleware";
import { getLocale } from "./infrastructure/i18n/astro";
import { SUPPORTED_LOCALES } from "./infrastructure/i18n/locales";

export const onRequest = defineMiddleware((context, next) => {
  const { url, request, redirect, cookies } = context;

  // Skip middleware for API, internal Astro routes, and static assets
  const isApi = url.pathname.startsWith("/api/");
  const isInternal = url.pathname.startsWith("/_");
  const isStatic = url.pathname.includes(".");

  if (isApi || isInternal || isStatic) {
    return next();
  }

  const pathParts = url.pathname.split("/");
  const firstPart = pathParts[1];
  const isSupportedLocale = (SUPPORTED_LOCALES as string[]).includes(firstPart);

  // If already has a supported locale prefix, we are good
  if (isSupportedLocale) {
    // Optional: Sync cookie with URL prefix
    cookies.set("lang", firstPart, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    return next();
  }

  // No localized prefix found, decide where to redirect
  const finalLocale = getLocale(request);

  // Redirect to the prefixed version
  // e.g., /billing -> /en/billing
  // Use trailing slash for the root to avoid double redirects on some platforms
  const newPathname = `/${finalLocale}${url.pathname === "/" ? "/" : url.pathname}`;
  const response = redirect(newPathname + url.search + url.hash);
  
  // CRITICAL: Tell CDNs (like Vercel) that this response depends on Accept-Language and Cookie
  response.headers.set("Vary", "Accept-Language, Cookie");
  
  return response;
});
