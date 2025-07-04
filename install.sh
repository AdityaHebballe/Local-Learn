#!/bin/bash

# Clone the repository
git clone https://github.com/AdityaHebballe/Local-Learn.git
cd Local-Learn

# Get the latest release URL
LATEST_RELEASE_URL=$(curl -s https://api.github.com/repos/AdityaHebballe/Local-Learn/releases/latest | grep "browser_download_url.*AppImage" | cut -d : -f 2,3 | tr -d \")

# Download the AppImage
curl -L -o "Local Learn.AppImage" $LATEST_RELEASE_URL
chmod +x "Local Learn.AppImage"

# Move the AppImage to ~/.local/bin
mkdir -p ~/.local/bin
mv "Local Learn.AppImage" ~/.local/bin/local-learn

# Move the icon
mkdir -p ~/.local/share/icons
cp assets/icon.png ~/.local/share/icons/local-learn.png

# Create the .desktop file
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/local-learn.desktop << EOL
[Desktop Entry]
Name=Local Learn
Comment=Watch your local course files in a Udemy-like interface.
Exec=~/.local/bin/local-learn
Icon=~/.local/share/icons/local-learn.png
Terminal=false
Type=Application
Categories=Education;
EOL

echo "Local Learn has been installed."
