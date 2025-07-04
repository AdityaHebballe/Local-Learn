#!/bin/bash

# Move the AppImage to ~/.local/bin
mkdir -p ~/.local/bin
mv "dist/Local Learn-1.0.0.AppImage" ~/.local/bin/local-learn

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
