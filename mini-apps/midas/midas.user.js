// ==UserScript==
// @name         Midas Auto Worker
// @description  Auto worker for Telegram Midas bot
// @version      0.01
// @namespace    Zaman
// @author       Zaman
// @match        https://prod-tg-app.midas.app/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @icon         https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/midas/midasuser.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/midas/midasuser.js
// ==/UserScript==

// Your code here
const statusText = document.createElement("div");
statusText.textContent = "Midas Auto Worker";
statusText.style.position = "fixed";
statusText.style.top = "0";
statusText.style.left = "0";
statusText.style.width = "100%";
statusText.style.height = "60px";
statusText.style.backgroundColor = "rgba(8, 81, 175, 0.7)"; // Changed to blue
statusText.style.borderRadius = "0 0 10px 10px"; // Rounded corners
statusText.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.5)";
statusText.style.padding = "10px";
statusText.style.fontFamily = "Arial, sans-serif";
statusText.style.color = "white";
statusText.style.textAlign = "center"; // Center the text
statusText.style.lineHeight = "40px";
statusText.style.fontSize = "20px"; // Increased font size
statusText.style.fontWeight = "bold"; // Make the text bold
statusText.style.zIndex = "9999";
document.body.appendChild(statusText);

const updateStatusText = (text) => {
  statusText.textContent = text;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async function () {
  await findContinueButtonAndClick();
})();

const findContinueButtonAndClick = async () => {
  const buttons = Array.from(document.querySelectorAll("h6"));
  if (buttons.length > 0) {
    const continueButton = buttons.find(
      (el) => el.textContent.trim() === "Continue"
    );
    if (continueButton) {
      continueButton.click();
      console.log("Clicked the Continue button");
      updateStatusText("Clicked the Continue button");
    } else {
      console.log("Continue button not found");
      updateStatusText("Continue button not found");
    }
  }
};

const findPlayButtonAndClick = async () => {
  const buttons = Array.from(document.querySelectorAll("h6"));

  const playButton = buttons.find(
    (el) => el.textContent.trim().toLowerCase() === "start tapping"
  );

  if (playButton) {
    playButton.click();
    console.log("✅ Clicked the Play button");
    updateStatusText("✅ Clicked the Play button");
  } else {
    console.warn("❌ Play button not found");
    updateStatusText("❌ Play button not found");
  }
};
