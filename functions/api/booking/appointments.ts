import type {
	BookingAppointmentPayload,
	BookingAppointmentResponse,
	ApiError,
} from '../../../shared/api-types';

function jsonResponse(body: BookingAppointmentResponse | ApiError, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

function validatePayload(data: unknown): BookingAppointmentPayload | null {
	if (!data || typeof data !== 'object') return null;
	const p = data as Record<string, unknown>;
	if (
		typeof p.date !== 'string' ||
		typeof p.slotStart !== 'string' ||
		typeof p.name !== 'string' ||
		typeof p.email !== 'string' ||
		typeof p.phone !== 'string'
	) {
		return null;
	}
	return {
		date: p.date,
		slotStart: p.slotStart,
		name: p.name.trim(),
		email: p.email.trim(),
		phone: p.phone.trim(),
		vehicle: typeof p.vehicle === 'string' ? p.vehicle.trim() : undefined,
		notes: typeof p.notes === 'string' ? p.notes.trim() : undefined,
	};
}

export const onRequestPost: PagesFunction = async (context) => {
	const payload = validatePayload(await context.request.json().catch(() => null));
	if (!payload) {
		return jsonResponse({ ok: false, error: 'Invalid booking data' }, 400);
	}

	// TODO: Create calendar event + send confirmation emails via Brevo
	// TODO: Dedupe reschedule notifications (see glory-child/functions.php)

	console.log('[api/booking/appointments] booking received', {
		date: payload.date,
		slot: payload.slotStart,
		name: payload.name,
	});

	return jsonResponse(
		{
			ok: true,
			appointmentId: `stub-${Date.now()}`,
			message: 'Your assessment has been booked. A confirmation email is on its way.',
		},
		201,
	);
};
