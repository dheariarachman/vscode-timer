import { Database } from 'sqlite3';
import { sendDailySummary } from './email';

export function scheduleDailySummary(db: Database) {
	const now = new Date();
	const millisTillMidnight =
		new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 1,
			0,
			0,
			0,
			0
		).getTime() - now.getTime();

	setTimeout(() => {
		sendDailySummary(db);
		scheduleDailySummary(db); // Reschedule for the next day
	}, millisTillMidnight);
}
