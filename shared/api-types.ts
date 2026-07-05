export type ContactFormPayload = {
	name: string;
	email: string;
	phone: string;
	vehicle?: string;
	message: string;
	/** Public URLs returned by the upload worker */
	photos?: string[];
};

export type ContactFormResponse = {
	ok: boolean;
	message: string;
};

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
	ok: boolean;
	appointmentId?: string;
	message: string;
};

export type ApiError = {
	ok: false;
	error: string;
};
