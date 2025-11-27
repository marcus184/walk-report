#!/usr/bin/env python3
"""
Example script to upload files from Raspberry Pi to the Walk Report server.
Usage: python3 upload-example.py <file_path> [server_url]
"""

import sys
import requests
import os

def upload_file(file_path, server_url="http://localhost:3000"):
    """Upload a file to the Walk Report server."""
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

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 upload-example.py <file_path> [server_url]")
        print("Example: python3 upload-example.py /home/pi/image.jpg http://192.168.1.100:3000")
        sys.exit(1)
    
    file_path = sys.argv[1]
    server_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3000"
    
    upload_file(file_path, server_url)

