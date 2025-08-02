const API_URL = "https://blinkclip.onrender.com";

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
  console.log("✅ Blinkclip Extension Installed");
});

// Listen for Ctrl+Shift+Y shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "save-clip") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: copyAndGetSelectedText
      }, (results) => {
        const selectedText = results[0]?.result;
        if (selectedText) {
          chrome.storage.local.get(["jwtToken"], (data) => {
            const token = data.jwtToken;
            if (!token) {
              console.error("⚠️ No JWT token—login via popup");
              return;
            }
            // Save to server
            fetch(`${API_URL}/api/clip`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                text: selectedText,
                url: tab.url,
                title: tab.title
              })
            })
              .then(res => res.ok ? res.json() : Promise.reject("Failed to save"))
              .then(() => console.log("✅ Clip saved"))
              .catch(err => console.error("❌ Save failed:", err));
          });
        } else {
          console.warn("No text selected");
        }
      });
    });
  }
});

// Injected function to copy, get text, and show colorful alert
function copyAndGetSelectedText() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    navigator.clipboard.writeText(selectedText)
      .then(() => {
        console.log("✅ Text copied to clipboard");
        // Create and show colorful alert
        const alertDiv = document.createElement("div");
        alertDiv.textContent = "Copied and saved successfully!";
        alertDiv.style.position = "fixed";
        alertDiv.style.top = "20px";  // Updated: Position at top
        alertDiv.style.right = "20px";  // Updated: Right side
        alertDiv.style.padding = "10px 20px";
        alertDiv.style.backgroundColor = "#4CAF50";  // Green for success
        alertDiv.style.color = "white";
        alertDiv.style.borderRadius = "5px";
        alertDiv.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
        alertDiv.style.zIndex = "9999";
        alertDiv.style.opacity = "1";
        alertDiv.style.transition = "opacity 0.5s ease";
        document.body.appendChild(alertDiv);

        // Fade out and remove after 2 seconds (reduced duration)
        setTimeout(() => {
          alertDiv.style.opacity = "0";
          setTimeout(() => alertDiv.remove(), 500);
        }, 1500);
      })
      .catch(err => console.error("❌ Clipboard copy failed:", err));
  }
  return selectedText;
}
