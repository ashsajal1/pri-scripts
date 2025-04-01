#!/usr/bin/env python3
import os
import subprocess
import asyncio
import shutil
import websockets

# Base directory for Brave profiles
BASE_DIR = "/home/sajal/multiple-data/brave"
MAX_INSTANCES = 15

# Global variables for managing instances
running_instances = {}   # Mapping of profile folder name to subprocess.Popen instance
next_profile_index = 0   # Index for the next profile to launch

def load_all_profiles():
    """Load all profile folder names from BASE_DIR, sorted numerically if possible."""
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
    profiles = sorted(
        [entry for entry in os.listdir(BASE_DIR) if os.path.isdir(os.path.join(BASE_DIR, entry))],
        key=lambda s: int(s) if s.isdigit() else s
    )
    return profiles

def open_instances():
    """
    Open Brave instances until there are MAX_INSTANCES running (if available).
    Uses the global next_profile_index to track which profiles to launch next.
    """
    global next_profile_index, running_instances
    profiles = load_all_profiles()
    while len(running_instances) < MAX_INSTANCES and next_profile_index < len(profiles):
        folder = profiles[next_profile_index]
        next_profile_index += 1
        profile_path = os.path.join(BASE_DIR, folder)
        proc = subprocess.Popen(["brave", f"--user-data-dir={profile_path}"])
        running_instances[folder] = proc
        print(f"[WS] Opened instance: {folder}")

async def ws_handler(websocket, path):
    """Handle incoming WebSocket connections and messages."""
    print(f"[WS] New connection: {websocket.remote_address}")
    await websocket.send("Connected to Brave Manager WebSocket server.")
    async for message in websocket:
        print(f"[WS] Received message: {message}")
        if message.startswith("close:"):
            # Expecting message like "close:<folder>"
            folder = message.split(":", 1)[1].strip()
            if folder in running_instances:
                proc = running_instances.pop(folder)
                proc.terminate()
                print(f"[WS] Closed instance: {folder}")
                await websocket.send(f"Closed instance: {folder}")
                # Open next instance if available
                open_instances()
            else:
                await websocket.send(f"Instance {folder} not running.")
        elif message.strip() == "status":
            await websocket.send(f"Running instances: {list(running_instances.keys())}")
        else:
            await websocket.send("Unknown command.")

async def main():
    # Open initial instances up to MAX_INSTANCES
    open_instances()
    async with websockets.serve(ws_handler, "localhost", 8765):
        print("[WS] WebSocket server started on ws://localhost:8765")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
