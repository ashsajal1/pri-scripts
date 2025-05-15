// ==UserScript==
// @name         ChatGPT Temporary
// @version      1.0
// @namespace    Zaman
// @author       Zaman
// @match        https://chatgpt.com/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/ai/chatgpt.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/ai/chatgpt.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/ai/chatgpt.user.js
// ==/UserScript==

(function () {
  "use strict";
  // add &temporary-chat=true to the URL always
  const url = new URL(window.location.href);
  url.searchParams.set("temporary-chat", "true");
  window.history.replaceState({}, "", url);
})();
