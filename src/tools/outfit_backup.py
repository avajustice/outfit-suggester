"""
outfit_backup.py - Backup outfits from one location and restore them to another

"""
import os
import sys
import json
import base64
from datetime import datetime
import requests

SOURCE_URL = "https://outfit-suggester-service.replit.app/"
DESTINATION_URL = "http://localhost:3000/"

def get_images(source_url, items, backup_dir):
    """Get the images from the source and save them to the backup directory"""
    # Create a subdirectory for the images
    image_dir = f"{backup_dir}/images"
    os.makedirs(image_dir, exist_ok=True)

    print("\nGetting images from item data...")

    image_ids = []
    for item in items:
        if item['imgId'] not in image_ids:
            image_ids.append(item['imgId'])

    # Print the count of images
    print(f"images count: {len(image_ids)}")

    # Download the images and save them to the images subdirectory
    # Note that img_id will be something like image-85b426a19c92d20d.png
    for img_id in image_ids:
        image_url = f"{source_url}/images/{img_id}"
        # print(f"Getting {image_url}")
        response = requests.get(image_url, timeout=60)
        with open(f"{image_dir}/{img_id}", "wb") as file:
            file.write(response.content)

def backup(source_url):
    """Backup the items and dates from the source"""
    print(f"\nGetting items from {source_url}")

    # Get the items from the source
    items = requests.get(f"{source_url}/api/items", timeout=60).json()

    # Print the count of items
    print(f"items count: {len(items)}")

    print(f"\nGetting dates from {source_url}")

    # Get the dates from the source
    dates = requests.get(f"{source_url}/api/dates", timeout=60).json()

    # Print the count of dates
    print(f"dates count: {len(dates)}")

    # Get the current date and time to use as part of the filename
    current_datetime = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Create the backup directory if it doesn't exist
    os.makedirs("backup", exist_ok=True)

    backup_dir = f"backup/{current_datetime}"

    # Create a subdirectory for the current date and time
    os.makedirs(backup_dir, exist_ok=True)

    # Save the items to a file
    items_filename = f"{backup_dir}/items.json"
    with open(items_filename, "w", encoding="utf-8") as file:
        json.dump(items, file, indent=2)

    # Save the dates to a file
    dates_filename = f"{backup_dir}/dates.json"
    with open(dates_filename, "w", encoding="utf-8") as file:
        json.dump(dates, file, indent=2)

    # Get the images too
    get_images(source_url, items, backup_dir)

    print(f"\nSaved backup files to backup/{current_datetime}")

def restore_images(backup_dir, destination_url):
    """Restore the images to the destination"""
    # Get the images from the backup directory
    image_dir = f"{backup_dir}/images"
    for image_filename in os.listdir(image_dir):
        image_path = f"{image_dir}/{image_filename}"
        with open(image_path, "rb") as file:
            image_data = file.read()
            # base 64 encode the image data
            image_data = base64.b64encode(image_data).decode("utf-8")
            # The data needs to be a JSON object with a "imgData" key
            image_data = {"imgData": image_data}

            print(f"Restoring image: {image_filename}")
            response = requests.put(f"{destination_url}/api/images/{image_filename}", json=image_data, timeout=60)
            print(f"Restore response: {response.text}")

def restore(destination_url):
    """Restore the items and dates to the destination"""
    if len(sys.argv) < 3:
        print("Usage: outfit_backup.py restore <path_to_backup>")
        print("No path to backup provided!")
        return

    # Get the backup directory
    backup_dir = sys.argv[2]

    # Ask the user if they really want to restore the data
    restore_yes_no = input(f"\nRestore data to {destination_url}? (yes/no): ")
    if restore_yes_no != "yes":
        print("Data will not be restored")
        return

    # # Restore the items to the destination
    print(f"\nRestoring items to {destination_url}")

    # Get the items from the backup file
    items_filename = f"{backup_dir}/items.json"
    with open(items_filename, "r", encoding="utf-8") as file:
        items = json.load(file)
        for item in items:
            print(f"Restoring item: {item['id']}")
            response = requests.put(f"{destination_url}/api/items/{item['id']}", json=item, timeout=60)
            print(f"Restore response: {response.text}")

    # Get the dates from the backup file
    dates_filename = f"{backup_dir}/dates.json"
    with open(dates_filename, "r", encoding="utf-8") as file:
        dates = json.load(file)
        for date in dates:
            print(f"Restoring date: {date['id']}")
            response = requests.put(f"{destination_url}/api/dates/{date['id']}", json=date, timeout=60)
            print(f"Restore response: {response.text}")

    # Restore the images too
    restore_images(backup_dir, destination_url)

def main():
    """Program entry point"""
    # Get the command line args, first arg should be "backup" or "restore"
    if len(sys.argv) < 2:
        print("Usage:   outfit_backup.py backup")
        print("or")
        print("Usage:   outfit_backup.py restore <path_to_backup>")
        print("Example: outfit_backup.py restore backup/20240724_201058")
        return

    operation = sys.argv[1]

    if operation == "backup":
        backup(SOURCE_URL)
    elif operation == "restore":
        restore(DESTINATION_URL)
    else:
        print("Usage: outfit_backup.py backup|restore")

# Only execute main when running as the primary module
if __name__ == '__main__':
    main()
