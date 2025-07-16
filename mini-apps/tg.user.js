// ==UserScript==
// @name         Telegram Auto Worker
// @description  Auto worker for Telegram bot (visit each account for 5s, then close req)
// @version      3.12
// @namespace    Zaman
// @author       Zaman
// @match        https://web.telegram.org/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @icon         https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.user.js
// ==/UserScript==

// UI for status
const toggleStatusButton = document.createElement("button");
toggleStatusButton.textContent = "Hide Status";
toggleStatusButton.style.position = "fixed";
toggleStatusButton.style.top = "10px";
toggleStatusButton.style.right = "10px";
toggleStatusButton.style.zIndex = "10000";
toggleStatusButton.style.padding = "5px 10px";
toggleStatusButton.style.background = "#0955a5";
toggleStatusButton.style.border = "1px solid #ccc";
toggleStatusButton.style.borderRadius = "5px";
document.body.appendChild(toggleStatusButton);

const statusText = document.createElement("div");
statusText.style.position = "fixed";
statusText.style.top = "0";
statusText.style.left = "0";
statusText.style.width = "100%";
statusText.style.height = "60px";
statusText.style.backgroundColor = "rgba(8, 81, 175, 0.7)";
statusText.style.borderRadius = "0 0 10px 10px";
statusText.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.5)";
statusText.style.padding = "10px";
statusText.style.fontFamily = "Arial, sans-serif";
statusText.style.color = "white";
statusText.style.textAlign = "center";
statusText.style.lineHeight = "40px";
statusText.style.fontSize = "20px";
statusText.style.fontWeight = "bold";
statusText.style.zIndex = "9999";
document.body.appendChild(statusText);

let statusVisible = true;
toggleStatusButton.addEventListener("click", () => {
  if (statusVisible) {
    statusText.style.display = "none";
    toggleStatusButton.textContent = "Show Status";
  } else {
    statusText.style.display = "block";
    toggleStatusButton.textContent = "Hide Status";
  }
  statusVisible = !statusVisible;
});

const updateStatusText = (text) => {
  statusText.textContent = text;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Main logic: visit each Telegram account for 5 seconds, then send close request
(async function main() {
  const accounts = [1, 2, 3]; // your accounts
  let currentAccountIndex = parseInt(sessionStorage.getItem("currentAccountIndex") || 0);

  if (currentAccountIndex < accounts.length) {
    const accountNumber = accounts[currentAccountIndex];
    const expectedUrl = `https://web.telegram.org/k/?account=${accountNumber}`;
    if (window.location.href !== expectedUrl) {
      // Only navigate if not already on the correct account
      window.location.href = expectedUrl;
    } else {
      // Already on the correct account, do the work
      updateStatusText(`Visiting account ${accountNumber}...`);
      await sleep(30000);
      updateStatusText(`Account ${accountNumber} done, moving to next...`);
      await sleep(1000);
      sessionStorage.setItem("currentAccountIndex", currentAccountIndex + 1);
      // Reload to move to the next account
      window.location.reload();
    }
  } else {
    // All accounts done
    sessionStorage.removeItem("currentAccountIndex");
    updateStatusText("All accounts processed!");

    statusText.style.height = "140px";
    statusText.style.backgroundColor = "rgba(17, 184, 92, 1)";

    await sleep(1000); // Wait for 1 second before sending close request
    console.log("Sending close request...");
    updateStatusText("Sending close request...");
    await giveCloseReqAfterDone();
    console.log("All accounts processed, close request sent.");
    updateStatusText("All accounts processed, close request sent.");
  }
})();

const giveCloseReqAfterDone = async () => {
  let attempts = 0;
  const maxAttempts = 3;
  const retryDelay = 2000; // 2 seconds

  while (attempts < maxAttempts) {
    attempts++;

    try {
      await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          url: "http://localhost:8000/close",
          method: "POST",
          onload: (response) => {
            if (response.status >= 200 && response.status < 300) {
              console.log("Close request sent successfully.");
              resolve();
            } else {
              console.error(
                `Close request failed with status: ${response.status}`
              );
              reject(new Error(`HTTP Status: ${response.status}`));
            }
          },
          onerror: (error) => {
            console.error("Error in giveCloseReqAfterDone:", error);
            reject(error);
          },
        });
      });

      return; // Stop retrying if successful
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error);
      if (attempts < maxAttempts) {
        console.log(
          `Retrying in ${retryDelay}ms (attempt ${attempts}/${maxAttempts})...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.error(`Failed to send close request after ${maxAttempts} attempts.`);
};
