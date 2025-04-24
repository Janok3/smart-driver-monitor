import os
import sys
import urllib.request
import zipfile
import shutil

def setup_hadoop_for_windows():
    """Set up Hadoop environment for Windows to avoid warnings"""
    # Create Hadoop directory
    hadoop_home = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hadoop")
    if not os.path.exists(hadoop_home):
        os.makedirs(hadoop_home, exist_ok=True)
        os.makedirs(os.path.join(hadoop_home, "bin"), exist_ok=True)
    
    # Download winutils.exe if it doesn't exist
    winutils_path = os.path.join(hadoop_home, "bin", "winutils.exe")
    if not os.path.exists(winutils_path):
        print("Downloading winutils.exe...")
        # URL for Hadoop 3.2.0 winutils
        url = "https://github.com/cdarlint/winutils/raw/master/hadoop-3.2.0/bin/winutils.exe"
        try:
            urllib.request.urlretrieve(url, winutils_path)
            print(f"Downloaded winutils.exe to {winutils_path}")
        except Exception as e:
            print(f"Error downloading winutils.exe: {e}")
    
    # Set environment variables
    os.environ["HADOOP_HOME"] = hadoop_home
    
    print(f"Hadoop environment set up at {hadoop_home}")
    return hadoop_home

if __name__ == "__main__":
    setup_hadoop_for_windows()