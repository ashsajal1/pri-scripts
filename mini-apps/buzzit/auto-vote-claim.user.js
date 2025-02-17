// ==UserScript==
// @name         !Buzzit Auto Tasker!
// @version      1.0
// @namespace    Zaman
// @author       Zaman
// @match        https://front.buzzitcdn.ru/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ilfae/ilfae/main/logo.webp
// ==/UserScript==

(function () {
  "use strict";

  try {
    // Create the controls container if it doesn't exist
    if (!document.querySelector("#blumfarm-controls")) {
      const controlsContainer = document.createElement("div");
      controlsContainer.id = "blumfarm-controls";
      controlsContainer.style.position = "fixed";
      controlsContainer.style.top = "0";
      controlsContainer.style.left = "50%";
      controlsContainer.style.transform = "translateX(-50%)";
      controlsContainer.style.zIndex = "9999";
      controlsContainer.style.backgroundColor = "black";
      controlsContainer.style.borderRadius = "10px";
      controlsContainer.style.padding = "5px 10px";
      controlsContainer.style.color = "white";
      controlsContainer.textContent = "Auto Voter";
      document.body.appendChild(controlsContainer);
    }
  } catch (e) {
    console.error("!Buzzit! error:", e);
  }
})();
