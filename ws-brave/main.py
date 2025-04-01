#!/usr/bin/env python3
import os
import subprocess
from fastapi import FastAPI, HTTPException
from typing import List

# Base directory for Brave profiles and configuration
BASE_DIR = "/home/sajal/multiple-data/brave"
MAX_INSTANCES = 15

# Global variables for managing instances
running_instances = {}  # Mapping of profile folder name to subprocess.Popen instance
next_profile_index = 0  # Index for the next profile to launch


def load_all_profiles() -> List[str]:
    """Load all profile folder names from BASE_DIR, sorted numerically if possible."""
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
    profiles = sorted(
        [
            entry
            for entry in os.listdir(BASE_DIR)
            if os.path.isdir(os.path.join(BASE_DIR, entry))
        ],
        key=lambda s: int(s) if s.isdigit() else s,
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
        print(f"[REST] Opened instance: {folder}")


# Initialize the API application
app = FastAPI(title="Brave Instance Manager REST API")


@app.on_event("startup")
def startup_event():
    # On startup, open instances up to MAX_INSTANCES
    open_instances()
    print("[REST] Startup: Opened initial instances.")


@app.get("/status", response_model=dict)
def get_status():
    """
    Return the list of currently running instances.
    """
    return {"running_instances": list(running_instances.keys())}


@app.post("/close/{folder}", response_model=dict)
def close_instance(folder: str):
    """
    Close the Brave instance corresponding to the given profile folder.
    Automatically opens new instances if available.
    """
    global running_instances
    if folder in running_instances:
        proc = running_instances.pop(folder)
        proc.terminate()
        print(f"[REST] Closed instance: {folder}")
        # Open new instances if the total running is less than MAX_INSTANCES
        open_instances()
        return {"message": f"Closed instance: {folder}"}
    else:
        raise HTTPException(status_code=404, detail=f"Instance {folder} not running.")


# Optional endpoint to force open new instances (if available)
@app.post("/open", response_model=dict)
def open_new_instances():
    """
    Force open new instances until MAX_INSTANCES is reached.
    """
    open_instances()
    return {
        "message": "Opened new instances if available.",
        "running_instances": list(running_instances.keys()),
    }


# You can add more endpoints as needed.
