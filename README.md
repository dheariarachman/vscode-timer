# Timer Tracking Extension for VS Code

A Visual Studio Code extension that helps you track your working hours on projects. This extension automatically starts and stops a timer when you switch between project folders, stores the tracking data in an SQLite database, and provides a daily summary via email. Additionally, it allows you to manually start/stop the timer and displays the tracking progress in the status bar.

## Features

- **Automatic Timer**: Automatically starts and stops tracking time when switching between project folders.
- **Manual Timer Control**: Start and stop the timer manually using commands.
- **Status Bar Integration**: Displays the current project's tracking time in the status bar.
- **SQLite Database**: Stores detailed time tracking records for each project.
- **Daily Email Summary**: Sends a daily summary of tracked time to your email.
- **Command Palette Support**: Use commands from the Command Palette to control the extension.

## Installation

1. **Download and Install**:

   - Package the extension using `vsce package` and install the `.vsix` file in VS Code.
   - Alternatively, download the prepackaged `.vsix` file from the [Releases](#) page (link to your GitHub releases).

2. **Setup Email Configuration**:

   - Update the email credentials in the extension's configuration (see below).

3. **Start Tracking**:
   - Open a project folder in VS Code, and the timer will automatically start tracking.

## Configuration

To send email summaries, you must configure your email credentials in the extension's settings:

1. Open the **Settings** in VS Code (`Ctrl+,` or `Cmd+,` on macOS).
2. Search for the `Timer Tracking` settings.
3. Provide the following details:
   - **Email Address**: The email address to send the summary from.
   - **Password**: The password for the email account.
   - **SMTP Server**: The SMTP server (e.g., `smtp.gmail.com`).
   - **Recipient Email**: The email address where the summary will be sent.

## Commands

Use the following commands from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- **Start Timer**: Manually start the timer.
- **Stop Timer**: Manually stop the timer.
- **Show Tracking**: Display the current project's tracking details.
- **Send Daily Summary**: Manually send the daily email summary.

## Status Bar

The status bar shows the current project's tracking progress, updating every second when the timer is active. Clicking on the status bar item opens the tracking details.

## Database

Time tracking data is saved in an SQLite database located in the extension's global storage path. Each entry includes:

- Project name
- Start time
- End time
- Duration

## Development

### Prerequisites

- Node.js
- VS Code Extension Manager (`vsce`)

### Running the Extension

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the extension in VS Code:
   - Open the project folder in VS Code.
   - Press `F5` to open a new VS Code window with the extension loaded.

### Packaging

To package the extension:

```bash
vsce package
```

This will create a `.vsix` file for installation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to contribute or open issues on [GitHub](#) (add your link here).

## Screenshots

### Status Bar

![Status Bar Screenshot](path/to/status-bar-screenshot.png)

### Tracking Summary

![Tracking Summary Screenshot](path/to/summary-screenshot.png)

## Contact

Created by [Your Name](mailto:your-email@example.com).
