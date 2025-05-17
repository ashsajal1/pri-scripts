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
    :root {
      --bg-color: white;
      --text-color: #2d3748;
      --border-color: #e9ecef;
      --hover-bg: #e9ecef;
      --item-bg: #f8f9fa;
      --shadow-color: rgba(0,0,0,0.15);
      --icon-bg: rgba(16, 163, 127, 0.1);
      --success-bg: rgba(40, 167, 69, 0.1);
    }

    [data-theme="dark"] {
      --bg-color: #1a1a1a;
      --text-color: #e2e8f0;
      --border-color: #2d3748;
      --hover-bg: #2d3748;
      --item-bg: #2d3748;
      --shadow-color: rgba(0,0,0,0.3);
      --icon-bg: rgba(16, 163, 127, 0.2);
      --success-bg: rgba(40, 167, 69, 0.2);
    }

    .prompt-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .toggle-btn {
      background: #10a37f;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0.7;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    .toggle-btn:hover {
      opacity: 1;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(16, 163, 127, 0.2);
    }
    .theme-toggle {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      opacity: 0.7;
      transition: all 0.3s ease;
      color: var(--text-color);
      font-size: 18px;
    }
    .theme-toggle:hover {
      opacity: 1;
      transform: translateY(-1px);
    }
    .prompts-panel {
      display: none;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 15px;
      margin-top: 10px;
      box-shadow: 0 4px 20px var(--shadow-color);
      min-width: 280px;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }
    .prompts-panel.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .prompt-item {
      margin-bottom: 10px;
      padding: 12px 16px;
      background: var(--item-bg);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s ease;
      border: 1px solid var(--border-color);
      position: relative;
      overflow: hidden;
    }
    .prompt-item:hover {
      background: var(--hover-bg);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px var(--shadow-color);
    }
    .prompt-text {
      flex: 1;
      margin-right: 12px;
      font-size: 14px;
      line-height: 1.4;
      color: var(--text-color);
    }
    .copy-icon {
      opacity: 0;
      transition: all 0.2s ease;
      color: #10a37f;
      font-size: 16px;
      background: var(--icon-bg);
      padding: 6px;
      border-radius: 6px;
    }
    .prompt-item:hover .copy-icon {
      opacity: 1;
    }
    .copy-success {
      color: #28a745;
      background: var(--success-bg);
    }
    .prompt-item.copied {
      animation: fadeOut 0.5s ease forwards;
    }
    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }
  `;

  // Create and append style element
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create prompt container
  const container = document.createElement("div");
  container.className = "prompt-container";

  // Create theme toggle button
  const themeToggle = document.createElement("button");
  themeToggle.className = "theme-toggle";
  themeToggle.innerHTML = "🌙"; // Moon icon for dark mode
  themeToggle.title = "Toggle Dark/Light Mode";

  // Set initial theme
  const savedTheme = localStorage.getItem("chatgpt-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.innerHTML = savedTheme === "dark" ? "☀️" : "🌙";

  // Theme toggle functionality
  themeToggle.onclick = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("chatgpt-theme", newTheme);
    themeToggle.innerHTML = newTheme === "dark" ? "☀️" : "🌙";
  };

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
      promptItem.classList.add("copied");
      
      // Hide the panel after copying
      setTimeout(() => {
        promptsPanel.classList.remove("visible");
        setTimeout(() => {
          promptsPanel.style.display = "none";
          promptItem.classList.remove("copied");
          copyIcon.innerHTML = "📋";
          copyIcon.classList.remove("copy-success");
        }, 300);
      }, 500);
    };
    
    promptsPanel.appendChild(promptItem);
  });

  // Toggle functionality
  toggleBtn.onclick = () => {
    const isHidden = promptsPanel.style.display === "none" || !promptsPanel.style.display;
    promptsPanel.style.display = "block";
    // Use setTimeout to ensure display: block is applied before adding the visible class
    setTimeout(() => {
      promptsPanel.classList.toggle("visible", isHidden);
    }, 10);
    toggleBtn.textContent = isHidden ? "Hide Prompts" : "Show Prompts";
  };

  // Append elements
  container.appendChild(themeToggle);
  container.appendChild(toggleBtn);
  container.appendChild(promptsPanel);
  document.body.appendChild(container);
})();
