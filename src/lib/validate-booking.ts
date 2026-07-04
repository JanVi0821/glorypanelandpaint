import type { BookingFormErrors, BookingFormValues } from '../types/booking';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+()-]{7,}$/;

export function validateBookingForm(values: BookingFormValues): BookingFormErrors {
	const errors: BookingFormErrors = {};

	if (!values.name.trim()) errors.name = 'Please enter your name.';
	if (!values.phone.trim()) errors.phone = 'Please enter your phone number.';
	else if (!PHONE_RE.test(values.phone.trim())) errors.phone = 'Please enter a valid telephone number.';
	if (!values.email.trim()) errors.email = 'Please enter your email address.';
	else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.';

	return errors;
}

export function hasBookingErrors(errors: BookingFormErrors): boolean {
	return Object.keys(errors).length > 0;
}
