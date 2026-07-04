import { z } from 'zod';
import { personEmailSchema, personNameSchema, personPhoneSchema } from './person-fields';

const contactPhotoSchema = z
	.file()
	.max(10 * 1024 * 1024, 'Each photo must be 10 MB or smaller.')
	.mime(
		['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
		'Photos must be JPG, PNG, HEIC or WebP.',
	);

export const contactFormSchema = z.object({
	name: personNameSchema,
	phone: personPhoneSchema,
	email: personEmailSchema,
	vehicle: z.string(),
	message: z
		.string()
		.trim()
		.min(1, 'Please tell us how we can help.'),
	photos: z
		.array(contactPhotoSchema)
		.max(8, 'You can upload up to 8 photos.'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
