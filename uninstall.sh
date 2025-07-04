#!/bin/bash

# Remove the AppImage
rm -f ~/.local/bin/local-learn

# Remove the .desktop file
rm -f ~/.local/share/applications/local-learn.desktop

# Remove the icon
rm -f ~/.local/share/icons/local-learn.png

echo "Local Learn has been uninstalled."
