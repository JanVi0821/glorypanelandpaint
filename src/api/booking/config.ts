/** Insurance vehicle assessment — mirrors SSA service on the original WordPress site. */
export const BOOKING_CONFIG = {
	serviceName: 'Insurance Vehicle Assessment',
	durationMinutes: 30,
	timezone: 'Pacific/Auckland',
	maxAdvanceDays: 60,
	weekday: { openHour: 7, openMinute: 30, closeHour: 17, closeMinute: 0 },
	saturday: { openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 },
	notesPlaceholder: 'Please tell us your insurance company and claim number',
} as const;
