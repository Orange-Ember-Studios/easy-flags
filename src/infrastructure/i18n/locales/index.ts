import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import type { LanguagesMap } from "../translator";

export const translations: LanguagesMap = {
  en,
  es,
  fr,
};

export type AvailableLanguages = "en" | "es" | "fr";

export const DEFAULT_LANGUAGE: AvailableLanguages = "en";
