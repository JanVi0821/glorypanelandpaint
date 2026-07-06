import { api } from '../client';
import type { ContactUploadResponse } from './types';

export async function uploadContactFile(file: File): Promise<string> {
	const form = new FormData();
	form.append('file', file);

	const data = await api.postForm<ContactUploadResponse>('/upload', form);
	return data.url;
}
