import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface TimeRecord {
	id: number;
	project_name: string;
	start_time: string;
	end_time: string;
	git_commit_hash?: string;
	git_commit_message?: string;
}

let timeRecords: TimeRecord[] = [];
let lastId = 0;
let timer: NodeJS.Timeout | undefined;
let startTime: number | undefined;
let currentFolder: vscode.WorkspaceFolder | undefined;
let statusBarItem: vscode.StatusBarItem;
let dataPath: string;

export async function activate(context: vscode.ExtensionContext) {
	try {
		// Setup data file path
		dataPath = path.join(context.globalStorageUri.fsPath, 'time_records.json');
		const dataDir = path.dirname(dataPath);

		// Create the directory if it doesn't exist
		fs.mkdirSync(dataDir, { recursive: true });

		// Load existing data
		loadTimeRecords();

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
			vscode.commands.registerCommand('extension.showTracking', showTracking),
			vscode.commands.registerCommand(
				'extension.showActiveTimers',
				showActiveTimers
			),
			vscode.commands.registerCommand(
				'extension.showDailySummary',
				showDailySummary
			)
		);

		// Event listener for workspace folder changes
		vscode.workspace.onDidChangeWorkspaceFolders(handleWorkspaceChange);

		// Save data on relevant events
		context.subscriptions.push(
			vscode.workspace.onDidChangeWorkspaceFolders(() => saveTimeRecords()),
			vscode.window.onDidChangeWindowState(() => saveTimeRecords())
		);

		// Register deactivation handler
		context.subscriptions.push({
			dispose: () => {
				if (timer) {
					stopTracking();
				}
				saveTimeRecords();
			},
		});

		// Start tracking the current folder
		startTracking();
	} catch (error: unknown) {
		console.error('Error during activation:', error);
		vscode.window.showErrorMessage(
			`Failed to activate extension: ${
				error instanceof Error ? error.message : 'Unknown error'
			}`
		);
	}
}

export function deactivate() {
	// Stop any active timer and save records
	if (timer) {
		stopTracking();
	}
	saveTimeRecords();
}

function loadTimeRecords() {
	try {
		if (fs.existsSync(dataPath)) {
			const data = fs.readFileSync(dataPath, 'utf8');
			const parsed = JSON.parse(data);
			timeRecords = parsed.records;
			lastId = parsed.lastId;
		} else {
			timeRecords = [];
			lastId = 0;
		}
	} catch (err) {
		console.error('Error loading time records:', err);
		timeRecords = [];
		lastId = 0;
	}
}

function saveTimeRecords() {
	try {
		const data = JSON.stringify(
			{
				records: timeRecords,
				lastId: lastId,
			},
			null,
			2
		);
		fs.writeFileSync(dataPath, data);
	} catch (err) {
		console.error('Error saving time records:', err);
	}
}

function handleWorkspaceChange(event: vscode.WorkspaceFoldersChangeEvent) {
	stopTracking(); // Stop tracking the previous folder
	startTracking(); // Start tracking the new folder
}

function startTracking() {
	currentFolder = vscode.workspace.workspaceFolders?.[0];
	if (!currentFolder) {
		return;
	}

	startTime = Date.now();
	updateStatusBar('Tracking started...');
	timer = setInterval(updateTimerDisplay, 1000); // Update status bar every second
}

async function stopTracking() {
	if (timer) {
		clearInterval(timer);
		timer = undefined;
	}
	if (currentFolder && startTime) {
		const endTime = Date.now();

		// Get git information
		const gitInfo = await getGitInfo(currentFolder);

		// Add new record
		lastId++;
		timeRecords.push({
			id: lastId,
			project_name: currentFolder.name,
			start_time: new Date(startTime).toISOString(),
			end_time: new Date(endTime).toISOString(),
			git_commit_hash: gitInfo.hash,
			git_commit_message: gitInfo.message,
		});

		saveTimeRecords();
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

async function showActiveTimers() {
	if (!currentFolder || !startTime) {
		vscode.window.showInformationMessage('No active timer tracking sessions.');
		return;
	}

	const elapsed = Math.floor((Date.now() - startTime) / 1000);

	// Create a detailed message for the information window
	const details = new vscode.MarkdownString();
	details.appendMarkdown(`## Active Timer Details\n\n`);
	details.appendMarkdown(`**Project:** ${currentFolder.name}\n\n`);
	details.appendMarkdown(
		`**Started:** ${new Date(startTime).toLocaleString()}\n\n`
	);
	details.appendMarkdown(`**Duration:** ${formatTime(elapsed)}\n\n`);

	// Show the details in a message
	const panel = vscode.window.createWebviewPanel(
		'timerDetails',
		'Active Timer Details',
		vscode.ViewColumn.One,
		{
			enableScripts: false,
		}
	);

	panel.webview.html = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body { padding: 20px; }
                    .timer-details { font-family: var(--vscode-font-family); }
                    .timer-value { font-size: 2em; margin: 10px 0; }
                    .project-name { color: var(--vscode-textLink-foreground); }
                </style>
            </head>
            <body>
                <div class="timer-details">
                    <h2>Active Timer Details</h2>
                    <p><strong>Project:</strong> <span class="project-name">${
											currentFolder.name
										}</span></p>
                    <p><strong>Started:</strong> ${new Date(
											startTime
										).toLocaleString()}</p>
                    <div class="timer-value">${formatTime(elapsed)}</div>
                </div>
            </body>
        </html>
    `;
}

async function showDailySummary() {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		// Filter records for today
		const todayRecords = timeRecords.filter((record) => {
			const recordDate = new Date(record.start_time);
			return recordDate >= today && recordDate < tomorrow;
		});

		if (todayRecords.length === 0) {
			vscode.window.showInformationMessage('No time records found for today');
			return;
		}

		// Calculate total time per project
		const projectTotals = new Map<string, number>();
		let totalTimeForDay = 0;

		todayRecords.forEach((record) => {
			const startTime = new Date(record.start_time).getTime();
			const endTime = new Date(record.end_time).getTime();
			const duration = Math.floor((endTime - startTime) / 1000);

			totalTimeForDay += duration;
			const current = projectTotals.get(record.project_name) || 0;
			projectTotals.set(record.project_name, current + duration);
		});

		// Create panel and show summary
		const panel = vscode.window.createWebviewPanel(
			'dailySummary',
			'Daily Time Tracking Summary',
			vscode.ViewColumn.One,
			{
				enableScripts: false,
			}
		);

		// Generate HTML content
		let htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body {
                            padding: 30px;
                            font-family: var(--vscode-font-family);
                            color: var(--vscode-foreground);
                            line-height: 1.6;
                        }
                        .container {
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .summary-title {
                            margin-bottom: 30px;
                            padding-bottom: 10px;
                            border-bottom: 2px solid var(--vscode-textSeparator-foreground);
                            color: var(--vscode-titleBar-activeBackground);
                        }
                        .summary-section {
                            margin-bottom: 40px;
                            background: var(--vscode-editor-background);
                            padding: 20px;
                            border-radius: 6px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .section-title {
                            font-size: 1.2em;
                            color: var(--vscode-titleBar-activeForeground);
                            margin-bottom: 15px;
                        }
                        .project-card {
                            background: var(--vscode-list-activeSelectionBackground);
                            margin: 10px 0;
                            padding: 15px;
                            border-radius: 4px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .time-entry {
                            background: var(--vscode-list-hoverBackground);
                            margin: 10px 0;
                            padding: 15px;
                            border-radius: 4px;
                        }
                        .time-entry-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 10px;
                        }
                        .total-time {
                            font-size: 1.2em;
                            font-weight: bold;
                            text-align: center;
                            padding: 20px;
                            background: var(--vscode-button-background);
                            color: var(--vscode-button-foreground);
                            border-radius: 4px;
                            margin-top: 20px;
                        }
                        .project-name {
                            color: var(--vscode-textLink-foreground);
                            font-weight: bold;
                        }
                        .time-value {
                            color: var(--vscode-charts-blue);
                            font-weight: bold;
                        }
                        .git-hash {
                            color: var(--vscode-charts-purple);
                            font-weight: bold;
                        }
                        .git-message {
                            color: var(--vscode-charts-orange);
                            font-style: italic;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="summary-title">Time Tracking Summary - ${today.toLocaleDateString()}</h1>
                        
                        <div class="summary-section">
                            <h2 class="section-title">📊 Project Totals</h2>
                            ${Array.from(projectTotals.entries())
															.map(
																([project, seconds]) => `
                                    <div class="project-card">
                                        <span class="project-name">${project}</span>
                                        <span class="time-value">${formatTime(
																					seconds
																				)}</span>
                                    </div>
                                `
															)
															.join('')}
                            <div class="total-time">
                                Total Time Today: ${formatTime(totalTimeForDay)}
                            </div>
                        </div>

                        <div class="summary-section">
                            <h2 class="section-title">📝 Detailed Time Entries</h2>
                            ${todayRecords
															.map((record) => {
																const duration = Math.floor(
																	(new Date(record.end_time).getTime() -
																		new Date(record.start_time).getTime()) /
																		1000
																);
																return `
                                    <div class="time-entry">
                                        <div class="time-entry-grid">
                                            <div><strong>Project:</strong> <span class="project-name">${
																							record.project_name
																						}</span></div>
                                            <div><strong>Start:</strong> ${new Date(
																							record.start_time
																						).toLocaleTimeString()}</div>
                                            <div><strong>End:</strong> ${new Date(
																							record.end_time
																						).toLocaleTimeString()}</div>
                                            <div><strong>Duration:</strong> <span class="time-value">${formatTime(
																							duration
																						)}</span></div>
                                            ${
																							record.git_commit_hash
																								? `
                                                <div><strong>Commit:</strong> <span class="git-hash">${record.git_commit_hash.substring(
																									0,
																									7
																								)}</span></div>
                                            `
																								: ''
																						}
                                            ${
																							record.git_commit_message
																								? `
                                                <div><strong>Message:</strong> <span class="git-message">${record.git_commit_message}</span></div>
                                            `
																								: ''
																						}
                                        </div>
                                    </div>
                                `;
															})
															.join('')}
                        </div>
                    </div>
                </body>
            </html>
        `;

		panel.webview.html = htmlContent;
	} catch (error: unknown) {
		console.error('Error in showDailySummary:', error);
		vscode.window.showErrorMessage(
			`Failed to show daily summary: ${
				error instanceof Error ? error.message : 'Unknown error'
			}`
		);
	}
}

function updateTimerDisplay() {
	if (!startTime) {
		return;
	}

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

async function getGitInfo(
	workspaceFolder: vscode.WorkspaceFolder
): Promise<{ hash?: string; message?: string }> {
	try {
		const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
		if (!gitExtension) {
			return {};
		}

		const api = gitExtension.getAPI(1);
		const repo = api.repositories.find(
			(repo: any) => repo.rootUri.fsPath === workspaceFolder.uri.fsPath
		);

		if (!repo) {
			return {};
		}

		const head = repo.state.HEAD;
		return {
			hash: head?.commit,
			message: head?.message,
		};
	} catch (error) {
		console.error('Error getting git info:', error);
		return {};
	}
}
