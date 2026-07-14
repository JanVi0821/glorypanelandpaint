import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	contactFormSchema,
	validateContactPhoto,
	type ContactFormValues,
} from '../../lib/schemas/contact-form';
import { submitContactForm, uploadContactFile } from '../../api/contact';
import { Button } from '@/components/ui/button';

interface Props {
	quotesEmail: string;
}

type PhotoUpload = {
	id: string;
	name: string;
	status: 'uploading' | 'done' | 'error';
	url?: string;
	error?: string;
};

const defaultValues: ContactFormValues = {
	name: '',
	phone: '',
	email: '',
	vehicle: '',
	message: '',
	photos: [],
};

function syncPhotoUrls(
	uploads: PhotoUpload[],
	setValue: ReturnType<typeof useForm<ContactFormValues>>['setValue'],
) {
	const urls = uploads
		.filter((item): item is PhotoUpload & { url: string } => item.status === 'done' && !!item.url)
		.map((item) => item.url);
	setValue('photos', urls, { shouldValidate: true });
}

export default function ContactForm({ quotesEmail }: Props) {
	const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
	const [successMessage, setSuccessMessage] = useState('');
	const [uploads, setUploads] = useState<PhotoUpload[]>([]);
	const [fileError, setFileError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactFormSchema),
		defaultValues,
	});

	const startUpload = (file: File) => {
		const id = crypto.randomUUID();
		setUploads((prev) => [...prev, { id, name: file.name, status: 'uploading' }]);

		uploadContactFile(file)
			.then((url) => {
				setUploads((prev) => {
					const next = prev.map((item) =>
						item.id === id ? { ...item, status: 'done' as const, url } : item,
					);
					syncPhotoUrls(next, setValue);
					return next;
				});
				window.posthog?.capture("quote_photo_uploaded");
			})
			.catch((err) => {
				setUploads((prev) =>
					prev.map((item) =>
						item.id === id
							? { ...item, status: 'error' as const, error: 'Upload failed' }
							: item,
					),
				);
				window.posthog?.captureException(err);
			});
	};

	const addPhotos = (files: FileList | null) => {
		if (!files?.length) return;

		const remaining = 8 - uploads.length;
		if (remaining <= 0) {
			setFileError('You can upload up to 8 photos.');
			return;
		}

		const toAdd = Array.from(files).slice(0, remaining);
		setFileError(null);
		clearErrors('photos');

		for (const file of toAdd) {
			const validationError = validateContactPhoto(file);
			if (validationError) {
				setFileError(validationError);
				continue;
			}
			startUpload(file);
		}
	};

	const removePhoto = (id: string) => {
		setUploads((prev) => {
			const next = prev.filter((item) => item.id !== id);
			syncPhotoUrls(next, setValue);
			return next;
		});
		setFileError(null);
	};

	const onSubmit = handleSubmit(async (values) => {
		if (uploads.some((item) => item.status === 'uploading')) {
			setError('root', { message: 'Please wait for photos to finish uploading.' });
			return;
		}

		setStatus('submitting');
		clearErrors('root');

		try {
			const result = await submitContactForm(values);
			setSuccessMessage(result.message);
			setStatus('success');
			reset(defaultValues);
			setUploads([]);
			if (fileInputRef.current) fileInputRef.current.value = '';
			window.posthog?.capture("quote_request_submitted", {
				has_vehicle: !!values.vehicle.trim(),
				photo_count: values.photos.length,
			});
		} catch (err) {
			setError('root', {
				message: 'Something went wrong. Please try again or email us directly.',
			});
			setStatus('idle');
			window.posthog?.captureException(err);
		}
	});

	if (status === 'success') {
		return (
			<div className="glory-form" aria-live="polite">
				<div className="form-message form-message--success">{successMessage}</div>
				<button
					type="button"
					className="glory-btn-outline"
					style={{ marginTop: '16px' }}
					onClick={() => setStatus('idle')}
				>
					Send another request
				</button>
			</div>
		);
	}

	const hasUploading = uploads.some((item) => item.status === 'uploading');
	const submitting = status === 'submitting' || isSubmitting;

	return (
		<form className="glory-form" onSubmit={onSubmit} noValidate aria-label="Quote request form">
			{errors.root && <div className="form-message form-message--error">{errors.root.message}</div>}

			<div className="field">
				<label htmlFor="contact-name">Your name</label>
				<input
					id="contact-name"
					type="text"
					autoComplete="name"
					placeholder="Jane Smith"
					aria-invalid={!!errors.name}
					{...register('name')}
				/>
				{errors.name && <div className="field-error">{errors.name.message}</div>}
			</div>

			<div className="field-row">
				<div className="field">
					<label htmlFor="contact-phone">Phone</label>
					<input
						id="contact-phone"
						type="tel"
						autoComplete="tel"
						placeholder="021 123 4567"
						aria-invalid={!!errors.phone}
						{...register('phone')}
					/>
					{errors.phone && <div className="field-error">{errors.phone.message}</div>}
				</div>

				<div className="field">
					<label htmlFor="contact-email">Email</label>
					<input
						id="contact-email"
						type="email"
						autoComplete="email"
						placeholder="you@email.com"
						aria-invalid={!!errors.email}
						{...register('email')}
					/>
					{errors.email && <div className="field-error">{errors.email.message}</div>}
				</div>
			</div>

			<div className="field">
				<label htmlFor="contact-vehicle">Vehicle (make / model / rego)</label>
				<input
					id="contact-vehicle"
					type="text"
					placeholder="Toyota Corolla, ABC123"
					{...register('vehicle')}
				/>
			</div>

			<div className="field">
				<label htmlFor="contact-message">How can we help?</label>
				<textarea
					id="contact-message"
					placeholder="Tell us about the damage…"
					aria-invalid={!!errors.message}
					{...register('message')}
				/>
				{errors.message && <div className="field-error">{errors.message.message}</div>}
			</div>

			<div className="field">
				<label htmlFor="contact-photos">Upload damage photos (optional)</label>
				<div
					className="glory-upload"
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						e.preventDefault();
						addPhotos(e.dataTransfer.files);
					}}
				>
					<input
						ref={fileInputRef}
						id="contact-photos"
						type="file"
						accept="image/jpg,image/jpeg,image/png,image/webp,image/heic,image/heif,.heic"
						multiple
						onChange={(e) => {
							addPhotos(e.target.files);
							e.target.value = '';
						}}
					/>
					<div className="glory-upload__inner">
						<p className="glory-upload__title">Drag &amp; Drop Files Here</p>
						<span className="glory-upload__or">or</span>
						<button
							type="button"
							className="glory-upload__browse"
							onClick={() => fileInputRef.current?.click()}
						>
							Browse Files
						</button>
					</div>
					<span className="glory-upload__count" aria-live="polite">
						{uploads.length} of 8
					</span>
				</div>
				{(fileError || errors.photos) && (
					<div className="field-error">{fileError ?? errors.photos?.message}</div>
				)}
				{uploads.length > 0 && (
					<ul className="glory-upload__list">
						{uploads.map((item) => (
							<li
								key={item.id}
								className={
									item.status === 'uploading'
										? 'glory-upload__list-item--uploading'
										: item.status === 'error'
											? 'glory-upload__list-item--error'
											: undefined
								}
							>
								<span>
									{item.name}
									{item.status === 'uploading' && (
										<span className="glory-upload__status"> — Uploading…</span>
									)}
									{item.status === 'done' && (
										<span className="glory-upload__status glory-upload__status--done"> — Uploaded</span>
									)}
									{item.status === 'error' && (
										<span className="glory-upload__status glory-upload__status--error">
											{' '}
											— {item.error}
										</span>
									)}
								</span>
								<button
									type="button"
									onClick={() => removePhoto(item.id)}
									aria-label={`Remove ${item.name}`}
									disabled={item.status === 'uploading'}
								>
									&times;
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="field">
				<Button
					type="submit"
					variant="gold"
					size="xl"
					loading={submitting}
					disabled={hasUploading}
				>
					{hasUploading ? 'Waiting for uploads…' : 'Submit'}
				</Button>
			</div>

			<p className="glory-form__fallback">
				Or email us directly at{' '}
				<a href={`mailto:${quotesEmail}`}>{quotesEmail}</a>
			</p>
		</form>
	);
}
