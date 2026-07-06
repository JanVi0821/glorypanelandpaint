import { ApiClientError, api } from '../client';
import { generateSlots, toApiDate } from './slots';
import type { BookingAppointmentPayload, BookingAppointmentResponse, BookingSlot } from './types';

export async function fetchBookingSlots(date: Date): Promise<BookingSlot[]> {
	const dateStr = toApiDate(date);
	return generateSlots(dateStr);
}

export async function submitBooking(
	payload: BookingAppointmentPayload,
) {
	return await api.post<BookingAppointmentResponse>('/booking', payload);
}
