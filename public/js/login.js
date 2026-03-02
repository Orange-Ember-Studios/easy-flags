// Login module - handles login/logout functionality

/**
 * Initialize login event handlers
 */
function initLoginModule() {
  const loginBtn = document.getElementById("btnLogin");
  const logoutBtn = document.getElementById("btnLogout");

  if (loginBtn) {
    loginBtn.onclick = handleLogin;
  }

  if (logoutBtn) {
    logoutBtn.onclick = handleLogout;
  }
}

/**
 * Handle login form submission
 */
async function handleLogin() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p }),
    credentials: "include", // Include cookies
  });
  const data = await res.json();
  if (data.token || res.ok) {
    // Cookie is automatically set by server, navigate to protected area
    window.location.href = "/environments";
  } else {
    const lm = document.getElementById("loginMsg");
    if (lm) {
      lm.innerText = data.error || "Login failed";
      lm.classList.add("login-error");
      lm.setAttribute("role", "alert");
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
  window.location.href = "/";
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initLoginModule);
