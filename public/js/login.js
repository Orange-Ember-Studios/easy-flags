// Login module - handles login functionality

/**
 * Initialize login event handlers
 */
function initLoginModule() {
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("btnLogin");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  } else if (loginBtn) {
    loginBtn.onclick = handleLogin;
  }
}

function handleLoginSubmit(event) {
  event.preventDefault();
  return handleLogin();
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
  if (data && (data.success || data.token || res.ok)) {
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

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initLoginModule);
