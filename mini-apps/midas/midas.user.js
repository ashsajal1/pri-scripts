// ==UserScript==
// @name         Midas Auto Worker
// @description  Auto worker for Telegram Midas bot
// @version      0.03
// @namespace    Zaman
// @author       Zaman
// @match        https://prod-tg-app.midas.app/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @icon         https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/midas/midas.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/midas/midas.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/midas/midas.user.js
// ==/UserScript==

// Your code here
const statusText = document.createElement("div");
statusText.textContent = "Midas Auto Worker";
statusText.style.position = "fixed";
statusText.style.top = "0";
statusText.style.left = "0";
statusText.style.width = "100%";
statusText.style.height = "60px";
statusText.style.backgroundColor = "rgba(202, 189, 5, 0.7)"; // Changed to blue
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

const findContinueButtonAndClick = async () => {
  let attempt = 0;
  const maxAttempts = 5;

  while (attempt < maxAttempts) {
    const buttons = Array.from(document.querySelectorAll("h6"));
    const continueButton = buttons.find(
      (el) => el.textContent.trim() === "Continue"
    );

    if (continueButton) {
      continueButton.click();
      console.log("✅ Clicked the Continue button");
      updateStatusText("✅ Clicked the Continue button");
      return; // Exit once clicked
    } else {
      console.warn(`❌ Attempt ${attempt + 1}: Continue button not found`);
      updateStatusText(`❌ Attempt ${attempt + 1}: Continue button not found`);
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 100ms
    }
  }

  console.error("⛔ Failed to find the Continue button after 5 attempts");
  updateStatusText("⛔ Failed to find the Continue button after 5 attempts");
};

const findPlayButtonAndClick = async () => {
  let attempt = 0;
  const maxAttempts = 5;

  while (attempt < maxAttempts) {
    const buttons = Array.from(document.querySelectorAll("h6"));
    const playButton = buttons.find(
      (el) =>
        el.textContent.trim().toLowerCase() === "start tapping" ||
        el.textContent.trim().toLowerCase().includes("play")
    );

    if (playButton) {
      playButton.click();
      console.log("✅ Clicked the Play button");
      updateStatusText("✅ Clicked the Play button");

      await sleep(2000); // Wait for 2 seconds
      await clickRockRandomly(); // Click on the rock
      console.log("🪨 Clicked the rock");
      updateStatusText("🪨 Clicked the rock");
      return; // Exit after successful click
    } else {
      console.warn(`❌ Attempt ${attempt + 1}: Play button not found`);
      updateStatusText(`❌ Attempt ${attempt + 1}: Play button not found`);
      attempt++;
      await sleep(1000); // Wait before trying again
    }
  }

  console.error("⛔ Failed to find the Play button after 5 attempts");
  updateStatusText("⛔ Failed to find the Play button after 5 attempts");
};

const clickRockRandomly = async () => {
  const rock = document.querySelector('img[src="/svg/rock2.webp"][alt="rock"]');
  if (!rock) {
    console.warn("❌ Rock image not found");
    updateStatusText("❌ Rock image not found");
    return;
  }

  const rect = rock.getBoundingClientRect();

  for (let i = 0; i < 10; i++) {
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    });

    rock.dispatchEvent(clickEvent);
    console.log(`🪨 Clicked rock at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    updateStatusText(`🪨 Clicked rock at (${x.toFixed(0)}, ${y.toFixed(0)})`);

    await sleep(1000); // Wait for 1 second before next click
  }

  await findPlayButtonAndClick();
};

const goToEarnTaskTab = async () => {
  let attempts = 0;
  let maxAttempts = 5;

  while (attempts < maxAttempts) {
    const buttons = Array.from(document.querySelectorAll("button"));
    const earnBtn = buttons.find((btn) =>
      btn.textContent.trim().toLowerCase().includes("tasks")
    );

    if (earnBtn) {
      earnBtn.click();
      console.log("Earn btn clicked");
      updateStatusText("Earn btn click");
      await clickSocialEarnTab();
      console.log("Social tab clicked");
      updateStatusText("Social tab click");
      return;
    } else {
      attempts++;
      await sleep(1000);
      console.log("Earn tab not found, sleeping");
      updateStatusText("Earn tab not found, sleeping");
    }
  }
};

const clickSocialEarnTab = async () => {
  let attempts = 0;
  let maxAttempts = 5;

  while (attempts < maxAttempts) {
    const buttons = Array.from(document.querySelectorAll("button"));
    const socialEarnBtn = buttons.find((btn) =>
      btn.textContent.trim().toLowerCase().includes("social")
    );

    if (socialEarnBtn) {
      socialEarnBtn.click();
      console.log("Social btn clicked");
      updateStatusText("Social btn click");
      await sleep(2000); // Wait for 1 second before next click
      await clickStartBtns();
      console.log("Start btn work started");
      updateStatusText("Start btn work started");
      return;
    } else {
      attempts++;
      await sleep(1000);
      console.log("Social tab not found, sleeping");
      updateStatusText("Social tab not found, sleeping");
    }
  }
};

const clickStartBtns = async () => {
  let attempts = 0;
  let maxAttempts = 5;

  while (attempts < maxAttempts) {
    const buttons = Array.from(document.querySelectorAll("button"));
    const startBtn = buttons.filter(
      (btn) =>
        btn.textContent.trim().toLowerCase().includes("start") ||
        btn.textContent.trim().toLowerCase().includes("claim")
    );

    if (startBtn.length > 0) {
      startBtn.forEach(async (btn, index) => {
        btn.click();
        await sleep(1000); // Wait for 1 second before next click
        console.log("Start btn clicked ", index);
        updateStatusText("Start btn click ", index);
      });

      await sleep(2000); // Wait for 2 seconds

      return;
    } else {
      attempts++;
      await sleep(1000);
      console.log("Start btn not found, sleeping");
      updateStatusText("Start btn not found, sleeping");
    }
  }

  await goToFarmTab();
  console.log("Farm tab clicked");
  updateStatusText("Farm tab click");
};

const goToFarmTab = async () => {
  let attempts = 0;
  let maxAttempts = 5;

  while (attempts < maxAttempts) {
    const buttons = Array.from(document.querySelectorAll("button"));
    const farmBtn = buttons.find((btn) =>
      btn.textContent.trim().toLowerCase().includes("farming")
    );

    if (farmBtn) {
      farmBtn.click();
      console.log("Farm btn clicked");
      updateStatusText("Farm btn click");
      await sleep(2000); // Wait for 1 second before next click
      await clickStartBtns();
      console.log("Start btn work started");
      updateStatusText("Start btn work started");
      return;
    } else {
      attempts++;
      await sleep(1000);
      console.log("Farm tab not found, sleeping");
      updateStatusText("Farm tab not found, sleeping");
    }
  }
};

(async function () {
  await findContinueButtonAndClick();
  await findPlayButtonAndClick();
  await goToEarnTaskTab();
})();
