import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	contactFormSchema,
	type ContactFormValues,
} from '../../lib/schemas/contact-form';

interface Props {
	quotesEmail: string;
}

const defaultValues: ContactFormValues = {
	name: '',
	phone: '',
	email: '',
	vehicle: '',
	message: '',
	photos: [],
};

export default function ContactForm({ quotesEmail }: Props) {
	const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
	const [successMessage, setSuccessMessage] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactFormSchema),
		defaultValues,
	});

	const photos = watch('photos');

	const addPhotos = (files: FileList | null) => {
		if (!files?.length) return;
		const next = [...photos, ...Array.from(files)].slice(0, 8);
		setValue('photos', next, { shouldValidate: true });
		clearErrors('photos');
	};

	const removePhoto = (index: number) => {
		const next = photos.filter((_, i) => i !== index);
		setValue('photos', next, { shouldValidate: true });
	};

	const onSubmit = handleSubmit(async (values) => {
		setStatus('submitting');
		clearErrors('root');

		try {
			const { submitContactForm } = await import('../../lib/submit-contact');
			const result = await submitContactForm(values);
			setSuccessMessage(result.message);
			setStatus('success');
			reset(defaultValues);
			if (fileInputRef.current) fileInputRef.current.value = '';
		} catch {
			setError('root', {
				message: 'Something went wrong. Please try again or email us directly.',
			});
			setStatus('idle');
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
						accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic"
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
						{photos.length} of 8
					</span>
				</div>
				{errors.photos && <div className="field-error">{errors.photos.message}</div>}
				{photos.length > 0 && (
					<ul className="glory-upload__list">
						{photos.map((file, i) => (
							<li key={`${file.name}-${file.size}-${i}`}>
								<span>{file.name}</span>
								<button type="button" onClick={() => removePhoto(i)} aria-label={`Remove ${file.name}`}>
									&times;
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="field">
				<button type="submit" className="glory-btn-gold" disabled={submitting}>
					{submitting ? 'Sending…' : 'Submit'}
				</button>
			</div>

			<p className="glory-form__fallback">
				Or email us directly at{' '}
				<a href={`mailto:${quotesEmail}`}>{quotesEmail}</a>
			</p>
		</form>
	);
}
