// Header/Navigation module - handles navigation and mobile menu

/**
 * Initialize header and navigation
 */
function initHeaderModule() {
  initNavigation();
  initMobileMenu();
}

/**
 * Initialize navigation button handlers
 */
function initNavigation() {
  const logoutBtn = document.getElementById("btnLogout");
  // Set active nav on page load
  document.addEventListener("DOMContentLoaded", setActiveNav);
  try {
    setActiveNav();
  } catch (err) {
    // in case DOM isn't ready yet or setActiveNav isn't defined, ignore
  }

  // Handle navigation button clicks
  document
    .querySelectorAll("button[data-nav]")
    .forEach((b) => b.addEventListener("click", handleNavClick));

  if (logoutBtn) {
    logoutBtn.onclick = handleLogout;
  }
}

/**
 * Handle navigation button click
 * @param {Event} e - The click event
 */
function handleNavClick(e) {
  const p = e.target.closest("button[data-nav]").dataset.nav;
  if (p === "docs") {
    closeMobileNav();
    return (window.location.href = "/docs");
  }
  if (p === "envs") {
    closeMobileNav();
    return (window.location.href = "/environments");
  }
  if (p === "features") {
    closeMobileNav();
    return (window.location.href = "/features");
  }
  if (p === "pricing") {
    closeMobileNav();
    return (window.location.href = "/billing");
  }
  if (p === "login") {
    closeMobileNav();
    return (window.location.href = "/login");
  }
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", handleHamburgerClick);
    document.addEventListener("click", handleBodyClick);
    // Backdrop closes the drawer when tapped
    const backdrop = document.getElementById("navBackdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        const nav = document.getElementById("mainNav");
        if (nav) nav.classList.remove("open");
        backdrop.classList.remove("visible");
        hamburger.setAttribute("aria-expanded", "false");
      });
    }
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await fetch("/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  window.location.href = "/login";
}

/**
 * Handle hamburger menu toggle
 * @param {Event} e - The click event
 */
function handleHamburgerClick(e) {
  e.stopPropagation();
  const nav = document.getElementById("mainNav");
  if (!nav) return;
  const isOpen = nav.classList.toggle("open");
  const hamb = document.getElementById("hamburger");
  const backdrop = document.getElementById("navBackdrop");
  if (backdrop) {
    backdrop.classList.toggle("visible", isOpen);
  }
  if (hamb) hamb.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

/**
 * Handle clicks outside mobile menu
 * @param {Event} e - The click event
 */
function handleBodyClick(e) {
  const nav = document.getElementById("mainNav");
  if (!nav) return;
  const hamb = document.getElementById("hamburger");
  if (!nav.classList.contains("open")) return;
  const target = e.target;
  if (nav.contains(target) || (hamb && hamb.contains(target))) return;
  nav.classList.remove("open");
  const backdrop = document.getElementById("navBackdrop");
  if (backdrop) backdrop.classList.remove("visible");
  if (hamb) hamb.setAttribute("aria-expanded", "false");
}

/**
 * Close mobile nav/drawer and hide backdrop.
 */
function closeMobileNav() {
  const nav = document.getElementById("mainNav");
  const backdrop = document.getElementById("navBackdrop");
  const hamb = document.getElementById("hamburger");
  if (nav) nav.classList.remove("open");
  if (backdrop) backdrop.classList.remove("visible");
  if (hamb) hamb.setAttribute("aria-expanded", "false");
}

/**
 * Highlight the active nav button based on current path.
 */
function setActiveNav() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname || "/";
  let target = null;
  if (path.startsWith("/environments")) target = "envs";
  else if (path.startsWith("/features")) target = "features";
  else if (path.startsWith("/docs") || path.startsWith("/api")) target = "docs";
  else if (path.startsWith("/billing")) target = "pricing";
  else if (path.startsWith("/login")) target = "login";

  document.querySelectorAll("button[data-nav]").forEach((b) => {
    try {
      if (b.dataset && b.dataset.nav === target) b.classList.add("active");
      else b.classList.remove("active");
    } catch (err) {
      // ignore individual element issues
    }
  });
}

// Initialize on DOMContentLoaded or immediately if DOM already ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeaderModule);
} else {
  initHeaderModule();
}
