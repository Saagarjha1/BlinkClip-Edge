const API_URL = "https://blinkclip.onrender.com";
let allClips = [];
let visibleCount = 0;
const BATCH_SIZE = 10;
let isLoginMode = true;  // Start in login mode

document.addEventListener("DOMContentLoaded", () => {
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const togglePassword = document.getElementById("toggle-password");
  const formHeader = document.getElementById("form-header");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const toggleMode = document.getElementById("toggle-mode");
  const errorEl = document.getElementById("error");
  const loginForm = document.getElementById("login-form");
  const loggedInSection = document.getElementById("logged-in-section");
  const clipList = document.getElementById("clipList");
  const loadMoreBtn = document.getElementById("load-more");

  // Password visibility toggle
  togglePassword.addEventListener("click", () => {
    const type = passwordEl.type === "password" ? "text" : "password";
    passwordEl.type = type;
    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
  });

  // Mode toggle (switch between login and signup)
  toggleMode.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
      formHeader.textContent = "Login";
      loginBtn.style.display = "block";
      signupBtn.style.display = "none";
      toggleMode.textContent = "Don't have an account? Sign Up";
    } else {
      formHeader.textContent = "Sign Up";
      loginBtn.style.display = "none";
      signupBtn.style.display = "block";
      toggleMode.textContent = "Already have an account? Login";
    }
    clearError();
    emailEl.classList.remove("invalid");
    passwordEl.classList.remove("invalid");
  });

  // On load, check token and fetch clips
  chrome.storage.local.get(["jwtToken"], ({ jwtToken: token }) => {
    if (token) {
      fetchClips(token);
    } else {
      showLogin();
    }
  });

  // Login handler
  loginBtn.addEventListener("click", async () => {
    if (!validateInputs()) return;
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEl.value.trim(), password: passwordEl.value.trim() }),
      });
      const data = await handleResponse(res);
      await chrome.storage.local.set({ jwtToken: data.token });
      await fetchClips(data.token);
    } catch (err) {
      showError(err);
    }
  });

  // Signup handler
  signupBtn.addEventListener("click", async () => {
    if (!validateInputs()) return;
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEl.value.trim(), password: passwordEl.value.trim() }),
      });
      const data = await handleResponse(res);
      await chrome.storage.local.set({ jwtToken: data.token });
      await fetchClips(data.token);
    } catch (err) {
      showError(err);
    }
  });

  // Logout handler
  document.getElementById("logout-btn").addEventListener("click", () => {
    chrome.storage.local.remove(["jwtToken"], () => {
      showLogin();
      emailEl.value = "";
      passwordEl.value = "";
      clipList.innerHTML = "";
      allClips = [];
      visibleCount = 0;
      loadMoreBtn.style.display = "none";
      isLoginMode = true;  // Reset to login mode
      formHeader.textContent = "Login";
      loginBtn.style.display = "block";
      signupBtn.style.display = "none";
      toggleMode.textContent = "Don't have an account? Sign Up";
    });
  });

  // Load More handler
  loadMoreBtn.addEventListener("click", () => {
    showMoreClips();
  });

  // Fetch clips (unchanged)
  async function fetchClips(token) {
    try {
      clipList.textContent = "Loading clips...";
      const res = await fetch(`${API_URL}/api/clips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      allClips = await handleResponse(res);
      clipList.innerHTML = "";
      if (Array.isArray(allClips) && allClips.length > 0) {
        allClips.forEach((clip) => {
          const el = document.createElement("div");
          el.className = "clip";
          el.innerHTML = `<strong>${clip.text.substring(0, 50)}...</strong><br><small>From: ${clip.pageTitle || "Unknown"} (${clip.sourceUrl || "No URL"})</small>`;
          clipList.appendChild(el);
        });
        visibleCount = 0;
        showMoreClips();
        showLoggedIn();
      } else {
        clipList.textContent = "No clips saved.";
        loadMoreBtn.style.display = "none";
        showLoggedIn();
      }
    } catch (err) {
      clipList.textContent = "Failed to load clips.";
      loadMoreBtn.style.display = "none";
      showError(err);
      chrome.storage.local.remove(["jwtToken"]);
      showLogin();
    }
  }

  // Show more clips (unchanged)
  function showMoreClips() {
    const nextBatchEnd = visibleCount + BATCH_SIZE;
    for (let i = visibleCount; i < nextBatchEnd && i < allClips.length; i++) {
      clipList.children[i].classList.add("visible");
    }
    visibleCount = nextBatchEnd;
    if (visibleCount >= allClips.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "block";
    }
  }

  // Show logged-in section
  function showLoggedIn() {
    loginForm.classList.remove("active");
    loggedInSection.classList.add("active");
    clearError();
  }

  // Show login form
  function showLogin() {
    loginForm.classList.add("active");
    loggedInSection.classList.remove("active");
    clipList.innerHTML = "";
    loadMoreBtn.style.display = "none";
    clearError();
    emailEl.classList.remove("invalid");
    passwordEl.classList.remove("invalid");
  }

  // Validate inputs
  function validateInputs() {
    clearError();
    const email = emailEl.value.trim();
    const password = passwordEl.value.trim();
    emailEl.classList.remove("invalid");
    passwordEl.classList.remove("invalid");
    if (!email || !password) {
      showError("Email and password are required.");
      if (!email) emailEl.classList.add("invalid");
      if (!password) passwordEl.classList.add("invalid");
      return false;
    }
    if (!email.includes("@")) {
      showError("Invalid email format.");
      emailEl.classList.add("invalid");
      return false;
    }
    return true;
  }

  // Handle API response (unchanged)
  async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) {
      throw data.error || "Request failed.";
    }
    return data;
  }

  // Show error
  function showError(msg) {
    errorEl.textContent = msg;
  }

  // Clear error
  function clearError() {
    errorEl.textContent = "";
  }
});
