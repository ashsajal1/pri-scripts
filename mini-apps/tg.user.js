// ==UserScript==
// @name         Telegram Auto Worker
// @description  Auto worker for Telegram bot
// @version      2.04
// @namespace    Zaman
// @author       Zaman
// @match        https://web.telegram.org/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @icon         https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.user.js
// ==/UserScript==

//create a element to show status text in top with rounded and transaprent bg with 0.2 bg opacity and red bg
// Create a button element to hide/show the status text
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

//create a element to show status text in top with rounded and transaprent bg with 0.2 bg opacity and red bg
const statusText = document.createElement("div");
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

// Add a click event listener to the button
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

const findLaunchButtonWithRetry = async () => {
  const launchBtn = document.querySelector(".new-message-bot-commands.is-view");
  if (launchBtn) {
    console.log("Launch button found");
    updateStatusText("Launch button found");
    safeClick(launchBtn);
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
  // This function will start listening for messages from the iframe
  const listenForMessages = async () => {
    window.addEventListener("message", async (event) => {
      // Ensure that the message is from a trusted source
      const allowedOrigin = "https://telegram.blum.codes"; // Replace with the exact origin of your iframe

      if (event.origin !== allowedOrigin) {
        console.error("Received message from unknown origin:", event.origin);
        return;
      }

      // Now, handle the received message
      const message = event.data.message;
      if (message && message === "Click work is done.") {
        // If the message is "Click work is done", perform your action
        console.log("Auto tasker done, closing button...");
        await clickCloseBtn();
        updateStatusText("Auto tasker done, close button clicked");
      } else {
        console.log("Message received, but work is not done.");
        updateStatusText("Work not done, rechecking...");
      }
    });
  };

  // Try fetching the iframe element and setup the listener
  const tryAccessIframe = async () => {
    const reloadDuration = 90000; // 90 seconds (1.5 minutes)
    const startTime = Date.now(); // Track the start time

    const checkIframe = async () => {
      const iframe = document.getElementsByTagName("iframe")[0];
      const elapsedTime = Date.now() - startTime;

      // If 1.5 minutes have passed and iframe is still not found, reload
      if (!iframe && elapsedTime >= reloadDuration) {
        console.log("Iframe not found, time's up. Reloading...");
        window.location.reload();
        return;
      }

      if (!iframe) {
        console.log(`Iframe not found, retrying...`);
        updateStatusText(`Iframe not found, retrying...`);
        await sleep(1000);
        return await checkIframe(); // Retry indefinitely
      }

      // If iframe exists, listen for messages
      listenForMessages();
      console.log("Listening for messages from iframe...");
    };

    await checkIframe();
  };

  await tryAccessIframe();
};

// Helper to safely click on a node
function safeClick(node) {
  // If the node is not an HTMLElement, try to use its parent
  let clickable = node instanceof HTMLElement ? node : node.parentElement;
  if (!clickable) {
    console.error("No clickable element found for node:", node);
    return;
  }

  // First try the direct click() method
  try {
    clickable.click();
    console.log("Called .click() on:", clickable);
  } catch (e) {
    console.warn("click() method failed, dispatching MouseEvent:", e);
    const event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    clickable.dispatchEvent(event);
    console.log("Dispatched click event on:", clickable);
  }
}

(async function checkForBlumChat() {
  const accounts = [1, 2, 3]; // Add your account numbers

  // Get current account index from localStorage or start from 0
  let currentAccountIndex = parseInt(
    localStorage.getItem("currentAccountIndex") || 0
  );
  console.log(`Resuming from account index: ${currentAccountIndex}`);

  async function processAccount(accountNumber) {
    try {
      // Store current account index before navigation
      localStorage.setItem("currentAccountIndex", currentAccountIndex);

      // Set URL with account number and bot hash
      const newUrl = `https://web.telegram.org/k/?account=${accountNumber}#@BlumCryptoBot`;
      window.location.href = newUrl;

      console.log(`Processing account ${accountNumber}...`);
      updateStatusText(`Processing account ${accountNumber}...`);

      // Wait for page load
      await sleep(3000);

      // Find and click launch button, then wait for completion
      return new Promise(async (resolve) => {
        // Set up one-time message listener for completion
        const messageHandler = async (event) => {
          if (
            event.origin === "https://telegram.blum.codes" &&
            event.data.message === "Click work is done."
          ) {
            window.removeEventListener("message", messageHandler);
            await clickCloseBtn();
            console.log(`Account ${accountNumber} completed`);
            updateStatusText(`Account ${accountNumber} completed`);
            await sleep(2000); // Wait before resolving
            resolve();
          }
        };

        window.addEventListener("message", messageHandler);
        await findLaunchButtonWithRetry();
      });
    } catch (error) {
      console.log(`Error processing account ${accountNumber}:`, error);
      updateStatusText(`Error processing account ${accountNumber}: ${error}`);
    }
  }

  // Process accounts from current index
  for (let i = currentAccountIndex; i < accounts.length; i++) {
    currentAccountIndex = i;
    await processAccount(accounts[i]);
    console.log(`Moving to next account...`);
    updateStatusText(`Moving to next account...`);
    if (i === accounts.length - 1) {
      await giveCloseReqAfterDone();
      console.log("All accounts processed, sending close request...");
      updateStatusText("All accounts processed, sending close request...");
    }
    await sleep(2000);
  }

  // Clear stored index when all done
  localStorage.removeItem("currentAccountIndex");
  console.log("All accounts processed!");
  updateStatusText("All accounts processed!");

  statusText.style.height = "140px";
  statusText.style.backgroundColor = "rgba(17, 184, 92, 1)";
})();

const giveCloseReqAfterDone = async () => {
  let attempts = 0;
  const maxAttempts = 3; // You can adjust the number of retries here
  const retryDelay = 2000; // Delay between retries in milliseconds (2 seconds)

  while (attempts < maxAttempts) {
    try {
      const response = await GM_xmlhttpRequest({
        url: "http://localhost:8000/close",
        method: "POST",
      });

      if (response.ok) {
        console.log("Close request sent successfully.");
        return; // Exit the function if the request is successful
      } else {
        console.error(`Close request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error in giveCloseReqAfterDone:", error);
    }

    attempts++;
    if (attempts < maxAttempts) {
      console.log(
        `Retrying close request in ${retryDelay}ms (attempt ${attempts}/${maxAttempts})...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  console.error(`Failed to send close request after ${maxAttempts} attempts.`);
  updateStatus("Failed to send close request.");
};
