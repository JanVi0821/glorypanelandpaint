import { useCallback, useEffect, useState } from 'react';
import { BOOKING_CONFIG } from '../../../shared/booking-config';
import {
	formatBookingDate,
	formatSlotLabel,
	isBookableDate,
	toApiDate,
} from '../../../shared/booking-slots';
import type { BookingSlot } from '../../../shared/api-types';
import { fetchBookingSlots, submitBooking } from '../../lib/booking-api';
import { hasBookingErrors, validateBookingForm } from '../../lib/validate-booking';
import type { BookingFormErrors, BookingFormValues, BookingStep } from '../../types/booking';
import { Calendar } from '../ui/calendar';
import '../ui/calendar.scss';

const emptyValues: BookingFormValues = {
	name: '',
	email: '',
	phone: '',
	vehicle: '',
	notes: '',
};

export default function BookingWidget() {
	const [step, setStep] = useState<BookingStep>('date');
	const [selectedDate, setSelectedDate] = useState<Date>();
	const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
	const [slots, setSlots] = useState<BookingSlot[]>([]);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [values, setValues] = useState<BookingFormValues>(emptyValues);
	const [errors, setErrors] = useState<BookingFormErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');

	const update = (field: keyof BookingFormValues, value: string) => {
		setValues((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[field];
			delete next.form;
			return next;
		});
	};

	const loadSlots = useCallback(async (date: Date) => {
		setLoadingSlots(true);
		setSelectedSlot(null);
		try {
			const next = await fetchBookingSlots(date);
			setSlots(next.filter((s) => s.available));
		} finally {
			setLoadingSlots(false);
		}
	}, []);

	useEffect(() => {
		if (step === 'time' && selectedDate) {
			void loadSlots(selectedDate);
		}
	}, [step, selectedDate, loadSlots]);

	const onDateSelect = (date: Date | undefined) => {
		if (!date || !isBookableDate(date)) return;
		setSelectedDate(date);
		setErrors((prev) => {
			const next = { ...prev };
			delete next.slot;
			return next;
		});
	};

	const goToTime = () => {
		if (!selectedDate) return;
		setStep('time');
	};

	const goToDetails = () => {
		if (!selectedSlot) {
			setErrors((prev) => ({ ...prev, slot: 'Please select a time.' }));
			return;
		}
		setStep('details');
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitting || !selectedDate || !selectedSlot) return;

		const nextErrors = validateBookingForm(values);
		if (hasBookingErrors(nextErrors)) {
			setErrors(nextErrors);
			return;
		}

		setSubmitting(true);
		setErrors({});

		try {
			const result = await submitBooking({
				date: toApiDate(selectedDate),
				slotStart: selectedSlot.start,
				name: values.name.trim(),
				email: values.email.trim(),
				phone: values.phone.trim(),
				vehicle: values.vehicle.trim() || undefined,
				notes: values.notes.trim() || undefined,
			});
			setSuccessMessage(result.message);
			setStep('success');
		} catch {
			setErrors({ form: 'Something went wrong. Please try again or call us.' });
		} finally {
			setSubmitting(false);
		}
	};

	const resetBooking = () => {
		setStep('date');
		setSelectedDate(undefined);
		setSelectedSlot(null);
		setSlots([]);
		setValues(emptyValues);
		setErrors({});
		setSuccessMessage('');
	};

	return (
		<div className="glory-booking">
			{step !== 'success' && (
				<header className="glory-booking__header">
					<h2 className="glory-booking__title">{BOOKING_CONFIG.serviceName}</h2>
					<p className="glory-booking__meta">{BOOKING_CONFIG.durationMinutes} min</p>
				</header>
			)}

			{step === 'date' && (
				<div className="glory-booking__panel">
					<p className="glory-booking__step-label">Select a date</p>
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={onDateSelect}
						disabled={(date) => !isBookableDate(date)}
						defaultMonth={selectedDate ?? new Date()}
					/>
					<div className="glory-booking__actions">
						<button
							type="button"
							className="glory-btn-gold"
							disabled={!selectedDate}
							onClick={goToTime}
						>
							Continue
						</button>
					</div>
				</div>
			)}

			{step === 'time' && selectedDate && (
				<div className="glory-booking__panel">
					<p className="glory-booking__step-label">{formatBookingDate(selectedDate)}</p>
					<button type="button" className="glory-booking__back" onClick={() => setStep('date')}>
						&larr; Change date
					</button>

					{loadingSlots ? (
						<p className="glory-booking__hint">Loading available times…</p>
					) : slots.length === 0 ? (
						<p className="glory-booking__hint">No times available on this day. Please choose another date.</p>
					) : (
						<div className="glory-booking__slots" role="listbox" aria-label="Available times">
							{slots.map((slot) => (
								<button
									key={slot.start}
									type="button"
									role="option"
									aria-selected={selectedSlot?.start === slot.start}
									className={`glory-booking__slot${selectedSlot?.start === slot.start ? ' is-selected' : ''}`}
									onClick={() => {
										setSelectedSlot(slot);
										setErrors((prev) => {
											const next = { ...prev };
											delete next.slot;
											return next;
										});
									}}
								>
									{formatSlotLabel(slot.start)}
								</button>
							))}
						</div>
					)}

					{errors.slot && <p className="glory-booking__error">{errors.slot}</p>}

					<div className="glory-booking__actions">
						<button
							type="button"
							className="glory-btn-gold"
							disabled={!selectedSlot || slots.length === 0}
							onClick={goToDetails}
						>
							Continue
						</button>
					</div>
				</div>
			)}

			{step === 'details' && selectedDate && selectedSlot && (
				<div className="glory-booking__panel">
					<p className="glory-booking__summary">
						{formatBookingDate(selectedDate)} &middot; {formatSlotLabel(selectedSlot.start)}
					</p>
					<button type="button" className="glory-booking__back" onClick={() => setStep('time')}>
						&larr; Change time
					</button>

					<form className="glory-booking__form" onSubmit={onSubmit} noValidate>
						{errors.form && <div className="glory-booking__form-error">{errors.form}</div>}

						<div className="field">
							<label htmlFor="booking-name">Your name</label>
							<input
								id="booking-name"
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
								<label htmlFor="booking-phone">Phone</label>
								<input
									id="booking-phone"
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
								<label htmlFor="booking-email">Email</label>
								<input
									id="booking-email"
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
							<label htmlFor="booking-vehicle">Vehicle (make / model / rego)</label>
							<input
								id="booking-vehicle"
								type="text"
								name="vehicle"
								placeholder="Toyota Corolla, ABC123"
								value={values.vehicle}
								onChange={(e) => update('vehicle', e.target.value)}
							/>
						</div>

						<div className="field">
							<label htmlFor="booking-notes">Notes (optional)</label>
							<textarea
								id="booking-notes"
								name="notes"
								placeholder={BOOKING_CONFIG.notesPlaceholder}
								value={values.notes}
								onChange={(e) => update('notes', e.target.value)}
							/>
						</div>

						<div className="glory-booking__actions">
							<button type="submit" className="glory-btn-gold" disabled={submitting}>
								{submitting ? 'Booking…' : 'Book this appointment'}
							</button>
						</div>
					</form>
				</div>
			)}

			{step === 'success' && (
				<div className="glory-booking__panel glory-booking__panel--success">
					<h2 className="glory-booking__success-title">Thank you! Your appointment is booked.</h2>
					{selectedDate && selectedSlot && (
						<p className="glory-booking__success-meta">
							{formatBookingDate(selectedDate)} at {formatSlotLabel(selectedSlot.start)}
						</p>
					)}
					{successMessage && successMessage !== 'Thank you! Your appointment is booked.' && (
						<p className="glory-booking__hint">{successMessage}</p>
					)}
					<div className="glory-booking__actions">
						<button type="button" className="glory-btn-outline" onClick={resetBooking}>
							Book another appointment
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
