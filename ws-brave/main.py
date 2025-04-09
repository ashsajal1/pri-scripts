#!/usr/bin/env python3
import os
import subprocess
import psutil
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from contextlib import asynccontextmanager
from pydantic import BaseModel, validator, ValidationError

# Read env value, default to "true" if not set
raw_env_value = os.getenv("CUSTOM_VALUE", "true").lower()
custom_value = raw_env_value == "true"


class IsTrueValue(BaseModel):
    custom_value: bool

    # Custom validator to enforce custom_value to be True
    @validator("custom_value")
    def check_if_true(cls, v):
        if v is not True:
            raise ValueError("custom_value must be True")
        return v


# Base directory for Brave profiles and configuration
BASE_DIR = "/home/sajal/multiple-data/brave"
MAX_INSTANCES = 13

# Global variables for managing instances and batches
running_instances = {}  # Mapping of profile folder name to subprocess.Popen instance
current_segment = 0  # 0-based index for the current segment (batch)
close_request_count = 0  # Counter for /close requests received for the current segment
all_profiles = []  # List of all profiles


def load_all_profiles() -> List[str]:
    """Load all profile folder names from BASE_DIR, sorted numerically if possible."""
    global all_profiles
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
    all_profiles = profiles
    return profiles


def close_all_instances():
    """Close all currently running Brave instances using psutil."""
    global running_instances
    print("[REST] Closing all running instances in current batch.")

    for folder in list(running_instances.keys()):
        profile_path = os.path.join(BASE_DIR, folder)

        # Search for processes matching Brave's process name and command line arguments
        for proc in psutil.process_iter(["pid", "name", "cmdline"]):
            try:
                if proc.info["name"] == "brave" and proc.info["cmdline"] is not None:
                    if any(profile_path in cmd for cmd in proc.info["cmdline"]):
                        print(
                            f"[REST] Terminating Brave process with PID {proc.info['pid']} for profile {folder}"
                        )
                        proc.terminate()
                        proc.wait()
                        print(f"[REST] Closed instance: {folder}")
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

        # Remove from running_instances
        running_instances.pop(folder, None)

    print("[REST] All instances in the current batch closed.")


def open_instances():
    """
    Open Brave instances for the current segment up to MAX_INSTANCES.
    The starting index is calculated based on the current segment.
    """
    global running_instances, current_segment, all_profiles

    profiles = load_all_profiles()
    start_index = current_segment * MAX_INSTANCES

    # Open new instances until we reach MAX_INSTANCES or run out of profiles.
    while len(running_instances) < MAX_INSTANCES and start_index < len(profiles):
        folder = profiles[start_index]
        if folder not in running_instances:
            profile_path = os.path.join(BASE_DIR, folder)
            proc = subprocess.Popen(["brave", f"--user-data-dir={profile_path}"])
            running_instances[folder] = proc
            print(f"[REST] Opened instance: {folder}")
        start_index += 1


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events."""
    print("[REST] Startup: Opening initial batch of instances.")
    load_all_profiles()
    open_instances()
    yield
    print("[REST] Shutdown: Closing all instances.")
    close_all_instances()


# Initialize the API application
app = FastAPI(title="Brave Instance Manager REST API", lifespan=lifespan)

# Allow all origins (you can restrict this later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your domain for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/status", response_model=dict)
def get_status():
    """Return the list of currently running instances."""
    return {"running_instances": list(running_instances.keys())}


@app.post("/close", response_model=dict)
def close_instance():
    """
    Increment a close request counter.
    Once the total requests equal MAX_INSTANCES, close all current instances,
    advance to the next batch, and open new instances.
    """
    global close_request_count, current_segment

    # Increment the counter for each close request
    close_request_count += 1
    remaining = MAX_INSTANCES - close_request_count
    print(
        f"[REST] Close request received. Count: {close_request_count}/{MAX_INSTANCES}"
    )

    # If the counter hasn't reached MAX_INSTANCES, wait for more requests.
    if close_request_count < MAX_INSTANCES:
        return {
            "message": f"Close request received. Waiting for {remaining} more request(s) to close current batch."
        }

    # When the counter reaches MAX_INSTANCES, close current instances.
    close_all_instances()

    # Advance to the next segment (batch)
    current_segment += 1

    # Check if there are profiles available for the next segment.
    if current_segment * MAX_INSTANCES >= len(all_profiles):
        close_request_count = 0  # Reset counter
        return {"message": "No more profiles available for a new batch."}

    # Open the next batch of instances.
    open_instances()

    # Reset the counter
    close_request_count = 0

    return {
        "message": f"Closed current batch and opened batch {current_segment + 1}.",
        "running_instances": list(running_instances.keys()),
    }


@app.post("/open", response_model=dict)
def open_new_instances():
    """
    Force open new instances until MAX_INSTANCES is reached.
    This does not change the current segment.
    """
    open_instances()
    return {
        "message": "Opened new instances if available.",
        "running_instances": list(running_instances.keys()),
    }


@app.get("/check", response_model=dict)
def open_new_instances():
    """
    Show the current value of custom_value.
    """
    return {"success": custom_value}


@app.post("/set-custom-value")
async def set_custom_value(data: IsTrueValue):
    global custom_value
    custom_value = data.custom_value
    return {"message": f"custom_value is set to {custom_value}"}
