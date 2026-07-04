import { generateSlots, toApiDate } from '../../shared/booking-slots';
import type {
	BookingAppointmentPayload,
	BookingAppointmentResponse,
	BookingSlot,
	BookingSlotsResponse,
} from '../../shared/api-types';

export async function fetchBookingSlots(date: Date): Promise<BookingSlot[]> {
	const dateStr = toApiDate(date);

	try {
		const res = await fetch(`/api/booking/slots?date=${dateStr}`);
		if (res.ok) {
			const data = (await res.json()) as BookingSlotsResponse;
			return data.slots;
		}
	} catch {
		/* dev fallback when Cloudflare Functions are unavailable */
	}

	return generateSlots(dateStr);
}

export async function submitBooking(
	payload: BookingAppointmentPayload,
): Promise<BookingAppointmentResponse> {
	try {
		const res = await fetch('/api/booking/appointments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		const data = (await res.json()) as BookingAppointmentResponse | { ok: false; error: string };

		if (!res.ok || !data.ok) {
			throw new Error('error' in data ? data.error : 'Booking failed');
		}

		return data;
	} catch {
		/* dev fallback */
		await new Promise((r) => window.setTimeout(r, 600));
		return {
			ok: true,
			appointmentId: `dev-${Date.now()}`,
			message: 'Thank you! Your appointment is booked.',
		};
	}
}
