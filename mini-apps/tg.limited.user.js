// ==UserScript==
// @name         Telegram Auto Worker
// @description  Auto worker for Telegram bot
// @version      3.09
// @namespace    Zaman
// @author       Zaman
// @match        https://web.telegram.org/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @icon         https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg-limited.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/tg-limited.user.js
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

// New function to find the "launch" button with the "c-ripple" class
const findLaunchButtonByTextAndClass = async () => {
  let attempt = 0;

  const tryFindButton = async () => {
    attempt++;

    // Find all elements with the class "c-ripple"
    const elementsWithClass = document.querySelectorAll(
      ".popup-button.btn.primary.rp"
    );
    console.log("Elements with class 'c-ripple':", elementsWithClass);

    // Iterate through the elements and check their text content
    for (const element of elementsWithClass) {
      if (element.textContent.trim().toLowerCase() === "launch") {
        console.warn("Launch button found by text content and class:", element);
        safeClick(element); // Click the element
        console.log("Second Launch button clicked");
        updateStatusText("Second Launch button clicked");
        await checkAutoTaskerDoneStatus();
        // return element; // Return the element if found
      }
    }

    // If not found, and we have remaining attempts
    if (attempt < 5) {
      console.log(`Retry attempt ${attempt} failed. Retrying...`);
      setTimeout(tryFindButton, 50); // Retry after 50ms
    } else {
      console.log(
        "Launch button with text content 'launch' and class 'c-ripple' not found after 5 attempts."
      );
      return null;
    }
  };

  tryFindButton(); // Start the first attempt
};

const findLaunchButtonWithRetry = async () => {
  const launchBtn = document.querySelector(".new-message-bot-commands.is-view");
  if (launchBtn) {
    console.log("Launch button found");
    updateStatusText("Launch button found");
    safeClick(launchBtn);
    console.log("Launch button clicked");
    updateStatusText("Launch button clicked");
    await findLaunchButtonByTextAndClass(); // Call the second launch button function
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

// Helper to safely click on a node
function safeClick(node) {
  // Ensure the node is an HTMLElement and visible
  let clickable = node instanceof HTMLElement ? node : node.parentElement;
  if (!clickable) {
    console.error("No clickable element found for node:", node);
    return;
  }

  // Check if the element is visible and enabled
  if (clickable.offsetParent === null || clickable.disabled) {
    console.error("Element is not visible or disabled:", clickable);
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
  async function processAccount(accountNumber) {
    try {
      // Set URL with account number and bot hash
      const newUrl = `https://web.telegram.org/k/?account=${3}#@BlumCryptoBot`;
      window.location.href = newUrl;

      console.log(`Processing account ${accountNumber}...`);
      updateStatusText(`Processing account ${accountNumber}...`);

      // Wait for page load
      await sleep(3000);

      // Find and click launch button, then wait for completion
      await findLaunchButtonWithRetry();
    } catch (error) {
      console.log(`Error processing account ${accountNumber}:`, error);
      updateStatusText(`Error processing account ${accountNumber}: ${error}`);
    }
  }

  await processAccount(3);
})();
