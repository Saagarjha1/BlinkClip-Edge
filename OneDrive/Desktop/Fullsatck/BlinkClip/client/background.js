const API_URL = "http://localhost:5000";

// Check token on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["jwtToken"], (result) => {
    const token = result.jwtToken;
    if (token) {
      fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) chrome.storage.local.remove(["jwtToken"]);
        })
        .catch(() => chrome.storage.local.remove(["jwtToken"]));
    }
  });
});

// Log on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ QuickMark Extension Installed");
});

// Handle SAVE_CLIP requests from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SAVE_CLIP") {
    const { text, url, title, token } = request;

    if (!text || !token) {
      sendResponse({ success: false, error: "Missing text or token" });
      return;
    }

    fetch(`${API_URL}/clips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text, url, title })
    })
      .then(res => res.ok ? res.json() : Promise.reject("Failed to save"))
      .then(() => sendResponse({ success: true }))
      .catch(err => {
        console.error("❌ Save failed:", err);
        sendResponse({ success: false, error: err.toString() });
      });

    return true; // Keep channel open
  }
});
