import type { ContactFormPayload, ContactFormResponse, ApiError } from '../../shared/api-types';

type Env = {
	BREVO_API_KEY?: string;
	CONTACT_TO_EMAIL?: string;
};

function jsonResponse(body: ContactFormResponse | ApiError, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

function validatePayload(data: unknown): ContactFormPayload | null {
	if (!data || typeof data !== 'object') return null;
	const p = data as Record<string, unknown>;
	if (
		typeof p.name !== 'string' ||
		typeof p.email !== 'string' ||
		typeof p.phone !== 'string' ||
		typeof p.message !== 'string'
	) {
		return null;
	}
	if (!p.name.trim() || !p.email.trim() || !p.phone.trim() || !p.message.trim()) {
		return null;
	}
	return {
		name: p.name.trim(),
		email: p.email.trim(),
		phone: p.phone.trim(),
		vehicle: typeof p.vehicle === 'string' ? p.vehicle.trim() : undefined,
		message: p.message.trim(),
		photos: Array.isArray(p.photos) ? (p.photos as string[]) : undefined,
	};
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const payload = validatePayload(await context.request.json().catch(() => null));
	if (!payload) {
		return jsonResponse({ ok: false, error: 'Invalid form data' }, 400);
	}

	// TODO: Send via Brevo SMTP API using context.env.BREVO_API_KEY
	// TODO: Store uploaded photos in R2 (context.env.PHOTOS_BUCKET)
	// TODO: Send auto-reply to customer email

	const toEmail = context.env.CONTACT_TO_EMAIL ?? 'quotes@glorypanelandpaint.co.nz';

	console.log('[api/contact] submission received', {
		to: toEmail,
		name: payload.name,
		email: payload.email,
	});

	return jsonResponse(
		{
			ok: true,
			message: 'Thank you — your quote request has been received. We will be in touch shortly.',
		},
		202,
	);
};

export const onRequestOptions: PagesFunction = async () => {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	});
};
