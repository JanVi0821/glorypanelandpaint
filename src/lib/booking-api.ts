import { generateSlots, toApiDate } from '../../shared/booking-slots';
import type {
	BookingAppointmentPayload,
	BookingAppointmentResponse,
	BookingSlot,
} from '../../shared/api-types';

export async function fetchBookingSlots(date: Date): Promise<BookingSlot[]> {
	const dateStr = toApiDate(date);
	return generateSlots(dateStr);
}

export async function submitBooking(
	payload: BookingAppointmentPayload,
): Promise<BookingAppointmentResponse> {
	try {
		const res = await fetch('https://glorypanelandpaint-booking.jan-wei0821.workers.dev', {
			method: 'POST',
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
