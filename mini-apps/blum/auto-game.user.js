// ==UserScript==
// @name         !BlumFarm!
// @version      1.0
// @namespace    Zaman
// @author       Zaman
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ilfae/ilfae/main/logo.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/blum/auto-game.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/blum/auto-game.user.js
// ==/UserScript==

(function () {
  "use strict";

  let GAME_SETTINGS = {
    clickPercentage: {
      flower: 100,
      dogs: 100,
    },
    autoClickPlay: false,
  };

  try {
    let gameStats = {
      isGameOver: false,
    };

    // Minimal override of Array.prototype.push
    const originalPush = Array.prototype.push;
    Array.prototype.push = function (...items) {
      for (const item of items) {
        handleGameElement(item);
      }
      return originalPush.apply(this, items);
    };

    async function handleGameElement(element) {
      if (!element || !element.asset) return;

      const { assetType } = element.asset;
      const randomValue = Math.random() * 100;

      switch (assetType) {
        case "CLOVER":
          if (randomValue < GAME_SETTINGS.clickPercentage.flower) {
            await clickElementWithDelay(element);
          }
          break;
        case "DOGS":
          if (randomValue < GAME_SETTINGS.clickPercentage.dogs) {
            await clickElementWithDelay(element);
          }
          break;
        default:
          console.log(`Unknown element type: ${assetType}`);
      }
      // Let the function complete so closures can be released
    }

    function clickElementWithDelay(element) {
      // Trigger the click immediately
      element.onClick(element);

      // Schedule a second click after 10ms
      setTimeout(() => {
        if (element) {
          element.onClick(element);
          if (Math.random() < 0.5) {
            element.isExplosion = true;
            element.addedAt = performance.now();
          }
          // No further references are kept to 'element'
        }
      }, 10);
    }

    function getNewGameDelay() {
      return Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    }

    function checkAndClickPlayButton() {
      const playButtons = document.querySelectorAll(
        'button.kit-button.is-large.is-primary, a.play-btn[href="/game"], button.kit-button.is-large.is-primary'
      );
      playButtons.forEach((button) => {
        if (/Play|Continue/.test(button.textContent)) {
          setTimeout(() => {
            button.click();
            gameStats.isGameOver = false;
          }, getNewGameDelay());
        }
      });
    }

    // Use setInterval instead of a recursive setTimeout to reduce closures
    setInterval(checkAndClickPlayButton, 1000);

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
      controlsContainer.textContent = "Auto play";
      document.body.appendChild(controlsContainer);
    }
  } catch (e) {
    console.error("!BlumFarm! error:", e);
  }
})();
