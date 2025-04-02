#!/usr/bin/env python3
import os
import subprocess
import psutil
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from contextlib import asynccontextmanager

# Base directory for Brave profiles and configuration
BASE_DIR = "/home/sajal/multiple-data/brave"
MAX_INSTANCES = 15

# Global variables for managing instances
running_instances = {}  # Mapping of profile folder name to subprocess.Popen instance
next_profile_index = 0  # Index for the next profile to launch
close_request_count = 0  # Count of close requests received
profiles_to_open = []  # List of profiles to open after closing
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
    global running_instances, profiles_to_open
    print("[REST] Closing all running instances.")

    # Store the profiles that were running before closing
    profiles_to_open = list(running_instances.keys())

    for folder in list(running_instances.keys()):
        profile_path = os.path.join(BASE_DIR, folder)

        # Search for processes matching Brave's process name and command line arguments
        for proc in psutil.process_iter(["pid", "name", "cmdline"]):
            try:
                if proc.info["name"] == "brave" and proc.info["cmdline"] is not None:
                    if any(profile_path in cmd for cmd in proc.info["cmdline"]):
                        print(f"[REST] Terminating Brave process with PID {proc.info['pid']}")
                        proc.terminate()
                        proc.wait()
                        print(f"[REST] Closed instance: {folder}")
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

        # Clear the entry in running_instances
        running_instances.pop(folder, None)

    print("[REST] All instances closed.")


def open_instances():
    """Open Brave instances up to MAX_INSTANCES if available."""
    global next_profile_index, running_instances, profiles_to_open, all_profiles
    profiles = load_all_profiles()

    # If there are profiles to open from the previous close, use them first
    if profiles_to_open:
        print("[REST] Opening instances from previous close.")
        for folder in profiles_to_open:
            if folder in profiles and folder not in running_instances:
                profile_path = os.path.join(BASE_DIR, folder)
                proc = subprocess.Popen(["brave", f"--user-data-dir={profile_path}"])
                running_instances[folder] = proc
                print(f"[REST] Opened instance: {folder}")
        profiles_to_open = []  # Clear the list after using it

    # Then, open new instances if needed
    while len(running_instances) < MAX_INSTANCES and next_profile_index < len(profiles):
        folder = profiles[next_profile_index]
        if folder not in running_instances:
            profile_path = os.path.join(BASE_DIR, folder)
            proc = subprocess.Popen(["brave", f"--user-data-dir={profile_path}"])
            running_instances[folder] = proc
            print(f"[REST] Opened instance: {folder}")
        next_profile_index += 1


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events."""
    print("[REST] Startup: Opening initial instances.")
    load_all_profiles()
    open_instances()
    yield
    print("[REST] Shutdown: Closing all instances.")
    close_all_instances()


# Initialize the API application
app = FastAPI(title="Brave Instance Manager REST API", lifespan=lifespan)

# Allow all origins (You can restrict this later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your domain for security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


@app.get("/status", response_model=dict)
def get_status():
    """Return the list of currently running instances."""
    return {"running_instances": list(running_instances.keys())}


@app.post("/close", response_model=dict)
def close_instance():
    """
    Close Brave instances in batches of MAX_INSTANCES (15), except for the last smaller batch.
    """
    global close_request_count, next_profile_index, all_profiles

    # Get total profiles in BASE_DIR
    total_profiles = len(all_profiles)

    if total_profiles == 0:
        return {"message": "No profiles found in the directory."}

    # Calculate batch breakdown
    full_batches = total_profiles // MAX_INSTANCES
    remaining_profiles = total_profiles % MAX_INSTANCES

    # Determine current batch number based on requests made
    current_batch = close_request_count // MAX_INSTANCES

    # Is this the last segment?
    is_last_segment = (current_batch >= full_batches) and (remaining_profiles != 0)

    # Set the correct threshold for closing
    if is_last_segment:
        close_threshold = remaining_profiles
    else:
        close_threshold = MAX_INSTANCES

    # Increment the close request counter
    close_request_count += 1
    print(f"[REST] Close request received. Total close requests: {close_request_count}")

    # If close requests reach the threshold, close all instances for this segment
    if close_request_count >= close_threshold:
        print(f"[REST] Closing all instances for this segment ({close_threshold}).")
        close_all_instances()

        # After closing, reset `next_profile_index` to the beginning to open new profiles
        next_profile_index = 0  # Reset to open fresh profiles

        # Open new instances after closing
        open_instances()

        # Reset the counter
        close_request_count = 0

        return {
            "message": "All instances closed for this segment and new instances opened."
        }

    return {
        "message": f"Close request received. Waiting for {close_threshold - close_request_count} more requests.",
    }


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
 