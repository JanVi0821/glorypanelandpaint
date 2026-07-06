export type { ContactFormValues } from '../../lib/schemas/contact-form';

export type ContactQuotePayload = {
	name: string;
	email: string;
	phone: string;
	vehicle?: string;
	message: string;
	/** Public URLs returned by the upload endpoint */
	photos?: string[];
};

export type ContactQuoteResponse = {
	success: boolean;
	message: string;
};

export type ContactUploadResponse = {
	success: boolean;
	message?: string;
	key: string;
	url: string;
};
