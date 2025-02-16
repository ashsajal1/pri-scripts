import os
import tkinter as tk
from tkinter import messagebox
import re

TELEGRAM_DIR = "/home/sajal/telegram_instances"


def natural_key(s: str):
    """
    Splits the string into a list of strings and integers for natural sorting.
    E.g., "item10" -> ["item", 10, ""]
    """
    return [
        int(text) if text.isdigit() else text.lower() for text in re.split("(\d+)", s)
    ]


def get_instances():
    instances = [
        f
        for f in os.listdir(TELEGRAM_DIR)
        if os.path.isdir(os.path.join(TELEGRAM_DIR, f))
    ]
    instances.sort(key=natural_key)
    return instances


def open_instance(instance):
    os.system(
        f'telegram-desktop -many -workdir "{os.path.join(TELEGRAM_DIR, instance)}" &'
    )


def handle_selection():
    selection = listbox.curselection()
    if selection:
        for i in selection:
            open_instance(instances[i])
    else:
        messagebox.showwarning("No Selection", "Please select an instance to open.")


def open_all():
    for instance in instances:
        open_instance(instance)


def create_new_instance():
    new_name = entry.get()
    if new_name:
        new_path = os.path.join(TELEGRAM_DIR, new_name)
        if not os.path.exists(new_path):
            os.makedirs(new_path)
            messagebox.showinfo("Success", f"Instance '{new_name}' created.")
            refresh_list()
        else:
            messagebox.showwarning("Exists", "Instance already exists.")
    else:
        messagebox.showwarning("Invalid Name", "Please enter a valid instance name.")


def refresh_list():
    global instances
    instances = get_instances()
    listbox.delete(0, tk.END)
    for item in instances:
        listbox.insert(tk.END, item)


root = tk.Tk()
root.title("Telegram Instance Manager")

frame = tk.Frame(root)
frame.pack(padx=10, pady=10)

listbox = tk.Listbox(frame, selectmode=tk.MULTIPLE, height=10, width=40)
listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

scrollbar = tk.Scrollbar(frame, orient="vertical")
scrollbar.config(command=listbox.yview)
scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

listbox.config(yscrollcommand=scrollbar.set)

btn_frame = tk.Frame(root)
btn_frame.pack(pady=5)

btn_open = tk.Button(btn_frame, text="Open Selected", command=handle_selection)
btn_open.grid(row=0, column=0, padx=5)

btn_all = tk.Button(btn_frame, text="Open All", command=open_all)
btn_all.grid(row=0, column=1, padx=5)

entry = tk.Entry(root, width=30)
entry.pack(pady=5)

btn_create = tk.Button(root, text="Create New Instance", command=create_new_instance)
btn_create.pack()

refresh_list()
root.mainloop()
