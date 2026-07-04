import { generateSlots } from '../../../shared/booking-slots';
import type { BookingSlotsResponse, ApiError } from '../../../shared/api-types';

function jsonResponse(body: BookingSlotsResponse | ApiError, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const onRequestGet: PagesFunction = async (context) => {
	const date = context.url.searchParams.get('date');

	if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return jsonResponse({ ok: false, error: 'Query param "date" required (YYYY-MM-DD)' }, 400);
	}

	// TODO: subtract already-booked slots from calendar backend
	const slots = generateSlots(date);

	return jsonResponse({ date, slots }, 200);
};
