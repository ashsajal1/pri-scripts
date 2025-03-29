// ==UserScript==
// @name         Telegram Auto Worker
// @description  Auto worker for Telegram bot
// @version      1.1
// @namespace    Zaman
// @author       Zaman
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.user.js
// ==/UserScript==

//create a element to show status text in top with rounded and transaprent bg with 0.2 bg opacity and red bg
const statusText = document.createElement("div");
statusText.style.position = "fixed";
statusText.style.top = "0";
statusText.style.left = "0";
statusText.style.width = "100%";
statusText.style.height = "40px";
statusText.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
statusText.style.color = "red";
statusText.style.textAlign = "center";
statusText.style.lineHeight = "40px";
statusText.style.fontSize = "16px";
statusText.style.fontWeight = "bold";
statusText.style.zIndex = "9999";
document.body.appendChild(statusText);

const updateStatusText = (text) => {
  statusText.textContent = text;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findLaunchButtonWithRetry = async () => {
  const launchBtn = document.querySelector(".new-message-bot-commands-view");
  if (launchBtn) {
    console.log("Launch button found");
    updateStatusText("Launch button found");
    launchBtn.click();
    console.log("Launch button clicked");
    updateStatusText("Launch button clicked");
    await checkAutoTaskerDoneStatus();
  } else {
    console.log("Launch button not found, retrying...");
    updateStatusText("Launch button not found, retrying...");
    setTimeout(findLaunchButtonWithRetry, 1000); // Retry after 1 second
  }
};

const clickCloseBtn = async () => {
  const closeBtn = document.querySelector(
    ".btn-icon._BrowserHeaderButton_m63td_65"
  );
  if (closeBtn) {
    console.log("Close button found");
    updateStatusText("Close button found");
    closeBtn.click();
    console.log("Close button clicked");
    updateStatusText("Close button clicked");
  } else {
    console.log("Close button not found, retrying...");
    updateStatusText("Close button not found, retrying...");
    setTimeout(clickCloseBtn, 1000); // Retry after 1 second
  }
};

const checkAutoTaskerDoneStatus = async () => {
  const autoTaskerDone = document.querySelector("#blumfarm-controls-style");
  if (autoTaskerDone) {
    console.log("Auto tasker done button found");
    updateStatusText("Auto tasker done button found");

    const autoTaskerText = autoTaskerDone.textContent.trim();
    if (autoTaskerText.includes("Click work is done.")) {
      await clickCloseBtn();
      console.log("Auto tasker done, close button clicked");
      updateStatusText("Auto tasker done, close button clicked");
    } else {
      console.log("Auto tasker not done, rechecking...");
      updateStatusText("Auto tasker not done, rechecking...");
      setTimeout(checkAutoTaskerDoneStatus, 3000); // Retry after 3 seconds
    }
  } else {
    console.log("Auto tasker done button not found, retrying...");
    updateStatusText("Auto tasker done button not found, retrying...");
    setTimeout(checkAutoTaskerDoneStatus, 1000); // Retry after 1 second
  }
};

(async function checkForBlumChat() {
  const chatList = document.querySelector(".chatlist");
  if (chatList) {
    console.log("Chat list found");
    updateStatusText("Chat list found");
    for (const item of chatList) {
      const chatTitle = item.querySelector(".peer-title-inner");
      if (chatTitle) {
        console.log("Found chat title element");
        updateStatusText("Found chat title element");
        // Check if the chat title is "Blum"
        const chatTitleText = chatTitle.textContent.trim();
        if (chatTitleText === "Blum") {
          console.log("Blum chat found");
          updateStatusText("Blum chat found");

          item.click();
          console.log("Blum chat found and clicked");
          updateStatusText("Blum chat found and clicked");
          await sleep(1000); // Wait for 1 second after clicking
          console.log("Waiting for 1 second after clicking");
          updateStatusText("Waiting for 1 second after clicking");

          await findLaunchButtonWithRetry();
        }
      }
    }
  } else {
    console.log("Chat list not found  retrying...");
    setTimeout(checkForBlumChat, 1000); // Retry after 1 second
  }
})();
