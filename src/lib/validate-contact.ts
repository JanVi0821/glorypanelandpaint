import type { ContactFormErrors, ContactFormValues } from '../types/contact-form';

export type { ContactFormErrors, ContactFormValues } from '../types/contact-form';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+()-]{7,}$/;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const MAX_FILES = 8;
const MAX_BYTES = 10 * 1024 * 1024;

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
	const errors: ContactFormErrors = {};

	if (!values.name.trim()) errors.name = 'Please enter your name.';
	if (!values.phone.trim()) errors.phone = 'Please enter your phone number.';
	else if (!PHONE_RE.test(values.phone.trim())) errors.phone = 'Please enter a valid telephone number.';

	if (!values.email.trim()) errors.email = 'Please enter your email address.';
	else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.';

	if (!values.message.trim()) errors.message = 'Please tell us how we can help.';

	if (values.photos.length > MAX_FILES) {
		errors.photos = `You can upload up to ${MAX_FILES} photos.`;
	}

	for (const file of values.photos) {
		if (file.size > MAX_BYTES) {
			errors.photos = 'Each photo must be 10 MB or smaller.';
			break;
		}
		if (!ALLOWED_TYPES.has(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
			errors.photos = 'Photos must be JPG, PNG, HEIC or WebP.';
			break;
		}
	}

	return errors;
}

export function hasErrors(errors: ContactFormErrors) {
	return Object.keys(errors).length > 0;
}
