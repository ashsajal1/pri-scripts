// ==UserScript==
// @name         !BlumFarm!
// @version      1.2
// @namespace    Zaman
// @author       Zaman
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ilfae/ilfae/main/logo.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/blum/auto-game-limited.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/blum/auto-game-limited.user.js
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
          const amountValue = getAmountValue();
          if (amountValue !== null && amountValue > 0) {
            handleGameElement(item);
          }
        }
        return originalPush.apply(this, items);
      };
  
      function getAmountValue() {
        const amount = document.querySelector(".amount");
        if (!amount) return null;
        const value = parseInt(amount.textContent.replace(/\D/g, ""));
        return isNaN(value) ? null : value;
      }
  
      async function handleGameElement(element) {
        if (!element || !element.asset) return;
  
        const amountValue = getAmountValue();
        if (amountValue !== null && amountValue >= 501 && amountValue <= 551) {
          console.log("Skipping element click — amount in restricted range:", amountValue);
          return;
        }
  
        const { assetType } = element.asset;
        const randomValue = Math.random() * 100;
  
        switch (assetType) {
          case "CLOVER":
            if (randomValue < GAME_SETTINGS.clickPercentage.flower) {
              clickElementWithDelay(element);
            }
            break;
          case "DOGS":
            if (randomValue < GAME_SETTINGS.clickPercentage.dogs) {
              clickElementWithDelay(element);
            }
            break;
          default:
            console.log(`Unknown element type: ${assetType}`);
        }
      }
  
      function clickElementWithDelay(element) {
        element.onClick(element);
        setTimeout(() => {
          if (element) {
            element.onClick(element);
            element.isExplosion = true;
            element.addedAt = performance.now();
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
  
      setInterval(checkAndClickPlayButton, 1000);
    } catch (e) {
      console.error("!BlumFarm! error:", e);
    }
  })();
  