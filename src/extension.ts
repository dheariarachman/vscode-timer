import * as vscode from 'vscode';
import { Database } from 'sqlite3';

let db: Database;
let timer: NodeJS.Timeout | undefined;
let startTime: number | undefined;
let currentFolder: vscode.WorkspaceFolder | undefined;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	// Initialize SQLite database
	db = new Database(context.globalStorageUri.fsPath + '/time_tracking.db');
	db.serialize(() => {
		db.run(`
            CREATE TABLE IF NOT EXISTS time_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_name TEXT,
                start_time TEXT,
                end_time TEXT
            )
        `);
	});

	// Create status bar item
	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100
	);
	statusBarItem.command = 'extension.showTracking';
	context.subscriptions.push(statusBarItem);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.startTimer', startTimer),
		vscode.commands.registerCommand('extension.stopTimer', stopTimer),
		vscode.commands.registerCommand('extension.showTracking', showTracking)
	);

	// Event listener for workspace folder changes
	vscode.workspace.onDidChangeWorkspaceFolders(handleWorkspaceChange);

	// Start tracking the current folder
	startTracking();
}

function handleWorkspaceChange(event: vscode.WorkspaceFoldersChangeEvent) {
	stopTracking(); // Stop tracking the previous folder
	startTracking(); // Start tracking the new folder
}

function startTracking() {
	currentFolder = vscode.workspace.workspaceFolders?.[0];
	if (!currentFolder) return;

	startTime = Date.now();
	updateStatusBar('Tracking started...');
	timer = setInterval(updateTimerDisplay, 1000); // Update status bar every second
}

function stopTracking() {
	if (timer) {
		clearInterval(timer);
		timer = undefined;
	}
	if (currentFolder && startTime) {
		const endTime = Date.now();

		db.run(
			`
            INSERT INTO time_records (project_name, start_time, end_time) 
            VALUES (?, ?, ?)`,
			[
				currentFolder.name,
				new Date(startTime).toISOString(),
				new Date(endTime).toISOString(),
			]
		);

		vscode.window.showInformationMessage(
			`Stopped tracking ${currentFolder.name}.`
		);
	}
	updateStatusBar('No active timer');
}

function startTimer() {
	if (timer) {
		vscode.window.showWarningMessage('Timer is already running.');
		return;
	}
	startTracking();
	vscode.window.showInformationMessage('Timer manually started.');
}

function stopTimer() {
	if (!timer) {
		vscode.window.showWarningMessage('No active timer to stop.');
		return;
	}
	stopTracking();
	vscode.window.showInformationMessage('Timer manually stopped.');
}

function showTracking() {
	if (!currentFolder || !startTime) {
		vscode.window.showInformationMessage('No active tracking session.');
		return;
	}

	const elapsed = Math.floor((Date.now() - startTime) / 1000);
	vscode.window.showInformationMessage(
		`Tracking ${currentFolder.name}: ${formatTime(elapsed)}`
	);
}

function updateTimerDisplay() {
	if (!startTime) return;

	const elapsed = Math.floor((Date.now() - startTime) / 1000);
	updateStatusBar(`${currentFolder?.name}: ${formatTime(elapsed)}`);
}

function updateStatusBar(message: string) {
	statusBarItem.text = `$(clock) ${message}`;
	statusBarItem.show();
}

function formatTime(seconds: number): string {
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	const hrsStr = hrs > 0 ? `${hrs}h ` : '';
	const minsStr = mins > 0 ? `${mins}m ` : '';
	const secsStr = `${secs}s`;

	return `${hrsStr}${minsStr}${secsStr}`;
}
