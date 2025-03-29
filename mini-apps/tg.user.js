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
          }
        }
      }
    }
  } else {
    console.log("Chat list not found  retrying...");
    setTimeout(checkForBlumChat, 1000); // Retry after 1 second
  }
})();
