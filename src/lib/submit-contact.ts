import type { ContactFormPayload, ContactFormResponse } from '../types/api';
import type { ContactFormValues } from '../types/contact-form';

/**
 * Submit handler stub — UI-only for now.
 * Wire to POST /api/contact when the Cloudflare Function + Brevo are ready.
 */
export async function submitContactForm(
	values: ContactFormValues,
): Promise<ContactFormResponse> {
	const payload: ContactFormPayload = {
		name: values.name.trim(),
		phone: values.phone.trim(),
		email: values.email.trim(),
		vehicle: values.vehicle.trim() || undefined,
		message: values.message.trim(),
		photos: values.photos.length > 0 ? values.photos : undefined,
	};

	void payload;

	await new Promise((resolve) => window.setTimeout(resolve, 500));

	return {
		ok: true,
		message:
			'Thank you — your quote request has been received. We will be in touch shortly.',
	};
}
