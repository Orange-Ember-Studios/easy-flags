import { defineMiddleware } from "astro:middleware";
import { getLocale } from "./infrastructure/i18n/astro";

export const onRequest = defineMiddleware((context, next) => {
  const { url, request, redirect, cookies } = context;
  

  // Skip middleware for API, internal Astro routes, and static assets
  const isApi = url.pathname.startsWith('/api/');
  const isInternal = url.pathname.startsWith('/_');
  const isStatic = url.pathname.includes('.');
  
  if (isApi || isInternal || isStatic) {
    return next();
  }

  const localeFromUrl = url.searchParams.get("lang");
  const localeFromCookie = cookies.get("lang")?.value;
  
  // Prefer URL, then cookie, then default 'en'
  const finalLocale = localeFromUrl || localeFromCookie || "en";


  // Only redirect if:
  // 1. Final locale is not English (we want to preserve ?lang=xx for non-default)
  // 2. The URL doesn't already have the correct lang param
  if (finalLocale !== "en" && localeFromUrl !== finalLocale) {
    const newUrl = new URL(url.toString());
    newUrl.searchParams.set("lang", finalLocale);
    return redirect(newUrl.pathname + newUrl.search + newUrl.hash);
  }

  return next();
});
