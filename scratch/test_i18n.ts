
import { getLocale } from "./src/infrastructure/i18n/astro";
import { DEFAULT_LANGUAGE } from "./src/infrastructure/i18n/locales";

// Mock Request
function createMockRequest(headers: Record<string, string>, url: string = "http://localhost:3000/") {
    return {
        url,
        headers: {
            get: (name: string) => headers[name.toLowerCase()] || null
        }
    } as any;
}

console.log("Test 1: Spanish browser");
const req1 = createMockRequest({ "accept-language": "es-ES,es;q=0.9" });
console.log("Result:", getLocale(req1)); // Expected: es

console.log("\nTest 2: French browser");
const req2 = createMockRequest({ "accept-language": "fr-FR,fr;q=0.9" });
console.log("Result:", getLocale(req2)); // Expected: fr

console.log("\nTest 3: German browser (unsupported)");
const req3 = createMockRequest({ "accept-language": "de-DE,de;q=0.9" });
console.log("Result:", getLocale(req3)); // Expected: en

console.log("\nTest 4: No header");
const req4 = createMockRequest({});
console.log("Result:", getLocale(req4)); // Expected: en

console.log("\nTest 5: Cookie overrides browser");
const req5 = createMockRequest({ "accept-language": "es-ES", "cookie": "lang=fr" });
console.log("Result:", getLocale(req5)); // Expected: fr
