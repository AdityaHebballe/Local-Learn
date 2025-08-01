#!/bin/bash

# Get the latest release URL
LATEST_RELEASE_URL=$(curl -s https://api.github.com/repos/AdityaHebballe/Local-Learn/releases/latest | grep "browser_download_url.*AppImage" | cut -d : -f 2,3 | tr -d \")

# Download the AppImage
curl -L -o "Local Learn.AppImage" $LATEST_RELEASE_URL
chmod +x "Local Learn.AppImage"

# Move the AppImage to ~/.local/bin
mkdir -p ~/.local/bin
mv "Local Learn.AppImage" ~/.local/bin/local-learn

# Download the icon
curl -L -o ~/.local/share/icons/local-learn.png https://raw.githubusercontent.com/AdityaHebballe/Local-Learn/main/assets/icon.png

# Create the .desktop file
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/local-learn.desktop << EOL
[Desktop Entry]
Name=Local Learn
Comment=Watch your local course files in a Udemy-like interface.
Exec=$HOME/.local/bin/local-learn
Icon=$HOME/.local/share/icons/local-learn.png
Terminal=false
Type=Application
Categories=Education;
EOL

echo "Local Learn has been installed."
