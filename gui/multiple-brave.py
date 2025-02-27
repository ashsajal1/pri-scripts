#!/usr/bin/env python3
import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk
import os
import subprocess
import shutil

# Base directory for Brave profiles
BASE_DIR = "/home/sajal/multiple-data/brave"


class BraveManager(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="Brave Instance Manager")
        self.set_border_width(10)
        self.set_default_size(500, 400)
        self.five_index = 0  # for cycling through batches of 5

        # Main vertical layout
        vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=6)
        self.add(vbox)

        # ListStore to hold profile folder names
        self.liststore = Gtk.ListStore(str)
        self.load_profiles()

        # TreeView to display profiles
        self.treeview = Gtk.TreeView(model=self.liststore)
        renderer = Gtk.CellRendererText()
        column = Gtk.TreeViewColumn("Instance Folder", renderer, text=0)
        self.treeview.append_column(column)
        scrolled_window = Gtk.ScrolledWindow()
        scrolled_window.set_vexpand(True)
        scrolled_window.add(self.treeview)
        vbox.pack_start(scrolled_window, True, True, 0)

        # Button for creating a new instance
        new_button = Gtk.Button(label="New Instance")
        new_button.connect("clicked", self.on_new_instance)
        vbox.pack_start(new_button, False, False, 0)

        # Horizontal box for launch buttons
        hbox_launch = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
        open_selected_button = Gtk.Button(label="Open Selected")
        open_selected_button.connect("clicked", self.on_open_selected)
        hbox_launch.pack_start(open_selected_button, True, True, 0)

        launch_all_button = Gtk.Button(label="Open All")
        launch_all_button.connect("clicked", self.on_open_all)
        hbox_launch.pack_start(launch_all_button, True, True, 0)

        self.launch_five_button = Gtk.Button(label="Open 5/5")
        self.launch_five_button.connect("clicked", self.on_open_five)
        hbox_launch.pack_start(self.launch_five_button, True, True, 0)

        vbox.pack_start(hbox_launch, False, False, 0)

        # Horizontal box for range input and button
        hbox_range = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
        self.range_entry = Gtk.Entry()
        self.range_entry.set_placeholder_text("e.g. 5-10")
        hbox_range.pack_start(self.range_entry, True, True, 0)
        open_range_button = Gtk.Button(label="Open Range")
        open_range_button.connect("clicked", self.on_open_range)
        hbox_range.pack_start(open_range_button, False, False, 0)
        vbox.pack_start(hbox_range, False, False, 0)

        # Clear Cache Button with cache size in its label
        self.clear_cache_button = Gtk.Button(
            label=f"Clear {self.get_total_cache_size()} Cache"
        )
        self.clear_cache_button.connect("clicked", self.on_clear_cache)
        vbox.pack_start(self.clear_cache_button, False, False, 0)

    def load_profiles(self):
        """Load existing instance folders from BASE_DIR."""
        self.liststore.clear()
        if not os.path.exists(BASE_DIR):
            os.makedirs(BASE_DIR)
        for entry in sorted(
            os.listdir(BASE_DIR), key=lambda s: int(s) if s.isdigit() else s
        ):
            full_path = os.path.join(BASE_DIR, entry)
            if os.path.isdir(full_path):
                self.liststore.append([entry])

    def on_new_instance(self, widget):
        """Create a new instance folder using count + 1 as its name."""
        count = len(self.liststore)
        new_folder_name = str(count + 1)
        new_folder_path = os.path.join(BASE_DIR, new_folder_name)
        try:
            os.makedirs(new_folder_path, exist_ok=False)
        except FileExistsError:
            dialog = Gtk.MessageDialog(
                transient_for=self,
                flags=0,
                message_type=Gtk.MessageType.ERROR,
                buttons=Gtk.ButtonsType.OK,
                text="Folder already exists!",
            )
            dialog.format_secondary_text(
                f"The folder {new_folder_name} already exists."
            )
            dialog.run()
            dialog.destroy()
            return
        self.liststore.append([new_folder_name])

    def on_open_all(self, widget):
        """Launch Brave for every instance folder."""
        for row in self.liststore:
            folder_name = row[0]
            profile_path = os.path.join(BASE_DIR, folder_name)
            subprocess.Popen(["brave", f"--user-data-dir={profile_path}"])

    def on_open_five(self, widget):
        """Launch Brave for a batch of five instance folders (cycling through list)."""
        total_profiles = len(self.liststore)
        if total_profiles == 0:
            return
        # Reset if we've reached the end.
        if self.five_index >= total_profiles:
            self.five_index = 0
        end_index = min(self.five_index + 5, total_profiles)
        for i in range(self.five_index, end_index):
            row = self.liststore[i]
            folder_name = row[0]
            profile_path = os.path.join(BASE_DIR, folder_name)
            subprocess.Popen(["brave", f"--user-data-dir={profile_path}"])
        self.five_index = end_index if end_index < total_profiles else 0

    def on_open_range(self, widget):
        """Launch Brave for the instance folders within the user-specified range."""
        text = self.range_entry.get_text().strip()
        if not text:
            return
        try:
            parts = text.split("-")
            if len(parts) != 2:
                raise ValueError("Invalid format")
            start = int(parts[0].strip())
            end = int(parts[1].strip())
            if start > end:
                start, end = end, start
        except ValueError:
            dialog = Gtk.MessageDialog(
                transient_for=self,
                flags=0,
                message_type=Gtk.MessageType.ERROR,
                buttons=Gtk.ButtonsType.OK,
                text="Invalid range format. Use format like 5-10.",
            )
            dialog.run()
            dialog.destroy()
            return

        # Open profiles whose folder name (as a number) is within the specified range.
        for row in self.liststore:
            folder_name = row[0]
            try:
                num = int(folder_name)
            except ValueError:
                continue
            if start <= num <= end:
                profile_path = os.path.join(BASE_DIR, folder_name)
                subprocess.Popen(["brave", f"--user-data-dir={profile_path}"])

    def on_open_selected(self, widget):
        """Launch Brave for the instance folder selected in the list."""
        selection = self.treeview.get_selection()
        model, treeiter = selection.get_selected()
        if treeiter is not None:
            folder_name = model[treeiter][0]
            profile_path = os.path.join(BASE_DIR, folder_name)
            subprocess.Popen(["brave", f"--user-data-dir={profile_path}"])
        else:
            dialog = Gtk.MessageDialog(
                transient_for=self,
                flags=0,
                message_type=Gtk.MessageType.INFO,
                buttons=Gtk.ButtonsType.OK,
                text="No profile selected!",
            )
            dialog.format_secondary_text(
                "Please select a profile from the list before launching."
            )
            dialog.run()
            dialog.destroy()

    def get_total_cache_size(self):
        """Calculate total cache size for all Brave instances in MB."""
        total_size = 0
        for row in self.liststore:
            folder_name = row[0]
            cache_path = os.path.join(BASE_DIR, folder_name, "Default", "Cache")
            if os.path.exists(cache_path):
                for dirpath, _, filenames in os.walk(cache_path):
                    total_size += sum(
                        os.path.getsize(os.path.join(dirpath, f)) for f in filenames
                    )
        return round(total_size / (1024 * 1024), 2)  # Convert bytes to MB

    def on_clear_cache(self, widget):
        """Clear cache for all instances and update the clear button label with new cache size."""
        total_cache_before = self.get_total_cache_size()
        dialog = Gtk.MessageDialog(
            transient_for=self,
            flags=0,
            message_type=Gtk.MessageType.QUESTION,
            buttons=Gtk.ButtonsType.YES_NO,
            text="Clear all cache?",
        )
        dialog.format_secondary_text(
            f"Total Cache: {total_cache_before} MB\nAre you sure?"
        )
        response = dialog.run()
        dialog.destroy()

        if response == Gtk.ResponseType.YES:
            for row in self.liststore:
                folder_name = row[0]
                cache_path = os.path.join(BASE_DIR, folder_name, "Default", "Cache")
                if os.path.exists(cache_path):
                    shutil.rmtree(cache_path, ignore_errors=True)

            # Update the clear cache button's label after clearing
            new_cache = self.get_total_cache_size()
            self.clear_cache_button.set_label(f"Clear {new_cache} Cache")
            Gtk.MessageDialog(
                transient_for=self,
                flags=0,
                message_type=Gtk.MessageType.INFO,
                buttons=Gtk.ButtonsType.OK,
                text="Cache cleared!",
            ).run()


if __name__ == "__main__":
    win = BraveManager()
    win.connect("destroy", Gtk.main_quit)
    win.show_all()
    Gtk.main()
