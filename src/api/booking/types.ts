export type { BookingFormValues } from '../../lib/schemas/booking-form';

export type BookingStep = 'date' | 'time' | 'details' | 'success';

export type BookingSlot = {
	start: string;
	end: string;
	available: boolean;
};

export type BookingAppointmentPayload = {
	date: string;
	slotStart: string;
	name: string;
	email: string;
	phone: string;
	vehicle?: string;
	notes?: string;
};

export type BookingAppointmentResponse = {
	success: boolean;
	appointmentId?: string;
	message: string;
};
