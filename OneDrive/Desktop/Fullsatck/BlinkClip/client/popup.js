const API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const errorEl = document.getElementById("error");
  const loginForm = document.getElementById("login-form");
  const userInfo = document.getElementById("user-info");
  const usernameSpan = document.getElementById("username");
  const clipList = document.getElementById("clipList");

  chrome.storage.local.get(["jwtToken"], (result) => {
    const token = result.jwtToken;
    if (token) {
      fetchUserInfo(token);
      fetchClips(token);
    } else {
      showLogin();
    }
  });

  document.getElementById("login-btn").addEventListener("click", async () => {
    const email = emailEl.value;
    const password = passwordEl.value;
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) return showError(data.error);
      chrome.storage.local.set({ jwtToken: data.token }, () => {
        fetchUserInfo(data.token);
        fetchClips(data.token);
      });
    } catch {
      showError("Network error");
    }
  });

  document.getElementById("signup-btn").addEventListener("click", async () => {
    const email = emailEl.value;
    const password = passwordEl.value;
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) return showError(data.error);
      chrome.storage.local.set({ jwtToken: data.token }, () => {
        fetchUserInfo(data.token);
        fetchClips(data.token);
      });
    } catch {
      showError("Network error");
    }
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    chrome.storage.local.remove(["jwtToken"], () => {
      showLogin();
      clipList.innerHTML = "";
    });
  });

  function fetchUserInfo(token) {
    fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showLogin();
          return;
        }
        usernameSpan.textContent = data.email;
        userInfo.classList.add("active");
        loginForm.classList.remove("active");
        errorEl.textContent = "";
      });
  }

  function fetchClips(token) {
    fetch(`${API_URL}/api/clips`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        clipList.innerHTML = "";
        if (data.clips && data.clips.length > 0) {
          data.clips.forEach((clip) => {
            const el = document.createElement("div");
            el.className = "clip";
            el.textContent = clip.text;
            clipList.appendChild(el);
          });
        } else {
          clipList.textContent = "No clips saved.";
        }
      });
  }

  function showLogin() {
    loginForm.classList.add("active");
    userInfo.classList.remove("active");
  }

  function showError(msg) {
    errorEl.textContent = msg;
  }
});
