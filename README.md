# Local Learn

Local Learn is a desktop application that allows you to watch your local course files in a Udemy-like interface.

## Features

*   **Udemy-like Interface**: A modern and intuitive interface for browsing and watching your courses.
*   **Catppuccin Mocha Theme**: A beautiful and easy-on-the-eyes dark theme.
*   **Folder Picker**: Easily select your course directory.
*   **Video Player**: A full-featured video player with subtitle support.
*   **Picture-in-Picture**: Watch videos in a floating window.
*   **Progress Tracking**: The application remembers which videos you've watched and where you left off.
*   **Notes Section**: Take and save notes for each video.

## Getting Started

### For End Users

1.  Download the latest release for your operating system from the [releases page](https://github.com/AdityaHebballe/Local-Learn/releases).
2.  Run the installer or executable.

### For Developers

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/AdityaHebballe/Local-Learn.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the application in development mode**:
    ```bash
    npm start
    ```

## Building the Application

To build the application for your current platform, run:

```bash
npm run build
```

This will create a distributable file in the `dist` directory.

## Linux Installation

For a better experience on Linux, you can use the provided `install.sh` and `uninstall.sh` scripts.

### Installation

To install "Local Learn" on Linux, you can run the following commands in your terminal:

```bash
git clone https://github.com/AdityaHebballe/Local-Learn.git
cd Local-Learn
npm install
npm run build
./install.sh
```

### Uninstallation

To uninstall the application, run:

```bash
./uninstall.sh
```
