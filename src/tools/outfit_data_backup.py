"""
outfit_data_backup.py - Backup the outfit data from a local source
                        to a backup directory and delete old backups
"""

import shutil
import os
from datetime import datetime

SOURCE_DIRECTORY = "/var/lib/outfit-data"
BACKUP_DIRECTORY = "~/outfit-backup"
DAYS_TO_KEEP = 3

def main():
    """Program entry point"""

    # Expand the user's home directory for the backup directory
    backup_root_dir = os.path.expanduser(BACKUP_DIRECTORY)

    # Create the root backup directory if it doesn't exist
    os.makedirs(backup_root_dir, exist_ok=True)

    # Get the current date and time to use as part of the backup folder name
    current_datetime = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"{backup_root_dir}/{current_datetime}"

    # Create the subdirectory for the backup
    os.makedirs(backup_dir, exist_ok=True)

    # Copy the outfit data to the backup directory
    print(f"Copying {SOURCE_DIRECTORY} to {backup_dir}")
    shutil.copytree(SOURCE_DIRECTORY, backup_dir, dirs_exist_ok=True)

    # Get a list the folders in the backup_root_dir
    backup_folders = os.listdir(backup_root_dir)

    # Loop through the folders in the backup directory
    # and delete any folders older than DAYS_TO_KEEP
    for folder in backup_folders:
        date = datetime.strptime(folder, "%Y%m%d_%H%M%S")
        # Get the time difference between the current date and the backup date in days
        days = (datetime.now() - date).days
        if days > DAYS_TO_KEEP:
            # Delete the backup folder if it's older than 7 days
            folder_path = f"{backup_root_dir}/{folder}"
            print(f"Deleting {folder_path} (age: {days} days)")
            shutil.rmtree(folder_path)

# Only execute main when running as the primary module
if __name__ == '__main__':
    main()
