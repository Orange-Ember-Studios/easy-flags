/**
 * Main Application Entry Point
 * Loads all modules and initializes the application
 */

// Initialize application
document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;

  if (path.startsWith("/features")) {
    if (typeof loadEnvs === "function") await loadEnvs();
    if (typeof loadFeatures === "function") await loadFeatures();
    return;
  }

  if (path.startsWith("/environments")) {
    if (typeof loadEnvs === "function") await loadEnvs();
    return;
  }
});
