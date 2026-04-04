import type { APIRoute } from "astro";
import { translations } from "@/infrastructure/i18n/locales";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const lang = url.searchParams.get("lang");
  const redirectTo = url.searchParams.get("redirect") || "/";

  if (lang && translations[lang]) {
    // Set cookie for 1 year
    cookies.set("lang", lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    // Append ?lang=xx to the redirect URL, unless it's English
    try {
      // Use absolute URL for manipulation if it's already a full URL, 
      // otherwise prepend a dummy base to handle relative paths
      const isRelative = !redirectTo.startsWith("http");
      const base = isRelative ? "http://localhost" : "";
      const urlToRedirect = new URL(redirectTo, base);
      
      // Clear existing lang param if any
      urlToRedirect.searchParams.delete("lang");
      
      // Add new lang param if not english
      if (lang !== "en") {
        urlToRedirect.searchParams.set("lang", lang);
      }
      
      // Return relative or absolute URL back
      return redirect(isRelative ? urlToRedirect.pathname + urlToRedirect.search + urlToRedirect.hash : urlToRedirect.toString());
    } catch (e) {
      // Fallback if URL parsing fails
      return redirect(redirectTo);
    }
  }

  return redirect(redirectTo);
};
