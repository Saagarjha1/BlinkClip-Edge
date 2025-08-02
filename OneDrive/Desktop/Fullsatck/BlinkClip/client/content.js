document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && (event.key === "Y" || event.key === "y")) {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    chrome.storage.local.get(["jwtToken"], (result) => {
      const token = result.jwtToken;
      if (!token) {
        console.warn("⚠️ No JWT token");
        return;
      }

      chrome.runtime.sendMessage({
        type: "SAVE_CLIP",
        text: selectedText,
        url: window.location.href,
        title: document.title,
        token
      }, (response) => {
        if (response?.success) {
          console.log("✅ Clip saved");
        } else {
          console.error("❌ Clip save failed:", response?.error);
        }
      });
    });
  }
});
