import { api } from "../client";
import { generateSlots } from "./slots";
import type {
  BookingAppointmentPayload,
  BookingAppointmentResponse,
  BookingCancelResponse,
  BookingEvent,
  BookingEventsResponse,
  BookingSlot,
} from "./types";

function eventOccupiesSlot(slot: BookingSlot, event: BookingEvent): boolean {
  if (event.start == null) return false;
  const eventEnd = event.end ?? event.start;
  return slot.start < eventEnd && slot.end > event.start;
}

function applyBookedEvents(
  slots: BookingSlot[],
  events: BookingEvent[],
): BookingSlot[] {
  return slots.map((slot) => ({
    ...slot,
    available:
      slot.available && !events.some((event) => eventOccupiesSlot(slot, event)),
  }));
}

export async function fetchBookingEvents(date: Date): Promise<BookingEvent[]> {
  const params = new URLSearchParams({ date: date.toISOString() });
  const resp = await api.get<BookingEventsResponse>(
    `/booking/getEvents?${params}`,
  );
  return resp.data ?? [];
}

export async function fetchBookingSlotsForDate(
  date: Date,
): Promise<BookingSlot[]> {
  const [slots, events] = await Promise.all([
    generateSlots(date),
    fetchBookingEvents(date).catch(() => [] as BookingEvent[]),
  ]);

  return applyBookedEvents(slots, events);
}

export async function submitBooking(payload: BookingAppointmentPayload) {
  return await api.post<BookingAppointmentResponse>("/booking", payload);
}

export async function cancelBooking(bookingId: string) {
  const params = new URLSearchParams({ booking_id: bookingId });
  return api.get<BookingCancelResponse>(`/booking/cancel?${params}`);
}
