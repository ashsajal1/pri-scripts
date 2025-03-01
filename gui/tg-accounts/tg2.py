import os
import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk, GLib

TELEGRAM_DIR = "/home/sajal/telegram_instances"
CACHE_SIZE = 5 * 1024 * 1024  # 5MB in bytes


def get_instances():
    instances = [
        f
        for f in os.listdir(TELEGRAM_DIR)
        if os.path.isdir(os.path.join(TELEGRAM_DIR, f))
    ]
    instances.sort(
        key=lambda x: int(x) if x.isdigit() else x
    )  # Sort numerically if possible
    return instances


def open_instance(instance):
    os.system(
        f'telegram-desktop -many -workdir "{os.path.join(TELEGRAM_DIR, instance)}" &'
    )


def get_cache_size():
    total_size = 0
    for instance in get_instances():
        cache_path = os.path.join(TELEGRAM_DIR, instance, "tdata", "user_data", "cache")
        if os.path.exists(cache_path):
            for root, _, files in os.walk(cache_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    total_size += os.path.getsize(file_path)
    return total_size // (1024 * 1024)  # Convert to MB


def clear_cache():
    total_cleared = 0
    for instance in get_instances():
        cache_path = os.path.join(TELEGRAM_DIR, instance, "tdata", "user_data", "cache")
        if os.path.exists(cache_path):
            for root, _, files in os.walk(cache_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    file_size = os.path.getsize(file_path)
                    os.remove(file_path)
                    total_cleared += file_size
    print(f"Cleared {total_cleared // (1024 * 1024)} MB cache!")
    return total_cleared // (1024 * 1024)


class TelegramInstanceManager(Gtk.Window):
    def __init__(self):
        super().__init__(title="Telegram Instance Manager")
        self.set_default_size(500, 400)
        self.set_border_width(10)
        self.batch_index = 0

        vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        self.add(vbox)

        self.listbox = Gtk.ListBox()
        self.refresh_list()
        vbox.pack_start(self.listbox, True, True, 0)

        hbox_entry = Gtk.Box(spacing=5)
        vbox.pack_start(hbox_entry, False, False, 0)

        self.entry = Gtk.Entry()
        hbox_entry.pack_start(self.entry, True, True, 0)

        btn_create = Gtk.Button(label="Create Instance")
        btn_create.connect("clicked", self.create_new_instance)
        hbox_entry.pack_start(btn_create, False, False, 0)

        hbox_buttons = Gtk.Box(spacing=5)
        vbox.pack_start(hbox_buttons, False, False, 0)

        btn_open_selected = Gtk.Button(label="Open Selected")
        btn_open_selected.connect("clicked", self.open_selected)
        hbox_buttons.pack_start(btn_open_selected, True, True, 0)

        btn_open_all = Gtk.Button(label="Open All")
        btn_open_all.connect("clicked", self.open_all)
        hbox_buttons.pack_start(btn_open_all, True, True, 0)

        btn_open_batch = Gtk.Button(label="Open 0-5 Apps")
        btn_open_batch.connect("clicked", self.open_batch)
        vbox.pack_start(btn_open_batch, False, False, 0)
        self.btn_open_batch = btn_open_batch  # Save reference to the button

        self.btn_clear_cache = Gtk.Button(label=f"Clear {get_cache_size()} MB Cache")
        self.btn_clear_cache.connect("clicked", self.clear_cache)
        vbox.pack_start(self.btn_clear_cache, False, False, 0)

    def refresh_list(self):
        for row in self.listbox.get_children():
            self.listbox.remove(row)

        self.instances = get_instances()
        for instance in self.instances:
            row = Gtk.ListBoxRow()
            label = Gtk.Label(label=instance)
            row.add(label)
            self.listbox.add(row)

        self.listbox.show_all()

    def create_new_instance(self, widget):
        new_name = self.entry.get_text()
        if new_name:
            new_path = os.path.join(TELEGRAM_DIR, new_name)
            if not os.path.exists(new_path):
                os.makedirs(new_path)
                self.refresh_list()
                print(f"Instance '{new_name}' created.")
            else:
                print("Instance already exists.")
        else:
            print("Please enter a valid instance name.")

    def open_selected(self, widget):
        selected_rows = self.listbox.get_selected_rows()
        for row in selected_rows:
            label = row.get_child()
            open_instance(label.get_text())

    def open_all(self, widget):
        for instance in self.instances:
            open_instance(instance)

    def open_batch(self, widget):
        instances = get_instances()
        batch_size = 5
        start = self.batch_index * batch_size
        end = start + batch_size

        if start >= len(instances):
            self.batch_index = 0  # Reset if out of range
            start, end = 0, batch_size

        for instance in instances[start:end]:
            open_instance(instance)

        self.batch_index += 1

        # Update the button label to show the current range
        next_start = self.batch_index * batch_size
        next_end = next_start + batch_size
        if next_start >= len(instances):
            next_start, next_end = 0, batch_size
        self.btn_open_batch.set_label(f"Open {next_start}-{next_end} Apps")

    def clear_cache(self, widget):
        cleared_size = clear_cache()
        self.btn_clear_cache.set_label(
            f"Clear {cleared_size} MB Cache"
        )  # Update dynamically


win = TelegramInstanceManager()
win.connect("destroy", Gtk.main_quit)
win.show_all()
Gtk.main()
