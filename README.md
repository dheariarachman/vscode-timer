# Timer Tracking Extension for VS Code

A Visual Studio Code extension that helps you track your working hours on projects. This extension automatically starts and stops a timer when you switch between project folders, stores tracking data locally, and provides detailed daily summaries with Git integration.

## Features

- **Automatic Timer**: Automatically starts and stops tracking time when switching between project folders
- **Manual Timer Control**: Start and stop the timer manually using commands
- **Status Bar Integration**: Displays the current project's tracking time in the status bar
- **Git Integration**: Captures Git commit information with time records
- **Daily Summary**: View detailed daily summaries with project totals and Git commit details
- **Command Palette Support**: Use commands from the Command Palette to control the extension

## Installation

1. **Download and Install**:

   - Package the extension using `vsce package` and install the `.vsix` file in VS Code
   - Alternatively, download the prepackaged `.vsix` file from the [Releases](#) page

2. **Start Tracking**:
   - Open a project folder in VS Code, and the timer will automatically start tracking

## Commands

Use the following commands from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- **TaskTime: Start Timer** - Manually start the timer
- **TaskTime: Stop Timer** - Manually stop the timer
- **TaskTime: Show Current Tracking** - Display the current project's tracking details
- **TaskTime: Show Active Timers** - Show detailed view of active timing sessions
- **TaskTime: Show Daily Time Summary** - View a summary of today's tracked time

## Status Bar

The status bar shows the current project's tracking progress with:

- Project name
- Elapsed time (updated every second)
- Click to view current tracking details

## Time Records

Time tracking data is saved locally in JSON format and includes:

- Project name
- Start time
- End time
- Git commit hash (when available)
- Git commit message (when available)

## Development

### Prerequisites

- Node.js
- VS Code Extension Manager (`vsce`)

### Running the Extension

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the extension in VS Code:
   - Press `F5` to open a new window with the extension loaded
   - Use the Command Palette to try out the commands

### Publishing

To publish the extension:

1. Create a publisher account on [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. Get a Personal Access Token (PAT) from Azure DevOps
3. Login to vsce using your PAT:
   ```bash
   vsce login <publisher-name>
   ```
4. Set the publisher in package.json:
   ```json
   {
   	"publisher": "your-publisher-name"
   }
   ```
5. Publish the extension:
   ```bash
   vsce publish
   ```

### Packaging

To package the extension:

```bash
vsce package
```

This will create a `.vsix` file for installation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Repository

[GitHub Repository](https://github.com/dheariarachman/vscode-timer.git)
