// ==UserScript==
// @name         !BlumFarm!
// @version      2.4
// @namespace    NSNoman
// @author       NSNoman
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ilfae/ilfae/main/logo.webp
// ==/UserScript==

let GAME_SETTINGS = {
    clickPercentage: {
        // bomb: 0,
        // ice: 30,
        flower:100,
        dogs: 100,
    },
    autoClickPlay: false,
};

try {
    let gameStats = {
        isGameOver: false,
    };

    const originalPush = Array.prototype.push;
    Array.prototype.push = function (...items) {
        items.forEach(item => handleGameElement(item));
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
        // Clean up if necessary
        element = null;
    }

    function clickElementWithDelay(element) {
        element.onClick(element);

        const delays = [10];
        delays.forEach((delay) => {
            setTimeout(() => {
                if (element) {
                    element.onClick(element);
                    if (delay === 10 && Math.random() < 0.5) {
                        element.isExplosion = true;
                        element.addedAt = performance.now();
                    }
                }
            }, delay);
        });

        // Clean up the element after timeouts
        setTimeout(() => {
            element = null;
        }, Math.max(...delays) + 10);
    }


    function getNewGameDelay() {
        return Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    }

    function checkAndClickPlayButton() {
        const playButtons = document.querySelectorAll('button.kit-button.is-large.is-primary, a.play-btn[href="/game"], button.kit-button.is-large.is-primary');

        playButtons.forEach(button => {
            if ((/Play/.test(button.textContent) || /Continue/.test(button.textContent))) {
                setTimeout(() => {
                    button.click();
                    gameStats.isGameOver = false;
                }, getNewGameDelay());
            }
        });
    }

    function continuousPlayButtonCheck() {
        checkAndClickPlayButton();
        setTimeout(continuousPlayButtonCheck, 1000);
    }

    continuousPlayButtonCheck();

    if (!document.querySelector('#blumfarm-controls')) {
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'blumfarm-controls';
        controlsContainer.style = `
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background-color: black;
            border-radius: 10px;
        `;
        controlsContainer.textContent = "Auto play";
        document.body.appendChild(controlsContainer);
    }
} catch (e) {
    console.error("!BlumFarm! error:", e);
}
