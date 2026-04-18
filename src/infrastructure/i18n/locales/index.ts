import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import type { TranslationMap } from "../translator";

export type AvailableLanguages = "en" | "es" | "fr";

export const translations: Record<AvailableLanguages, TranslationMap> = {
  en,
  es,
  fr,
};

export const SUPPORTED_LOCALES: AvailableLanguages[] = ["en", "es", "fr"];

export const DEFAULT_LANGUAGE: AvailableLanguages = "en";
