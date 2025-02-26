#!/usr/bin/env python3
import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk
import os
import subprocess

# Base directory for Brave profiles
BASE_DIR = "/home/sajal/multiple-data/brave"


class BraveManager(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="Brave Instance Manager")
        self.set_border_width(10)
        self.set_default_size(500, 400)

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

        launch_five_button = Gtk.Button(label="Open 5/5")
        launch_five_button.connect("clicked", self.on_open_five)
        hbox_launch.pack_start(launch_five_button, True, True, 0)

        vbox.pack_start(hbox_launch, False, False, 0)

    def load_profiles(self):
        """Load existing instance folders from BASE_DIR."""
        self.liststore.clear()
        # Create BASE_DIR if it doesn't exist
        if not os.path.exists(BASE_DIR):
            os.makedirs(BASE_DIR)
        # List and sort folders; if numeric, sort numerically.
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
            subprocess.Popen(["brave-browser", f"--user-data-dir={profile_path}"])

    def on_open_five(self, widget):
        """Launch Brave for the first five instance folders (or fewer)."""
        count = 0
        for row in self.liststore:
            if count >= 5:
                break
            folder_name = row[0]
            profile_path = os.path.join(BASE_DIR, folder_name)
            subprocess.Popen(["brave-browser", f"--user-data-dir={profile_path}"])
            count += 1

    def on_open_selected(self, widget):
        """Launch Brave for the instance folder selected in the list."""
        selection = self.treeview.get_selection()
        model, treeiter = selection.get_selected()
        if treeiter is not None:
            folder_name = model[treeiter][0]
            profile_path = os.path.join(BASE_DIR, folder_name)
            subprocess.Popen(["brave-browser", f"--user-data-dir={profile_path}"])
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


if __name__ == "__main__":
    win = BraveManager()
    win.connect("destroy", Gtk.main_quit)
    win.show_all()
    Gtk.main()
