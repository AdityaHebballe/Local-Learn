#!/bin/bash

# Move the AppImage to ~/.local/bin
mkdir -p ~/.local/bin
mv "Local Learn-1.0.0.AppImage" ~/.local/bin/local-learn

# Create the .desktop file
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/local-learn.desktop << EOL
[Desktop Entry]
Name=Local Learn
Comment=Watch your local course files in a Udemy-like interface.
Exec=~/.local/bin/local-learn
Icon=$(realpath assets/icon.png)
Terminal=false
Type=Application
Categories=Education;
EOL

echo "Local Learn has been installed."
