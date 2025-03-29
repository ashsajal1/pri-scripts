// ==UserScript==
// @name         !Blum Tasker!
// @version      2.00
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
  // Set document background to indicate verify task is running
  document.body.style.backgroundColor = "rgba(255, 140, 0, 0.4)"; // Bright orange with higher opacity
  document.body.style.transition = "background-color 0.3s";
  toggleTaskButtons(true);
  updateStatus("Starting verification task...");

  try {
    await simulateTask("Verify");
    await clickTabs("Verify");
  } catch (error) {
    console.error("Error running auto tasker:", error);
  } finally {
    document.body.style.backgroundColor = "";
    toggleTaskButtons(false);
  }
}

async function runClickTasker() {
  // Set document background to indicate click task is running
  document.body.style.backgroundColor = "rgba(50, 205, 50, 0.4)"; // Bright green with higher opacity
  document.body.style.transition = "background-color 0.3s";
  toggleTaskButtons(true);
  updateStatus("Starting clicking task...");

  try {
    await simulateTask("Click");
    await clickTabs("Click");
  } catch (error) {
    console.error("Error running auto tasker:", error);
  } finally {
    document.body.style.backgroundColor = "";
    toggleTaskButtons(false);
  }
}

// { videoName: "$2.5M+ DOGS Airdrop", keyword: "HAPPYDOGS" },

const blumCodes = [
  { videoName: "Blum's TGE teaser", keyword: "TGETHISSPRING" },
  { videoName: "How to Work at Blum?", keyword: "GROWWITHBLUM" },
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
  { videoName: "Blum Latest Updates", keyword: "BLUMGOESAI" },
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
      ["Socials", "Academy", "Blum Bits", "Farming", "Frens"].some((t) =>
        tabText.includes(t)
      )
    ) {
      await tab.click();
      await clickElements();
      console.log("Work done for tab:", tabText);
      updateStatus(`Work done for tab: ${tabText}`);

      // If we find a "Farming" tab, stop after this task
      if (tabText.includes("Frens")) {
        console.log("Click work is done.");
        updateStatus("Click work is done.");
        // Add after tasks are completed
        window.parent.postMessage(
          { message: "Click work is done." },
          "*"
        );
        console.log("Sent completion status to parent");
        updateStatus("Sent completion status to parent");

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

  await sleep(1000);

  //start click tasks
  await clickElements();
}

/**
 * Clicks elements containing the text "Start" or "Claim" with varying delays.
 */
async function clickElements() {
  // Run the click tasks twice
  for (let run = 1; run <= 2; run++) {
    console.log(`Starting click run ${run}/2`);
    updateStatus(`Starting click run ${run}/2`);

    const taskSections = document.querySelectorAll(".pages-tasks-section");
    if (taskSections.length < 3) {
      console.log("Less than 3 .pages-tasks-section elements found.");
    }

    // quests section
    const firstTaskSection = taskSections[0];
    console.log("First Task Section:", firstTaskSection);

    const firstTaskSectionChildren = Array.from(
      firstTaskSection.querySelectorAll(".pages-tasks-card")
    );

    console.log("First task section children:", firstTaskSectionChildren);

    if (firstTaskSectionChildren.length > 0) {
      console.log("Starting to click elements in first task section.");
      updateStatus("Starting to click elements in first task section.");
      for (const child of firstTaskSectionChildren) {
        // cheack if child have a button called start or claim
        const btn = child.querySelector(
          ".tasks-pill-inline.is-status-not-started.pages-tasks-pill, .tasks-pill-inline.is-status-ready-for-claim.pages-tasks-pill"
        );

        if (btn) {
          if (
            btn.textContent.toLowerCase().includes("start") ||
            btn.textContent.toLowerCase().includes("claim")
          ) {
            if (
              !btn.parentElement.parentElement
                .querySelector(".title")
                .textContent.toLowerCase()
                .includes("story")
            ) {
              btn.click();
              console.log("Clicked start button");
              updateStatus("Clicked start button");
              await sleep(1000);
              console.log("Sleeping for 1 second...");
              updateStatus("Sleeping for 1 second...");
            } else {
              console.log("Skipping story");
              updateStatus("Skipping story");
              sleep(1000);
            }
          } else if (btn.textContent.toLowerCase().includes("open")) {
            btn.click();
            console.log("Clicked open button");
            updateStatus("Clicked open button");
            await sleep(1000);
            await handleModalElements();
          } else {
            console.log("Open btn not found for child:", child);
            updateStatus("Open btn not found for child.");

            const isDone = child.querySelector(".kit-icon.icon");
            if (isDone) {
              console.log("Element is done:", child);
              updateStatus("Element is done.");
            } else {
              console.log("Element is not done:", child);
              updateStatus("Element is not done.");
            }
          }
        }
      }
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
                e.textContent.includes("Start") ||
                e.textContent.includes("Claim")
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
        //kit-button is-large is-primary is-fill
        //kit-button is-large is-primary is-fill
        const shareBtn = storyPage.querySelector(
          ".kit-button.is-large.is-primary.is-fill"
        );
        if (shareBtn) {
          shareBtn.click();
          console.log("Sharing story");
          updateStatus("Sharing story");
          await waitForStoryPageToDisappear();
          console.log("Story page closed, continuing...");
          updateStatus("Story page closed, continuing...");
        } else {
          console.log("No share button found.");
          updateStatus("No share button found.");
        }
        console.log("Sharing story done!");
        updateStatus("Sharing story done!");
      });
    }

    console.log("Start/Claim finished");
    updateStatus("Start/Claim finished");

    // At the end of each run
    if (run < 2) {
      console.log("First run complete, waiting 2 seconds before second run...");
      updateStatus(
        "First run complete, waiting 2 seconds before second run..."
      );
      await sleep(2000);

      // Clear any existing "data-verified" attributes before second run
      const verifiedTasks = document.querySelectorAll('[data-verified="true"]');
      verifiedTasks.forEach((task) => task.removeAttribute("data-verified"));
    }
  }

  console.log("Both click runs complete");
  updateStatus("Both click runs complete");
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
  document.body.style.backgroundColor = "rgba(50, 205, 50, 0.4)";
  document.body.style.transition = "background-color 0.3s";

  const findAndClickFarmButton = async () => {
    const buttons = document.querySelectorAll(
      "button.kit-pill-claim, button.kit-pill.farming"
    );

    let farmButtonFound = false;

    for (const btn of buttons) {
      const btnText = btn.textContent.trim().toLowerCase();

      console.log("Button found:", btnText);
      updateStatus("Button found: " + btnText);

      // Click button first time
      btn.click();
      console.log("Button clicked first time:", btnText);
      updateStatus("Button clicked first time: " + btnText);

      // If it's a farm button, click again after delay and end loop
      if (
        btnText.includes("farm") ||
        (btnText.includes("bp") && !btnText.includes("claim"))
      ) {
        farmButtonFound = true;
        await sleep(2000);
        btn.click();
        console.log("Farm button clicked second time");
        updateStatus("Farm button clicked second time");
        break; // Exit loop after farm button is clicked twice
      }

      await sleep(1000);
    }

    if (!farmButtonFound) {
      console.log("Farm button not found, retrying in 1 second...");
      updateStatus("Farm button not found, retrying...");
      await sleep(1000);
      return findAndClickFarmButton(); // Retry if farm button not found
    } else {
      console.log("Farm button was clicked, moving to earn tabs");
      updateStatus("Farm button was clicked, moving to earn tabs");
      await sleep(1000);
      clickEarnTabs();
    }
  };

  findAndClickFarmButton().catch((err) => {
    console.error("Error in findAndClickFarmButton:", err);
    updateStatus("Error occurred while finding farm button");
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

// Replace the self-executing function with this version
(async function checkForEarnLink() {
  const links = document.querySelectorAll("a");
  const homeLink = Array.from(links).find((link) => {
    return link.textContent.trim().toLowerCase().includes("home");
  });

  if (homeLink) {
    homeLink.click();
    console.log("Home link clicked");
    updateStatus("Home link clicked");
  } else {
    console.log("Home link not found, skipping...");
    updateStatus("Home link not found, skipping...");
  }

  console.log("Checking for earn link...");
  const buttons = document.querySelectorAll(
    "button.kit-pill-claim, button.kit-pill.farming"
  );
  let found = false;

  if (buttons.length > 0) {
    found = true;
    console.log("Ready to start tasker");
    updateStatus("Ready to start tasker");
    doClaim(); // Call the function to start the process
  }

  if (!found) {
    console.warn("Not ready yet, retrying in 1 second...");
    updateStatus("Not ready yet, retrying in 1 second...");
    await sleep(1000);
    checkForEarnLink(); // Recursively check again
  }
})();

async function checkHomeAndClickEarn() {
  // Add maximum retry attempts to prevent infinite recursion
  let maxAttempts = 1;
  let attempts = 0;

  const tryFindHomeAndClick = async () => {
    // Find home tab by checking both class and content
    const tabs = document.querySelectorAll(".tab");
    const homeTab = Array.from(tabs).find((tab) => {
      const hasHomeText =
        tab.querySelector(".label")?.textContent.trim().toLowerCase() ===
        "home";
      return hasHomeText;
    });

    if (attempts >= maxAttempts) {
      console.log("Max attempts reached, stopping recursion");
      updateStatus("Max attempts reached, stopping");
      return;
    }

    if (homeTab) {
      console.log("Click Home tab.");
      updateStatus("Click Home tab.");
      homeTab.click();

      // Wait for navigation
      await sleep(1000);

      // Try to find and click earn tab
      clickEarnTabs();
    } else {
      attempts++;
      console.log(
        `Attempt ${attempts}/${maxAttempts}: Home tab not found, retrying...`
      );
      updateStatus(`Attempt ${attempts}/${maxAttempts}: Retrying...`);
      await sleep(1000);
      await tryFindHomeAndClick();
    }
  };

  await tryFindHomeAndClick();
}

async function handleModalElements() {
  const maxAttempts = 5;
  let attempts = 0;

  const tryFindModal = async () => {
    const modal = document.querySelector("dialog");

    if (!modal) {
      if (attempts < maxAttempts) {
        attempts++;
        console.log(`Modal not found, attempt ${attempts}/${maxAttempts}`);
        updateStatus(`Modal not found, retrying... ${attempts}/${maxAttempts}`);
        await sleep(1000);
        return await tryFindModal();
      }
      console.log("Max attempts reached, modal not found");
      updateStatus("Max attempts reached, modal not found");
      return;
    }

    // Find and click elements in modal
    const elements = Array.from(
      modal.querySelectorAll(".tasks-pill-inline.pages-tasks-pill.pill-btn")
    ).filter((btn) => {
      const btnText = btn.textContent.trim().toLowerCase();
      return (
        (btnText.includes("start") || btnText.includes("claim")) &&
        !btn.disabled
      );
    });

    if (elements.length > 0) {
      console.log(`Found ${elements.length} elements in modal`);
      updateStatus(`Found ${elements.length} elements in modal`);

      // Click all elements with delay
      for (const element of elements) {
        const btnText = element.textContent.trim();
        console.log(`Clicking element: ${btnText}`);
        updateStatus(`Clicking element: ${btnText}`);

        element.click();
        await sleep(1000);

        console.log(`Clicked element: ${btnText}`);
        updateStatus(`Clicked element: ${btnText}`);
      }

      // Close modal after clicking all elements
      const closeBtn = modal.querySelector(".close-btn");
      if (closeBtn) {
        closeBtn.click();
        console.log("Modal closed");
        updateStatus("Modal closed");
        await sleep(1000);
      }
    } else {
      console.log("No clickable elements found in modal");
      updateStatus("No clickable elements found in modal");
    }
  };

  await tryFindModal();
}
