const UPLOAD_API = 'https://glorypanelandpaint-upload.jan-wei0821.workers.dev/upload';

type UploadResponse = {
	url: string;
};

export async function uploadFile(file: File): Promise<string> {
	const form = new FormData();
	form.append('file', file);

	const res = await fetch(UPLOAD_API, {
		method: 'POST',
		body: form,
	});

	const data = (await res.json()) as UploadResponse | { error?: string };

	if (!res.ok || !('url' in data) || !data.url) {
		throw new Error('error' in data && data.error ? data.error : 'Upload failed');
	}

	return data.url;
}
