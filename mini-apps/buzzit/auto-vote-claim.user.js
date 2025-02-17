// ==UserScript==
// @name         !Buzzit Auto Tasker!
// @version      1.1
// @namespace    Zaman
// @author       Zaman
// @match        https://front.buzzitcdn.ru/*
// @grant        none
// @icon         https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/buzzit/buzzit.webp
// @updateURL    https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/buzzit/auto-vote-claim.user.js
// @downloadURL  https://raw.githubusercontent.com/ashsajal1/pri-scripts/refs/heads/master/mini-apps/buzzit/auto-vote-claim.user.js
// ==/UserScript==

(function () {
  "use strict";

  // Total tickets available (can be set dynamically if needed)
  let ticketsAvailable;

  // Function to process tasks
  function runTasker() {
    const tasksList = [];

    // Select all task elements
    const taskElements = document.querySelectorAll(
      "._EventCard2_1asrk_1, ._EventCard2_partner_1asrk_13"
    );
    console.log("Found tasks:", taskElements.length);

    // Step 1: (Optional) Update global tickets count (if needed)

    const globalTicketElement = document.querySelector(
      "._tickets_ofzkp_21 ._lh1_ofzkp_15"
    );
    if (globalTicketElement) {
      const match = globalTicketElement.textContent.match(/\d+/);
      ticketsAvailable = match ? parseInt(match[0], 10) : 0;
      console.log("Available Tickets:", ticketsAvailable);
    } else {
      console.error("Global ticket element not found.");
    }

    // Step 2: Build a list of tasks with their required ticket count
    taskElements.forEach((task) => {
      try {
        // Find the ticket element relative to this task card.
        const ticketElement = task.querySelector(
          "._Pill_qhtlu_1 ._textWithIcon_1asrk_44"
        );
        let ticketQuantity = 0;
        if (ticketElement) {
          const match = ticketElement.textContent.match(/\d+/);
          ticketQuantity = match ? parseInt(match[0], 10) : 0;
          console.log("Ticket Quantity for task:", ticketQuantity);
          // Check if the event is a partner event using a fixed selector.
          const isPartnerEventElement = task.querySelector(
            ".tgui-c3e2e598bd70eee6.tgui-080a44e6ac3f4d27.tgui-5b8bdfbd2af10f59.tgui-f37a43dcc29ade55.tgui-2916d621b0ea5857._alignedText_1asrk_91"
          );
          let isPartnerEvent = false;
          if (
            isPartnerEventElement.textContent
              .toLowerCase()
              .trim()
              .includes("partner")
          ) {
            isPartnerEvent = true;
            console.log("Event is a partner event.");
          } else {
            console.log("Event is not a partner event.");
          }

          // Only add non-partner events to the task list
          if (!isPartnerEvent) {
            const titleElement = task.querySelector("._TitleMarkdown_1vt67_1");
            const taskName = titleElement
              ? titleElement.textContent.trim()
              : "Unnamed Task";
            tasksList.push({
              element: task,
              name: taskName,
              required: ticketQuantity,
              isPartnerEvent: isPartnerEvent,
            });
            console.log("Task added:", {
              name: taskName,
              required: ticketQuantity,
            });
          }
        } else {
          const titleElement = task.querySelector("._TitleMarkdown_1vt67_1");
          const taskName = titleElement
            ? titleElement.textContent.trim()
            : "Unnamed Task";
          console.log(
            `Ticket quantity not found for "${taskName}" task so skipping it.`
          );
        }
      } catch (error) {
        console.error("Error parsing task data:", error);
      }
    });

    // Step 3: Vote on tasks that can be claimed with available tickets
    if (ticketsAvailable > 0 && tasksList.length > 0) {
      tasksList.forEach((task) => {
        try {
          if (task.required <= ticketsAvailable) {
            // Click the task card to open its modal
            task.element.click();
            setTimeout(() => {
              const modal = document.querySelector(
                ".tgui-cc76354712c6e8d9._EventModal_l3elv_1"
              );
              if (!modal) {
                console.error("Modal not found for task:", task.name);
                return;
              }
              // Find the "no" button within the modal
              const voteButton = Array.from(
                modal.querySelectorAll("button")
              ).find(
                (button) => button.textContent.trim().toLowerCase() === "no"
              );

              if (voteButton && !voteButton.disabled) {
                console.log("Voting for:", task.name);
                voteButton.click();
                // After voting, click the confirm button after a short delay
                setTimeout(() => {
                  const modalConfirm = document.querySelector(
                    ".tgui-cc76354712c6e8d9._EventModal_l3elv_1"
                  );
                  const confirmBtn = Array.from(
                    modalConfirm.querySelectorAll("button")
                  ).find((button) =>
                    button.textContent.trim().toLowerCase().includes("confirm")
                  );
                  if (confirmBtn) {
                    confirmBtn.click();
                  } else {
                    console.log("Confirm button not found for", task.name);
                  }

                  const closeButton =
                    modalConfirm.querySelector('svg[type="button"]');
                  if (closeButton) {
                    closeButton.click();
                  } else {
                    console.log("Cannot found close btn.");
                  }
                }, 1000); // Adjust delay as needed
              } else {
                console.log("Vote is not available for:", task.name);
                const modal = document.querySelector(
                  ".tgui-cc76354712c6e8d9._EventModal_l3elv_1"
                );
                const closeButton = modal.querySelector('svg[type="button"]');
                if (closeButton) {
                  ["mousedown", "mouseup", "click"].forEach((eventType) => {
                    closeButton.dispatchEvent(
                      new MouseEvent(eventType, {
                        bubbles: true,
                        cancelable: true,
                      })
                    );
                    console.log("clicked close button");
                  });
                } else {
                  console.log("Cannot found close btn.");
                }
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

    console.log("Voting done, now starting task one time and daily");

    // now starting task one time and daily

    const tasksTab = Array.from(document.querySelectorAll(
      "button.tgui-b5d680db78c4cc2e.tgui-7c5d6c1f6bbe3eaf.tgui-64cd0db020a9bacf._Tab_1xy61_1"
    ))[1]

    if (tasksTab) {
      tasksTab.click();
      console.log("Clicked tasks tab.")
    } else {
      console.log("Tasks tab not found.");
    }
  }

  // Create a controls container (if it doesn't exist) for a visual indicator.
  if (!document.querySelector("#blumfarm-controls")) {
    const controlsContainer = document.createElement("div");
    controlsContainer.id = "blumfarm-controls";
    controlsContainer.style.position = "fixed";
    controlsContainer.style.top = "0";
    controlsContainer.style.left = "50%";
    controlsContainer.style.transform = "translateX(-50%)";
    controlsContainer.style.zIndex = "9999";
    controlsContainer.style.backgroundColor = "black";
    controlsContainer.style.borderRadius = "10px";
    controlsContainer.style.padding = "5px 10px";
    controlsContainer.style.color = "white";
    controlsContainer.textContent = "Auto play";
    document.body.appendChild(controlsContainer);
  }

  console.log("Waiting boss");

  setTimeout(() => {
    runTasker();
  }, 5000);
})();
