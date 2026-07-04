import { clsx, type ClassValue } from 'clsx';

/** Minimal cn helper — swap to tailwind-merge when Tailwind is added. */
export function cn(...inputs: ClassValue[]): string {
	return clsx(inputs);
}
