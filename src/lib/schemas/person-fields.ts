import { z } from 'zod';

export const personNameSchema = z
	.string()
	.trim()
	.min(1, 'Please enter your name.');

export const personPhoneSchema = z
	.string()
	.trim()
	.min(1, 'Please enter your phone number.')
	.min(7, 'Please enter a valid telephone number.');

export const personEmailSchema = z
	.string()
	.trim()
	.min(1, 'Please enter your email address.')
	.pipe(z.email('Please enter a valid email address.'));
