// ==UserScript==
// @name         Telegram Auto Worker
// @description  Auto worker for Telegram bot
// @version      1.1
// @namespace    Zaman
// @author       Zaman
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ilfae/ilfae/main/logo.webp
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

(function checkForBlumChat() {
  const chatList = document.querySelector(".chatlist");
  if (chatList) {
    for (const item of chatList) {
      const chatTitle = item.querySelector(".peer-title-inner");
      if (chatTitle) {
        const chatTitleText = chatTitle.textContent.trim();
        if (chatTitleText === "Blum") {
          const chat = item.querySelector(".chatlist__item--active");
          if (chat) {
            chat.click();
            console.log("Blum chat found and clicked");
            updateStatusText("Blum chat found and clicked");
          }
        }
      }
    }
  } else {
    console.log("Chat list not found  retrying...");
    setTimeout(checkForBlumChat, 1000); // Retry after 1 second
  }
})();
