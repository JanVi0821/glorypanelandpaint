export type BookingStep = 'date' | 'time' | 'details' | 'success';

export type BookingFormValues = {
	name: string;
	email: string;
	phone: string;
	vehicle: string;
	notes: string;
};

export type BookingFormErrors = Partial<Record<keyof BookingFormValues | 'form' | 'slot', string>>;
