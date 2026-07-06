import { BOOKING_CONFIG } from './config';
import type { BookingSlot } from './types';

function pad(n: number): string {
	return String(n).padStart(2, '0');
}

function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

function parseDateString(dateStr: string): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
	const [y, m, d] = dateStr.split('-').map(Number);
	return new Date(y, m - 1, d);
}

/** Whether a calendar day can be selected (Mon–Sat, not in the past, within advance window). */
export function isBookableDate(date: Date, now = new Date()): boolean {
	const day = date.getDay();
	if (day === 0) return false;

	const today = startOfDay(now);
	const candidate = startOfDay(date);
	if (candidate < today) return false;

	const maxDate = addDays(today, BOOKING_CONFIG.maxAdvanceDays);
	if (candidate > maxDate) return false;

	return true;
}

/** Generate 30-minute assessment slots for a given YYYY-MM-DD date. */
export function generateSlots(dateStr: string, now = new Date()): BookingSlot[] {
	const date = parseDateString(dateStr);
	if (!date) return [];

	const day = date.getDay();
	if (day === 0) return [];

	const hours = day === 6 ? BOOKING_CONFIG.saturday : BOOKING_CONFIG.weekday;
	const slots: BookingSlot[] = [];

	let cursor = hours.openHour * 60 + hours.openMinute;
	const end = hours.closeHour * 60 + hours.closeMinute;

	while (cursor + BOOKING_CONFIG.durationMinutes <= end) {
		const startHour = Math.floor(cursor / 60);
		const startMin = cursor % 60;
		const endCursor = cursor + BOOKING_CONFIG.durationMinutes;
		const endHour = Math.floor(endCursor / 60);
		const endMin = endCursor % 60;

		const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMin);
		const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMin);

		slots.push({
			start: start.toISOString(),
			end: endTime.toISOString(),
			available: start > now,
		});

		cursor += BOOKING_CONFIG.durationMinutes;
	}

	return slots;
}

export function toApiDate(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatSlotLabel(iso: string): string {
	return new Date(iso).toLocaleTimeString('en-NZ', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
}

export function formatBookingDate(date: Date): string {
	return date.toLocaleDateString('en-NZ', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}
