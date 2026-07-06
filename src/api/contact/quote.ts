import { api } from '../client';
import type { ContactFormValues } from '../../lib/schemas/contact-form';
import type { ContactQuotePayload, ContactQuoteResponse } from './types';

function toQuotePayload(values: ContactFormValues): ContactQuotePayload {
	return {
		name: values.name.trim(),
		phone: values.phone.trim(),
		email: values.email.trim(),
		vehicle: values.vehicle.trim() || undefined,
		message: values.message.trim(),
		photos: values.photos.length > 0 ? values.photos : undefined,
	};
}

export async function submitContactForm(
	values: ContactFormValues,
) {
	return api.post<ContactQuoteResponse>('/quote-request', toQuotePayload(values));
}
