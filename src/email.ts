import { Database } from 'sqlite3';
import * as nodemailer from 'nodemailer';

export function sendDailySummary(db: Database) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'your-email@gmail.com',
			pass: 'your-password',
		},
	});

	db.all(
		`
        SELECT project_name, SUM(CAST((julianday(end_time) - julianday(start_time)) * 24 * 60 * 60 AS INTEGER)) AS total_time
        FROM time_records
        WHERE date(start_time) = date('now')
        GROUP BY project_name
    `,
		(err, rows) => {
			if (err) {
				console.error(err);
				return;
			}

			const summary = rows
				.map((row: any) => `${row.project_name}: ${row.total_time} seconds`)
				.join('\n');

			const mailOptions = {
				from: 'your-email@gmail.com',
				to: 'recipient-email@gmail.com',
				subject: 'Daily Time Tracking Summary',
				text: summary,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.error(error);
				} else {
					console.log('Summary email sent: ' + info.response);
				}
			});
		}
	);
}
