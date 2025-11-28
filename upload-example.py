#!/usr/bin/env python3
"""
WAC Device Upload Script
Upload images from WAC devices (Raspberry Pi, etc.) to the WAC Console server.

Usage: 
  python3 upload-example.py <file_path> [server_url]

Examples:
  # Upload to local development server
  python3 upload-example.py /home/pi/image.jpg http://localhost:5001

  # Upload to Replit deployment (use your Replit URL)
  python3 upload-example.py /path/to/image.jpg https://your-repl-name.your-username.repl.co
"""

import sys
import requests
import os

def upload_file(file_path, server_url="http://localhost:5001"):
    """Upload a file to the WAC Console server."""
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return False
    
    url = f"{server_url}/api/upload"
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f)}
            response = requests.post(url, files=files)
            
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Successfully uploaded: {data['originalName']}")
            print(f"  Saved as: {data['filename']}")
            print(f"  Size: {data['size']} bytes")
            return True
        else:
            print(f"✗ Upload failed: {response.status_code}")
            print(f"  {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"✗ Error: Could not connect to server at {server_url}")
        print("  Make sure the server is running and the URL is correct.")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def upload_directory(dir_path, server_url="http://localhost:5001", extensions=None):
    """Upload all matching files from a directory."""
    if extensions is None:
        extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    
    if not os.path.isdir(dir_path):
        print(f"Error: Directory '{dir_path}' not found.")
        return False
    
    files = [f for f in os.listdir(dir_path) 
             if os.path.isfile(os.path.join(dir_path, f)) 
             and os.path.splitext(f)[1].lower() in extensions]
    
    if not files:
        print(f"No matching files found in {dir_path}")
        return False
    
    print(f"Found {len(files)} files to upload...")
    success_count = 0
    for filename in files:
        file_path = os.path.join(dir_path, filename)
        if upload_file(file_path, server_url):
            success_count += 1
    
    print(f"\nUpload complete: {success_count}/{len(files)} files uploaded successfully")
    return success_count == len(files)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("WAC Device Upload Script")
        print("=" * 40)
        print("\nUsage:")
        print("  python3 upload-example.py <file_or_directory> [server_url]")
        print("\nExamples:")
        print("  # Upload single file to local server")
        print("  python3 upload-example.py /home/pi/capture.jpg http://localhost:5001")
        print("\n  # Upload to Replit deployment")
        print("  python3 upload-example.py /home/pi/capture.jpg https://your-app.repl.co")
        print("\n  # Upload all images from a directory")
        print("  python3 upload-example.py /home/pi/captures/ https://your-app.repl.co")
        print("\nSupported formats: JPG, JPEG, PNG, GIF, BMP, WEBP")
        sys.exit(1)
    
    path = sys.argv[1]
    server_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:5001"
    
    if os.path.isdir(path):
        upload_directory(path, server_url)
    else:
        upload_file(path, server_url)
