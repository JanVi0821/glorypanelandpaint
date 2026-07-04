import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ContactFormErrors, ContactFormValues } from '../../types/contact-form';

interface Props {
	quotesEmail: string;
}

const emptyValues: ContactFormValues = {
	name: '',
	phone: '',
	email: '',
	vehicle: '',
	message: '',
	photos: [],
};

export default function ContactForm({ quotesEmail }: Props) {
	const [values, setValues] = useState<ContactFormValues>(emptyValues);
	const [errors, setErrors] = useState<ContactFormErrors>({});
	const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
	const [successMessage, setSuccessMessage] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const update = (field: keyof ContactFormValues, value: string) => {
		setValues((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[field];
			delete next.form;
			return next;
		});
	};

	const addPhotos = (files: FileList | null) => {
		if (!files?.length) return;
		setValues((prev) => ({
			...prev,
			photos: [...prev.photos, ...Array.from(files)].slice(0, 8),
		}));
		setErrors((prev) => {
			const next = { ...prev };
			delete next.photos;
			return next;
		});
	};

	const removePhoto = (index: number) => {
		setValues((prev) => ({
			...prev,
			photos: prev.photos.filter((_, i) => i !== index),
		}));
	};

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (status === 'submitting') return;

		const { validateContactForm, hasErrors } = await import('../../lib/validate-contact');
		const nextErrors = validateContactForm(values);
		if (hasErrors(nextErrors)) {
			setErrors(nextErrors);
			return;
		}

		setStatus('submitting');
		setErrors({});

		try {
			const { submitContactForm } = await import('../../lib/submit-contact');
			const result = await submitContactForm(values);
			setSuccessMessage(result.message);
			setStatus('success');
			setValues(emptyValues);
			if (fileInputRef.current) fileInputRef.current.value = '';
		} catch {
			setErrors({ form: 'Something went wrong. Please try again or email us directly.' });
			setStatus('idle');
		}
	};

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

	return (
		<form className="glory-form" onSubmit={onSubmit} noValidate aria-label="Quote request form">
			{errors.form && <div className="form-message form-message--error">{errors.form}</div>}

			<div className="field">
				<label htmlFor="contact-name">Your name</label>
				<input
					id="contact-name"
					type="text"
					name="name"
					autoComplete="name"
					placeholder="Jane Smith"
					value={values.name}
					onChange={(e) => update('name', e.target.value)}
					aria-invalid={!!errors.name}
				/>
				{errors.name && <div className="field-error">{errors.name}</div>}
			</div>

			<div className="field-row">
				<div className="field">
					<label htmlFor="contact-phone">Phone</label>
					<input
						id="contact-phone"
						type="tel"
						name="phone"
						autoComplete="tel"
						placeholder="021 123 4567"
						value={values.phone}
						onChange={(e) => update('phone', e.target.value)}
						aria-invalid={!!errors.phone}
					/>
					{errors.phone && <div className="field-error">{errors.phone}</div>}
				</div>

				<div className="field">
					<label htmlFor="contact-email">Email</label>
					<input
						id="contact-email"
						type="email"
						name="email"
						autoComplete="email"
						placeholder="you@email.com"
						value={values.email}
						onChange={(e) => update('email', e.target.value)}
						aria-invalid={!!errors.email}
					/>
					{errors.email && <div className="field-error">{errors.email}</div>}
				</div>
			</div>

			<div className="field">
				<label htmlFor="contact-vehicle">Vehicle (make / model / rego)</label>
				<input
					id="contact-vehicle"
					type="text"
					name="vehicle"
					placeholder="Toyota Corolla, ABC123"
					value={values.vehicle}
					onChange={(e) => update('vehicle', e.target.value)}
				/>
			</div>

			<div className="field">
				<label htmlFor="contact-message">How can we help?</label>
				<textarea
					id="contact-message"
					name="message"
					placeholder="Tell us about the damage…"
					value={values.message}
					onChange={(e) => update('message', e.target.value)}
					aria-invalid={!!errors.message}
				/>
				{errors.message && <div className="field-error">{errors.message}</div>}
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
						name="photos"
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
						{values.photos.length} of 8
					</span>
				</div>
				{errors.photos && <div className="field-error">{errors.photos}</div>}
				{values.photos.length > 0 && (
					<ul className="glory-upload__list">
						{values.photos.map((file, i) => (
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
				<button type="submit" className="glory-btn-gold" disabled={status === 'submitting'}>
					{status === 'submitting' ? 'Sending…' : 'Submit'}
				</button>
			</div>

			<p className="glory-form__fallback">
				Or email us directly at{' '}
				<a href={`mailto:${quotesEmail}`}>{quotesEmail}</a>
			</p>
		</form>
	);
}
