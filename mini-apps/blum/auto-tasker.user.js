// ==UserScript==
// @name         !Blum Tasker!
// @version      1.0
// @namespace    Zaman
// @author       Zaman
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ilfae/ilfae/main/logo.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/blum/auto-tasker.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/blum/auto-tasker.user.js
// ==/UserScript==

// --- UI: Inject custom CSS for a high-quality, iOS-like control panel and text animation ---
if (!document.querySelector("#blumfarm-controls-style")) {
  const style = document.createElement("style");
  style.id = "blumfarm-controls-style";
  style.textContent = `
      /* Container for the control panel */
      #blumfarm-controls {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        background: rgba(0,0,0,0.5);
        border-radius: 12px;
        padding: 20px;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        min-width: 300px;
      }
  
      /* Title style */
      .blumfarm-title {
        font-size: 18px;
        font-weight: bold;
      }
  
      /* Container for the buttons */
      .blumfarm-buttons {
        display: flex;
        gap: 10px;
      }
  
      /* iOS-like button styling */
      #blumfarm-controls button {
        background-color: #007aff;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.1s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      #blumfarm-controls button:hover {
        background-color: #005ecb;
      }
      #blumfarm-controls button:active {
        transform: scale(0.98);
      }
  
      /* Status text styling with a pulsing animation */
      .blumfarm-status {
        font-size: 14px;
        font-weight: bold;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
  document.head.appendChild(style);
}

// --- UI: Create the control panel (if it doesn't exist) ---
if (!document.querySelector("#blumfarm-controls")) {
  const controlsContainer = document.createElement("div");
  controlsContainer.id = "blumfarm-controls";

  controlsContainer.style.position = "fixed";
  controlsContainer.style.top = "0";
  controlsContainer.style.left = "50%";
  controlsContainer.style.transform = "translateX(-50%)";
  controlsContainer.style.zIndex = "9999";
  controlsContainer.style.borderRadius = "10px";
  controlsContainer.style.padding = "5px 10px";

  // Create the title element
  const titleElem = document.createElement("div");
  titleElem.className = "blumfarm-title";
  titleElem.textContent = "Auto tasker";
  controlsContainer.appendChild(titleElem);

  // Create the buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "blumfarm-buttons";

  // Create the first button (verify tasker)
  const verifyBtn = document.createElement("button");
  verifyBtn.id = "btn1";
  verifyBtn.textContent = "Verify";
  verifyBtn.addEventListener("click", runVerifyTasker); // Your task function
  buttonsContainer.appendChild(verifyBtn);

  // Create the second button (click tasker)
  const clickBtn = document.createElement("button");
  clickBtn.id = "btn2";
  clickBtn.textContent = "Click";
  clickBtn.addEventListener("click", runClickTasker); // Your task function
  buttonsContainer.appendChild(clickBtn);

  controlsContainer.appendChild(buttonsContainer);

  // Create the status text element
  const statusElem = document.createElement("div");
  statusElem.id = "blumfarm-work-status";
  statusElem.className = "blumfarm-status";
  statusElem.textContent = "Idle"; // Initial status
  controlsContainer.appendChild(statusElem);

  // Append the control panel to the body
  document.body.appendChild(controlsContainer);
}

// --- UI Helpers ---

/**
 * Updates the work status text.
 * The status text will be replaced immediately when a new message is provided.
 * @param {string} message - The status message to display.
 */
function updateStatus(message) {
  const statusElem = document.getElementById("blumfarm-work-status");
  if (statusElem) {
    statusElem.textContent = message;
  }
}

/**
 * Disables (or enables) the control panel buttons.
 * Also updates their text to indicate processing state.
 * @param {boolean} disable - If true, disables the buttons and updates text to "Processing..."
 */
function toggleTaskButtons(disable) {
  const verifyBtn = document.getElementById("btn1");
  const clickBtn = document.getElementById("btn2");

  if (verifyBtn) {
    verifyBtn.disabled = disable;
    verifyBtn.style.opacity = disable ? 0.5 : 1;
    verifyBtn.textContent = disable ? "Verifying..." : "Verify";
  }
  if (clickBtn) {
    clickBtn.disabled = disable;
    clickBtn.style.opacity = disable ? 0.5 : 1;
    clickBtn.textContent = disable ? "Clicking..." : "Click";
  }
}

// --- (Optional) Sample UI Simulation ---
// This sample function demonstrates how you might update the status text and disable buttons during a task.
async function simulateTask(targetWork = "Click") {
  toggleTaskButtons(true);
  updateStatus(`Starting ${targetWork} task...`);
  await sleep(300);
  updateStatus(`${targetWork} task in progress...`);
}
/**
 * Resets flags and re-runs the main auto tasker.
 */
async function runVerifyTasker() {
  toggleTaskButtons(true);
  updateStatus("Starting verification task...");

  // For testing, call simulateTask:
  await simulateTask("Verify");

  // Then proceed with your actual verification logic:
  try {
    await clickTabs("Verify");
  } catch (error) {
    console.error("Error running auto tasker:", error);
  }
  toggleTaskButtons(false);
}

async function runClickTasker() {
  toggleTaskButtons(true);
  updateStatus("Starting clicking task...");

  // For testing, call simulateTask:
  await simulateTask("Click");

  // Then proceed with your actual verification logic:
  try {
    await clickTabs("Click");
  } catch (error) {
    console.error("Error running auto tasker:", error);
  }
  toggleTaskButtons(false);
}

// { videoName: "$2.5M+ DOGS Airdrop", keyword: "HAPPYDOGS" },

const blumCodes = [
  { videoName: "How to analyze Crypto?", keyword: "Value" },
  { videoName: "$2.5M+ DOGS Airdrop", keyword: "HAPPYDOGS" },
  { videoName: "What Are AMMs?", keyword: "Cryptosmart" },
  { videoName: "Dec 10 News", keyword: "ELSALVADOR" },
  { videoName: "Blum COO @ Blockchain Life", keyword: "Lifeisblum" },
  { videoName: "Blum CEO @ Binance Blockchain Week", keyword: "BLUMGOALS" },
  { videoName: "Blum at Binance Blockchain Week", keyword: "BLUMWEEK" },
  { videoName: "Sharding Explained", keyword: "blumtastic" },
  { videoName: "What is Uniswap?", keyword: "Blumshine" },
  { videoName: "Blum and TOP", keyword: "TOP" },
  { videoName: "BITGET on TON with Vlad Smerkis", keyword: "BITGET" },
  { videoName: "Chartered Cities Explained", keyword: "PROSPERA" },
  { videoName: "Season 1 First Giveaway", keyword: "BLUMCHATS" },
  { videoName: "Fake AI vs. Real AI", keyword: "AI COIN" },
  { videoName: "Forks Explained", keyword: "Go Get" },
  { videoName: "Secure your Crypto!", keyword: "Best Project Ever" },
  { videoName: "Navigating Crypto", keyword: "Heyblum" },
  { videoName: "What are Telegram mini Apps?", keyword: "CRYPTOBLUM" },
  { videoName: "Say no to Rug Pull!", keyword: "superblum" },
  { videoName: "What are AMMs?", keyword: "Cryptosmart" },
  { videoName: "Liquidity Pools Guide", keyword: "BLUMERSSS" },
  { videoName: "Doxxing? What's that?", keyword: "NODOXXING" },
  { videoName: "Pre-market Trading?", keyword: "Wowblum" },
  { videoName: "How to Memecoin?", keyword: "Memeblum" },
  { videoName: "Token Burning: How & Why?", keyword: "Onfire" },
  { videoName: "Bitcoin Rainbow Chart?", keyword: "Soblum" },
  { videoName: "Crypto Terms. Part 1", keyword: "Blumexplorer" },
  { videoName: "How to Trade Perps?", keyword: "Cryptofan" },
  { videoName: "DeFi Explained", keyword: "Blumforce" },
  { videoName: "How to Find Altcoins?", keyword: "Ultrablum" },
  { videoName: "Crypto Slang. Part 1", keyword: "BLUMSTORM" },
  { videoName: "What is On-chain Analysis?", keyword: "Blumextra" },
  { videoName: "Pumptober Special", keyword: "Pumpit" },
  { videoName: "DeFi Risks: Key Insights", keyword: "Blumhelps" },
  { videoName: "Crypto Slang. Part 2", keyword: "FOMOOO" },
  { videoName: "Choosing a Crypto Exchange", keyword: "CRYPTOZONE" },
  { videoName: "Node Sales in Crypto", keyword: "Blumify" },
  { videoName: "What's Crypto DEX?", keyword: "DEXXX" },
  { videoName: "Understanding Gas Fees", keyword: "CRYPTOGAS" },
  { videoName: "What is Slippage?", keyword: "CRYPTOBUZZ" },
  { videoName: "What’s Next for DeFi?", keyword: "BLUMNOW" },
  { videoName: "Smart Contracts 101", keyword: "SMARTBLUM" },
  { videoName: "Crypto Slang. Part 3", keyword: "BOOBLUM" },
  { videoName: "Regulation: Yay or Nay?", keyword: "BLUMSSS" },
  { videoName: "DEX History", keyword: "GODEX" },
  { videoName: "The CEO SPEECH", keyword: "-No code needed-" },
  { videoName: "Crypto Regulations #2", keyword: "BLUMRULES" },
  { videoName: "P2P Trading Safety Tips", keyword: "BLUMTIPS" },
  { videoName: "Crypto Communities", keyword: "BLUMMUNITY" },
  { videoName: "Is Binance a DEX", keyword: "BLUMIES" },
  { videoName: "DEX Evolution", keyword: "BLUMSPARK" },
  { videoName: "Dec 6 Crypto News", keyword: "HUNDRED" },
  { videoName: "Crypto Slang. Part 4", keyword: "LAMBOBLUM" },
  { videoName: "Memepad tutorial", keyword: "Memepad" },
  { videoName: "Dex History #3", keyword: "Loveblum" },
  { videoName: "Dec 11 News", keyword: "--No Keyword, just claim--" },
  { videoName: "Dec 12 News", keyword: "RIPPLE" },
  { videoName: "Dec 13 News", keyword: "Bitcoinjesus" },
  { videoName: "Blum CMO @ Blockchain Life", keyword: "Blumislife" },
  { videoName: "Dec 16 News", keyword: "BITCOIN" },
  { videoName: "Crypto in Everyday Life", keyword: "Blumance" },
  { videoName: "Dec 17 News", keyword: "Kendrick" },
  { videoName: "Dec 18 News", keyword: "MARK" },
  { videoName: "Crypto Slang. Part 5", keyword: "GONNABLUM" },
  { videoName: "What is Uniswap", keyword: "BLUMSHINE" },
  { videoName: "Dec 20 News", keyword: "Trump" },
  { videoName: "History of Bitcoin", keyword: "BIGPIZZA" },
  { videoName: "Blum COO @ Binance", keyword: "LIFEISBLUM" },
  { videoName: "Future of Telegram. Part 1", keyword: "TAPBLUM" },
  { videoName: "Blum CEO @ Binance", keyword: "BLUMGOALS" },
  { videoName: "Telegram Trends #4", keyword: "GOTAP" },
  { videoName: "Telegram Trends #3", keyword: "MEGABLUM" },
  { videoName: "Blum at Binance Blockchain", keyword: "BLUMWEEK" },
  { videoName: "Telegram Trends #2", keyword: "BLUUUM" },
  { videoName: "Can Bitcoin be Hacked?", keyword: "QUANTUMBTC" },
  { videoName: "Community Building", keyword: "BUILD" },
  { videoName: "Crypto market 2025", keyword: "CRYPTO2025" },
  { videoName: "TOP Invests in BLUM", keyword: "TOP" },
  { videoName: "S1 Weekly Giveaway", keyword: "GIVEAWAY" },
  { videoName: "BITGET on TON with Vlad", keyword: "BITGET" },
];

// A simple sleep function returning a Promise.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handles tab clicks.
 * @param {string} targetWork - Either "Click" or "Verify".
 */
async function clickTabs(targetWork = "Click") {
  console.log("I'm working as", targetWork, "worker.", Math.random() * 10000);
  const tabElements = document.querySelectorAll(".tab");

  for (const tab of tabElements) {
    const tabText = tab.textContent;

    // For 'Verify' work, match specific tabs
    if (
      targetWork === "Verify" &&
      ["Socials", "Academy", "Blum Bits"].some((t) => tabText.includes(t))
    ) {
      await tab.click();
      await verifyTask();
      if (tabText.includes("Blum Bits")) {
        // alert("Verification is done.");
        console.log("Verification is done.");
        updateStatus("Verification is done.");
        return; // Stop after the first "Farming" tab is processed
      }
    }

    // For 'Click' work, match specific tabs including 'Farming'
    if (
      targetWork === "Click" &&
      ["Socials", "Academy", "Blum Bits", "Farming"].some((t) =>
        tabText.includes(t)
      )
    ) {
      await tab.click();
      await clickElements();
      console.log("Work done for tab:", tabText);
      updateStatus(`Work done for tab: ${tabText}`);

      // If we find a "Farming" tab, stop after this task
      if (tabText.includes("Farming")) {
        console.log("Click work is done.");
        updateStatus("Click work is done.");
        // alert("Click work is done!");
        return; // Stop after the first "Farming" tab is processed
      }
    }
  }
}

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

async function verifyTask() {
  const taskSections = document.querySelectorAll(".pages-tasks-section");
  if (taskSections.length < 3) {
    console.log("Less than 3 .pages-tasks-section elements found.");
    return;
  }

  const thirdTaskSection = taskSections[2];
  console.log("Third Task Section:", thirdTaskSection);

  const tasksList = thirdTaskSection.querySelector(".tasks-list");
  if (!tasksList) {
    console.log("Tasks list not found in the third section.");
    return;
  }

  // Normalize titles from the DOM by trimming, converting to lowercase, and removing any trailing question marks.
  const titles = Array.from(tasksList.querySelectorAll(".title")).map((title) =>
    title.textContent.trim().toLowerCase().replace(/\?+$/, "")
  );
  console.log("Task Titles:", titles);

  if (!blumCodes) {
    console.warn("window.blumCodes is not defined.");
    return;
  }

  // Normalize video names from blumCodes the same way.
  const matchingTitles = blumCodes
    .map((code) => code.videoName.toLowerCase().trim().replace(/\?+$/, ""))
    .filter((title) => titles.includes(title));
  console.log("Matching Titles:", matchingTitles);

  if (matchingTitles.length === 0) {
    console.log("No matching titles found in blumCodes.");
    return;
  }

  // Select all verify task items
  const tasksToComplete = document.querySelectorAll(
    ".pages-tasks-list-item-label"
  );
  console.log(
    `Found ${tasksToComplete.length} tasks. Processing them one by one...`
  );

  for (let i = 0; i < tasksToComplete.length; i++) {
    const taskItem = tasksToComplete[i];

    // Skip this task if it's already been verified
    if (taskItem.getAttribute("data-verified") === "true") {
      console.log("Task already verified, skipping:", taskItem);
      continue;
    }

    // Get the title element and its text, normalizing the title by removing trailing question marks.
    const thisTitleElement = taskItem.querySelector(".title");
    if (thisTitleElement) {
      const titleText = thisTitleElement.textContent
        .trim()
        .toLowerCase()
        .replace(/\?+$/, "");

      if (!matchingTitles.includes(titleText)) {
        console.log("Skipping task with title not in blumCodes:", titleText);
        continue;
      }
    }

    // Find the verify button for this task
    const verifyButton = taskItem.querySelector(
      ".tasks-pill-inline.is-status-ready-for-verify.is-dark.pages-tasks-pill.pill-btn"
    );
    if (!verifyButton) {
      console.error(
        `Verify button not found for task "${
          thisTitleElement
            ? thisTitleElement.textContent.trim().toLowerCase()
            : "unknown"
        }"`
      );
      continue;
    }

    safeClick(verifyButton);
    console.log(`Clicked verify button for task ${i + 1}`);
    updateStatus(`Clicked verify button for task ${i + 1}`);
    await sleep(1000);

    let inputField = null;
    let attempt = 0;
    while (attempt < 5) {
      inputField = document.querySelector('input[placeholder="Keyword"]');
      if (inputField) break;
      await sleep(3000);
      attempt++;
    }

    if (!inputField) {
      console.error(
        `Keyword input not found after clicking verify button for task ${i + 1}`
      );
      continue;
    }

    const verifySection = document.querySelector(".pages-tasks-verify");
    if (!verifySection) {
      console.log("Verification section not found.");
      continue;
    }

    const titleElement = verifySection.querySelector(".title");
    if (!titleElement) {
      console.log("Title not found in verification section.");
      continue;
    }

    // Normalize the verification title text
    let verifyTitleText = titleElement.textContent
      .trim()
      .toLowerCase()
      .replace(/\?+$/, "");
    console.log(`Title for verify button ${i + 1}:`, verifyTitleText);

    // Find the matching code by comparing the normalized video name
    const matchingCode = blumCodes.find(
      (code) =>
        code.videoName.toLowerCase().trim().replace(/\?+$/, "") ===
        verifyTitleText
    );
    if (!matchingCode) {
      console.log(
        `No matching blumCode found for title "${verifyTitleText}" for task ${
          i + 1
        }`
      );
      continue;
    }

    inputField.value = matchingCode.keyword;
    inputField.dispatchEvent(new Event("input", { bubbles: true }));
    console.log(`Keyword set for task ${i + 1}:`, matchingCode.keyword);
    updateStatus(`Keyword set for task ${i + 1}: ${matchingCode.keyword}`);

    const confirmVerifyButton = verifySection.querySelector(
      ".kit-button.is-large.is-primary.is-fill"
    );
    if (confirmVerifyButton) {
      confirmVerifyButton.click();
      console.log("Confirm verify button clicked.");
      updateStatus("Confirm verify button clicked.");
    } else {
      console.log("Confirm verify button not found.");
      updateStatus("Confirm verify button not found.");
    }

    await sleep(1000);

    // Mark this task as verified so it is not processed again
    taskItem.setAttribute("data-verified", "true");
    console.log(`Task ${i + 1} marked as verified.`);
  }

  console.log("Finished processing all matching verify buttons.");
  updateStatus("Finished processing all matching verify buttons.");
  toggleTaskButtons(false);
}

/**
 * Clicks elements containing the text "Start" or "Claim" with varying delays.
 */
async function clickElements() {
  const taskSections = document.querySelectorAll(".pages-tasks-section");
  if (taskSections.length < 3) {
    console.log("Less than 3 .pages-tasks-section elements found.");
    return;
  }

  /// weekly task
  const secondTaskSection = taskSections[1];
  console.log("Second Task Section:", secondTaskSection);

  const secondTaskSectionChildren = Array.from(
    secondTaskSection.querySelectorAll(".pages-tasks-card")
  );

  console.log("Second task section children:", secondTaskSectionChildren);

  if (secondTaskSectionChildren.length > 0) {
    console.log("Starting to click elements in second task section.");
    updateStatus("Starting to click elements in second task section.");
    for (const child of secondTaskSectionChildren) {
      const isDone = child.querySelector(".kit-icon.done-icon");
      if (!isDone) {
        const openBtn = child.querySelector(
          ".tasks-pill-inline.is-status-not-started.is-light.pages-tasks-pill"
        );
        if (openBtn) {
          openBtn.click();
          await sleep(1000);

          const modal = document.querySelector(".pages-tasks-subtasks-modal");
          // Find all buttons inside child that contain "Start" or "Claim" in their text.
          const elements = Array.from(
            modal.querySelectorAll(
              // tasks-pill-inline is-status-not-started is-dark is-nested pages-tasks-pill pill-btn
              // tasks-pill-inline is-status-ready-for-claim is-dark is-nested pages-tasks-pill pill-btn
              ".tasks-pill-inline.is-status-not-started.is-dark.is-nested.pages-tasks-pill.pill-btn, .tasks-pill-inline.is-status-ready-for-claim.is-dark.is-nested.pages-tasks-pill.pill-btn"
            )
          ).filter(
            (e) =>
              e.textContent.includes("Start") || e.textContent.includes("Claim")
          );

          console.log(`Clicking ${elements.length} elements.`);

          // Loop through each element and click it with a small delay.
          for (const element of elements) {
            const text = element.textContent.trim();
            let delay = 0;

            // Set delay based on button text.
            if (text.includes("Claim")) {
              delay = 500 + Math.random() * 500; // Random delay between 500 and 1000 ms
            } else if (text.includes("Start")) {
              delay = 100 + Math.random() * 400; // Random delay between 100 and 500 ms
            }

            console.log(
              `Clicking "${text}" button, sleeping for ${delay.toFixed(
                0
              )} ms...`
            );
            updateStatus(
              `Clicking "${text}" button, sleeping for ${delay.toFixed(
                0
              )} ms...`
            );
            await element.click();
            await sleep(delay);
          }
        } else {
          console.log("No open btn found for child:", child);
        }

        await sleep(1000);
        updateStatus("Closing modal...");
        console.log("Closing modal...");

        const closeBtn = document.querySelector(
          ".kit-button.is-medium.is-ghost.is-icon-only.close-btn"
        );
        if (closeBtn) {
          closeBtn.click();
          updateStatus("Modal closed.");
          console.log("Modal closed.");
        } else {
          console.warn("No close btn found for child:", child);
          updateStatus("No close btn found for child.");
        }
      } else {
        console.log("Element is done:", child);
        updateStatus("Element is done.");
      }
    }
  }

  //weekly task end

  const thirdTaskSection = taskSections[2];

  // Find all buttons inside thirdTaskSection that contain "Start" or "Claim" in their text.
  const elements = Array.from(
    thirdTaskSection.querySelectorAll(
      ".tasks-pill-inline.is-status-not-started.is-dark.pages-tasks-pill.pill-btn, .tasks-pill-inline.is-status-ready-for-claim.is-dark.pages-tasks-pill.pill-btn"
    )
  ).filter(
    (e) => e.textContent.includes("Start") || e.textContent.includes("Claim")
  );

  console.log(`Clicking ${elements.length} elements.`);
  updateStatus(`Clicking ${elements.length} elements.`);

  // Loop through each element and click it with a small delay.
  for (const element of elements) {
    const text = element.textContent.trim();
    let delay = 0;

    // Set delay based on button text.
    if (text.includes("Claim")) {
      delay = 500 + Math.random() * 500; // Random delay between 500 and 1000 ms
    } else if (text.includes("Start")) {
      delay = 100 + Math.random() * 400; // Random delay between 100 and 500 ms
    }

    console.log(
      `Clicking "${text}" button, sleeping for ${delay.toFixed(0)} ms...`
    );
    updateStatus(
      `Clicking "${text}" button, sleeping for ${delay.toFixed(0)} ms...`
    );
    await element.click();
    await sleep(1000);

    function waitForStoryPage(callback) {
      const interval = setInterval(() => {
        const storyPage = document.querySelector(".pages-tasks-share-story");
        if (storyPage) {
          clearInterval(interval);
          callback(storyPage);
        }
      }, 100); // Check every 100 milliseconds
    }

    waitForStoryPage(async (storyPage) => {
      const shareBtn = storyPage.querySelector(
        ".kit-button.is-large.is-primary.is-fill"
      );
      if (shareBtn) {
        shareBtn.click();
        console.log("Sharing story");
        updateStatus("Sharing story");
        await sleep(1000);
        updateStatus("Story shared and sleeping for 1 second...");
        console.log("Story shared and sleeping for 1 second...");
      } else {
        console.log("No share button found.");
        updateStatus("No share button found.");
      }
      console.log("Sharing story done!");
      updateStatus("Sharing story done!");
    });

    await waitForStoryPageToDisappear();
    updateStatus("Story page closed, continuing...");
  }

  console.log("Start/Claim finished");
  updateStatus("Start/Claim finished");
  toggleTaskButtons(false);
}

async function waitForStoryPageToDisappear() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const storyPage = document.querySelector(".pages-tasks-share-story");
      if (!storyPage) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100); // Check every 100ms
  });
}

const doClaim = () => {
  const buttons = document.querySelectorAll("button");

  buttons.forEach(async (btn) => {
    const text = btn.textContent.trim().toLowerCase();
    if (text.includes("claim") || text.includes("restore")) {
      console.log("Matching button found:", btn);
      updateStatus("Matching button found.");
      btn.click();
      console.log("Button clicked:", btn.textContent.trim());
      updateStatus("Button clicked : ", btn.textContent.trim());
      btn.addEventListener("click", () => {
        console.log("Button clicked:", btn.textContent.trim());
      });

      // Optional: Add a delay before clicking the next button
      await sleep(1000);
      clickEarnTabs();
    } else {
      clickEarnTabs();
    }
  });
};

const clickEarnTabs = () => {
  const links = document.querySelectorAll("a");

  links.forEach(async (link) => {
    const text = link.textContent.trim().toLowerCase();
    if (text.includes("earn")) {
      console.log("Matching link found:", link);
      updateStatus("Matching link found.");
      link.click();
      console.log("Link clicked:", link.textContent.trim());
      updateStatus("Link clicked:", link.textContent.trim());

      await sleep(2000);

      // Try to find task element with retries
      let attempts = 0;
      const maxAttempts = 10; // Maximum number of retry attempts
      const retryInterval = 1000; // Time between retries in ms

      const findTaskElement = async () => {
        const taskElement = document.querySelector(".pages-tasks-card");
        if (taskElement) {
          console.log("Task element found:", taskElement);
          updateStatus("Task element found.");
          // do some stuff with taskElement
          runClickTasker();
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(
              `Attempt ${attempts}/${maxAttempts}: No task element found, retrying...`
            );
            updateStatus(`Attempt ${attempts}/${maxAttempts}: Retrying...`);
            await sleep(retryInterval);
            return await findTaskElement();
          } else {
            console.log("Max attempts reached, giving up.");
            updateStatus("Max attempts reached, giving up.");
          }
        }
      };

      await findTaskElement();
    }
  });
};

(function () {
  const links = document.querySelectorAll("a");

  links.forEach((link) => {
    const text = link.textContent.trim().toLowerCase();
    if (text.includes("earn")) {
      console.log("Ready to start tasker");
      updateStatus("Ready to start tasker");
      doClaim(); // Call the function to start the process
    } else {
      console.log("Not ready yet but keep checking");
      updateStatus("Not ready yet but keep checking");
    }
  });
})();
