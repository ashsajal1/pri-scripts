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

  // Add CSS styles
  const styles = `
    .prompt-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    .toggle-btn {
      background: #10a37f;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }
    .toggle-btn:hover {
      opacity: 1;
    }
    .prompts-panel {
      display: none;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-top: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 250px;
    }
    .prompt-item {
      margin-bottom: 10px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s ease;
      border: 1px solid #e9ecef;
    }
    .prompt-item:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }
    .prompt-text {
      flex: 1;
      margin-right: 10px;
    }
    .copy-icon {
      opacity: 0;
      transition: opacity 0.2s ease;
      color: #10a37f;
      font-size: 16px;
    }
    .prompt-item:hover .copy-icon {
      opacity: 1;
    }
    .copy-success {
      color: #28a745;
    }
  `;

  // Create and append style element
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create prompt container
  const container = document.createElement("div");
  container.className = "prompt-container";

  // Create toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "toggle-btn";
  toggleBtn.textContent = "Show Prompts";

  // Create prompts panel
  const promptsPanel = document.createElement("div");
  promptsPanel.className = "prompts-panel";

  // Add sample prompts (you can customize these)
  const prompts = [
    "Act as a senior software engineer and review my code",
    "Explain this code like I'm 5 years old",
    "Optimize this code for better performance",
    "Generate unit tests for this code",
    "Convert this code to TypeScript"
  ];

  // Add prompts to panel
  prompts.forEach(prompt => {
    const promptItem = document.createElement("div");
    promptItem.className = "prompt-item";
    
    const promptText = document.createElement("span");
    promptText.className = "prompt-text";
    promptText.textContent = prompt;
    
    const copyIcon = document.createElement("span");
    copyIcon.className = "copy-icon";
    copyIcon.innerHTML = "📋";
    
    promptItem.appendChild(promptText);
    promptItem.appendChild(copyIcon);
    
    promptItem.onclick = () => {
      navigator.clipboard.writeText(prompt);
      copyIcon.innerHTML = "✓";
      copyIcon.classList.add("copy-success");
      setTimeout(() => {
        copyIcon.innerHTML = "📋";
        copyIcon.classList.remove("copy-success");
      }, 1500);
    };
    
    promptsPanel.appendChild(promptItem);
  });

  // Toggle functionality
  toggleBtn.onclick = () => {
    const isHidden = promptsPanel.style.display === "none" || !promptsPanel.style.display;
    promptsPanel.style.display = isHidden ? "block" : "none";
    toggleBtn.textContent = isHidden ? "Hide Prompts" : "Show Prompts";
  };

  // Append elements
  container.appendChild(toggleBtn);
  container.appendChild(promptsPanel);
  document.body.appendChild(container);
})();
