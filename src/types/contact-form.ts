export type ContactFormValues = {
	name: string;
	phone: string;
	email: string;
	vehicle: string;
	message: string;
	photos: File[];
};

export type ContactFormErrors = Partial<Record<keyof ContactFormValues | 'form', string>>;
