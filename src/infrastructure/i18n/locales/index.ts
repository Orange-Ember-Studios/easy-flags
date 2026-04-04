import { en } from "./en";
import { es } from "./es";
import type { LanguagesMap } from "../translator";

export const translations: LanguagesMap = {
  en,
  es,
};

export type AvailableLanguages = "en" | "es" | "fr";
export const DEFAULT_LANGUAGE: AvailableLanguages = "en";
