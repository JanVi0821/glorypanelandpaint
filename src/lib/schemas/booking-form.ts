import { z } from 'zod';
import { personEmailSchema, personNameSchema, personPhoneSchema } from './person-fields';

export const bookingFormSchema = z.object({
	name: personNameSchema,
	phone: personPhoneSchema,
	email: personEmailSchema,
	vehicle: z.string(),
	notes: z.string(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
