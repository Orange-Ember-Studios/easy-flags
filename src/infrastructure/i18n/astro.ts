import { 
  createTranslator, 
  getLocalizedPath as sharedGetLocalizedPath 
} from "./translator";
import {
  translations,
  DEFAULT_LANGUAGE,
  SUPPORTED_LOCALES,
  type AvailableLanguages,
} from "./locales";

/**
 * Gets the current locale from an Astro request.
 */
export function getLocale(request: Request): AvailableLanguages {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Check URL path prefix (e.g., /es/...)
  const pathParts = pathname.split("/");
  const firstPart = pathParts[1];
  if (firstPart && SUPPORTED_LOCALES.includes(firstPart as AvailableLanguages)) {
    return firstPart as AvailableLanguages;
  }

  // 2. Fallback to URL query params (e.g., ?lang=es)
  try {
    const langParam = url.searchParams.get("lang");
    if (langParam && SUPPORTED_LOCALES.includes(langParam as AvailableLanguages)) {
      return langParam as AvailableLanguages;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }

  // 3. Check for a 'lang' cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...v] = c.trim().split("=");
        return [key, v.join("=")];
      }),
    );
    if (cookies.lang && SUPPORTED_LOCALES.includes(cookies.lang as AvailableLanguages)) {
      return cookies.lang as AvailableLanguages;
    }
  }

  // 4. Check Accept-Language header (Browser preference)
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    // Parse the header (e.g., "es-ES,es;q=0.9,en;q=0.8")
    // Handling both "-" and "_" as separators
    const preferredLocales = acceptLanguage
      .split(",")
      .map((lang) => {
        const fullTag = lang.split(";")[0].trim().toLowerCase();
        return fullTag.split(/[-_]/)[0]; // Get the base language code (es, en, etc.)
      })
      .filter(Boolean);

    // Find the first one that we support
    const matchedLocale = preferredLocales.find(
      (lang) => SUPPORTED_LOCALES.includes(lang as AvailableLanguages),
    );
    
    if (matchedLocale) {
      return matchedLocale as AvailableLanguages;
    }
  }

  // 5. Default fallback to English (as per requirement)
  return DEFAULT_LANGUAGE;
}

/**
 * Returns a path prefixed with the given locale.
 * It removes any existing locale prefix if present.
 */
export function getLocalizedPath(path: string, locale: AvailableLanguages): string {
  return sharedGetLocalizedPath(path, locale as string, SUPPORTED_LOCALES as string[]);
}

/**
 * Creates a server-side translator for Astro pages.
 */
export function getTranslator(request: Request) {
  const lang = getLocale(request);
  return {
    t: createTranslator(
      lang as string,
      translations,
      DEFAULT_LANGUAGE as string,
    ),
    lang,
    getLocalizedPath: (path: string, targetLang: string = lang) => 
      getLocalizedPath(path, targetLang as AvailableLanguages),
  };
}

