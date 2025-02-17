// ==UserScript==
// @name         !Buzzit Auto Tasker!
// @version      1.1
// @namespace    Zaman
// @author       Zaman
// @match        https://front.buzzitcdn.ru/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ilfae/ilfae/main/logo.webp
// ==/UserScript==

(function () {
  "use strict";

  let ticketsAvailable = null;
  const tasksList = [];
  const taskElements = document.querySelectorAll("._EventCard2_1asrk_1");

  // Step 1: Check total ticker that user have
  try {
    const ticketElement = document.querySelector("._tickets_ofzkp_21 h6");
    ticketsAvailable = parseInt(ticketElement.textContent.trim(), 10);
    console.log("Available Tickets:", ticketsAvailable);
  } catch (error) {
    console.error("Error getting ticket count:", error);
    ticketsAvailable = 0;
  }

  // Step 2: Create list of tasks with their required tickets
  taskElements.forEach((task) => {
    try {
      const ticketElement = document.querySelector(
        "._Pill_qhtlu_1 ._textWithIcon_1asrk_44"
      );
      let ticketQuantity, isPartnerEvent;
      if (ticketElement) {
        ticketQuantity = parseInt(ticketElement.textContent.trim(), 10);
        console.log("Ticket Quantity:", ticketQuantity);
      } else {
        console.log("Ticket quantity not found.");
      }

      const isPartnerEventElement = task.querySelector(
        "tgui-c3e2e598bd70eee6.tgui-080a44e6ac3f4d27.tgui-5b8bdfbd2af10f59.tgui-f37a43dcc29ade55.tgui-2916d621b0ea5857._alignedText_1asrk_91"
      );
      if (isPartnerEventElement) {
        isPartnerEvent = true;
        console.log("Event is a partner event.");
      } else {
        console.log("Event is not a partner event.");

        tasksList.push({
          element: task,
          name: task.querySelector("._TitleMarkdown_1vt67_1").textContent,
          required: ticketQuantity,
          isPartnerEvent: isPartnerEvent,
        });

        console.log("Task added:", {
          name: task.querySelector("._TitleMarkdown_1vt67_1").textContent,
          required: ticketQuantity,
        });
      }
    } catch (error) {
      console.error("Error parsing task data:", error);
    }
  });

  // Step 3: Vote tasks that can be claimed with available tickets
  if (ticketsAvailable > 0 && tasksList.length > 0) {
    tasksList.forEach((task) => {
      try {
        if (task.required <= ticketsAvailable) {
          task.element.click();
          setTimeout(() => {
            const modal = document.querySelector(
              ".tgui-cc76354712c6e8d9._EventModal_l3elv_1"
            );
            const voteButton = Array.from(
              modal.querySelectorAll("button")
            ).find(
              (button) => button.textContent.trim().toLowerCase() === "no"
            );

            if (voteButton && !voteButton.disabled) {
              console.log("Voting for:", task.name);
              voteButton.click();
              // Wait a short period before proceeding to avoid issues
              setTimeout(() => {
                const modal = document.querySelector(
                  ".tgui-cc76354712c6e8d9._EventModal_l3elv_1"
                );

                const confirmBtn = Array.from(
                  modal.querySelectorAll("button")
                ).find((button) =>
                  button.textContent.trim().toLowerCase().includes("confirm")
                );

                if (confirmBtn) {
                  confirmBtn.click();
                } else {
                  console.log("Cannot found confirm btn for ", task.name);
                }
              }, 1000); // Adjust delay as needed
            }
          }, 1000);
        } else {
          console.log("Insufficient tickets for:", task.name);
        }
      } catch (error) {
        console.error("Error handling task:", error);
      }
    });
  }
})();
