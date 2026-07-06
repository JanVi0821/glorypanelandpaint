export const API_BASE_URL = 'https://glorypanelandpaint.jan-wei0821.workers.dev';

export class ApiClientError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = 'ApiClientError';
	}
}

type RequestOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	formData?: FormData;
	headers?: HeadersInit;
};

function resolveUrl(baseUrl: string, path: string): string {
	if (path.startsWith('http')) return path;
	const base = baseUrl.replace(/\/$/, '');
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${base}${normalized}`;
}

function getErrorMessage(data: unknown, fallback = 'request failed'): string {
	if (typeof data === 'object' && data !== null && 'message' in data) {
		const message = (data as { message?: unknown }).message;
		if (typeof message === 'string' && message.length > 0) return message;
	}
	return fallback;
}

function isBusinessFailure(data: unknown): boolean {
	return (
		typeof data === 'object'
		&& data !== null
		&& 'success' in data
		&& (data as { success: boolean }).success === false
	);
}

export class ApiClient {
	constructor(private readonly baseUrl: string = API_BASE_URL) {}

	async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
		const { method = 'GET', body, formData, headers } = options;

		const init: RequestInit = { method };

		if (formData) {
			init.body = formData;
			if (headers) init.headers = headers;
		} else if (body !== undefined) {
			init.headers = {
				'Content-Type': 'application/json',
				...(headers as Record<string, string> | undefined),
			};
			init.body = JSON.stringify(body);
		} else if (headers) {
			init.headers = headers;
		}

		const response = await fetch(resolveUrl(this.baseUrl, path), init);

		let data: T;
		try {
			data = (await response.json()) as T;
		} catch {
			throw new ApiClientError('request failed', response.status);
		}

		if (!response.ok || isBusinessFailure(data)) {
			throw new ApiClientError(getErrorMessage(data), response.status);
		}

		return data;
	}

	post<T>(path: string, body: unknown): Promise<T> {
		return this.request<T>(path, { method: 'POST', body });
	}

	postForm<T>(path: string, formData: FormData): Promise<T> {
		return this.request<T>(path, { method: 'POST', formData });
	}
}

export const api = new ApiClient();
