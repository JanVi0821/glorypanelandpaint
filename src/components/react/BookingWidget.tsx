import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BOOKING_CONFIG,
  fetchBookingSlotsForDate,
  formatBookingDate,
  formatSlotLabel,
  isBookableDate,
  submitBooking,
  toIsoTimestamp,
  type BookingSlot,
  type BookingStep,
} from "../../api/booking";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "../../lib/schemas/booking-form";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import "@/components/ui/calendar.scss";

const defaultValues: BookingFormValues = {
  name: "",
  email: "",
  phone: "",
  vehicle: "",
  notes: "",
};

export default function BookingWidget() {
  const [step, setStep] = useState<BookingStep>("date");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues,
  });

  const loadSlots = useCallback(async (date: Date) => {
    setSelectedSlot(null);
    const next = await fetchBookingSlotsForDate(date);
    setSlots(next);
  }, []);

  const goToTime = async () => {
    if (!selectedDate || loadingSlots) return;

    setLoadingSlots(true);
    setSlotError("");

    try {
      await loadSlots(selectedDate);
      setStep("time");
      window.posthog?.capture("booking_date_selected");
    } catch {
      setSlotError("Unable to load available times. Please try again.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const goToDetails = () => {
    if (!selectedSlot) {
      setSlotError("Please select a time.");
      return;
    }
    setSlotError("");
    setStep("details");
    window.posthog?.capture("booking_time_selected");
  };

  const onDateSelect = (date: Date | undefined) => {
    if (!date || !isBookableDate(date) || loadingSlots) return;
    setSelectedDate(date);
    setSlotError("");
  };

  const availableSlots = slots.filter((slot) => slot.available);

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedDate || !selectedSlot) return;

    clearErrors("root");

    try {
      const result = await submitBooking({
        slotStart: toIsoTimestamp(selectedSlot.start),
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        vehicle: values.vehicle.trim() || undefined,
        notes: values.notes.trim() || undefined,
      });
      setSuccessMessage(result?.message || "");
      setStep("success");
      window.posthog?.capture("booking_submitted", {
        has_vehicle: !!values.vehicle.trim(),
        has_notes: !!values.notes.trim(),
      });
    } catch (err) {
      setError("root", {
        message: "Something went wrong. Please try again or call us.",
      });
      window.posthog?.captureException(err);
    }
  });

  const resetBooking = () => {
    setStep("date");
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSlots([]);
    reset(defaultValues);
    setSlotError("");
    setSuccessMessage("");
    clearErrors();
  };

  return (
    <div className="glory-booking">
      {step !== "success" && (
        <header className="glory-booking__header">
          <h2 className="glory-booking__title">{BOOKING_CONFIG.serviceName}</h2>
          <p className="glory-booking__meta">
            {BOOKING_CONFIG.durationMinutes} min
          </p>
        </header>
      )}

      {step === "date" && (
        <div className="glory-booking__panel">
          <p className="glory-booking__step-label">Select a date</p>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={(date) => !isBookableDate(date)}
            defaultMonth={selectedDate ?? new Date()}
          />
          {slotError && <p className="glory-booking__error">{slotError}</p>}

          <div className="glory-booking__actions">
            <Button
              variant="gold"
              size="xl"
              loading={loadingSlots}
              disabled={!selectedDate}
              onClick={() => void goToTime()}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "time" && selectedDate && (
        <div className="glory-booking__panel">
          <p className="glory-booking__step-label">
            {formatBookingDate(selectedDate)}
          </p>
          <button
            type="button"
            className="glory-booking__back"
            onClick={() => setStep("date")}
          >
            &larr; Change date
          </button>

          {loadingSlots ? (
            <p className="glory-booking__hint">Loading available times…</p>
          ) : slots.length === 0 ? (
            <p className="glory-booking__hint">
              No times available on this day. Please choose another date.
            </p>
          ) : (
            <>
              {availableSlots.length === 0 && (
                <p className="glory-booking__hint">
                  No times available on this day. Please choose another day.
                </p>
              )}
              <div
                className="glory-booking__slots"
                role="listbox"
                aria-label="Available times"
              >
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    type="button"
                    role="option"
                    aria-selected={selectedSlot?.start === slot.start}
                    aria-disabled={!slot.available}
                    disabled={!slot.available}
                    className={`glory-booking__slot${selectedSlot?.start === slot.start ? " is-selected" : ""}${!slot.available ? " is-disabled" : ""}`}
                    onClick={() => {
                      if (!slot.available) return;
                      setSelectedSlot(slot);
                      setSlotError("");
                    }}
                  >
                    {formatSlotLabel(slot.start)}
                  </button>
                ))}
              </div>
            </>
          )}

          {slotError && <p className="glory-booking__error">{slotError}</p>}

          {!(!selectedSlot || availableSlots.length === 0) && (
            <div className="glory-booking__actions">
              <button
                type="button"
                className="glory-btn-gold"
                disabled={!selectedSlot || availableSlots.length === 0}
                onClick={goToDetails}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {step === "details" && selectedDate && selectedSlot && (
        <div className="glory-booking__panel">
          <p className="glory-booking__summary">
            {formatBookingDate(selectedDate)} &middot;{" "}
            {formatSlotLabel(selectedSlot.start)}
          </p>
          <button
            type="button"
            className="glory-booking__back"
            onClick={() => setStep("time")}
          >
            &larr; Change time
          </button>

          <form className="glory-booking__form" onSubmit={onSubmit} noValidate>
            {errors.root && (
              <div className="glory-booking__form-error">
                {errors.root.message}
              </div>
            )}

            <div className="field">
              <label htmlFor="booking-name">Your name</label>
              <input
                id="booking-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <div className="field-error">{errors.name.message}</div>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="booking-phone">Phone</label>
                <input
                  id="booking-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="021 123 4567"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                {errors.phone && (
                  <div className="field-error">{errors.phone.message}</div>
                )}
              </div>
              <div className="field">
                <label htmlFor="booking-email">Email</label>
                <input
                  id="booking-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <div className="field-error">{errors.email.message}</div>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="booking-vehicle">
                Vehicle (make / model / rego)
              </label>
              <input
                id="booking-vehicle"
                type="text"
                placeholder="Toyota Corolla, ABC123"
                {...register("vehicle")}
              />
            </div>

            <div className="field">
              <label htmlFor="booking-notes">Notes (optional)</label>
              <textarea
                id="booking-notes"
                placeholder={BOOKING_CONFIG.notesPlaceholder}
                {...register("notes")}
              />
            </div>

            <div className="glory-booking__actions">
              <Button
                type="submit"
                variant="gold"
                size="xl"
                loading={isSubmitting}
              >
                Book this appointment
              </Button>
            </div>
          </form>
        </div>
      )}

      {step === "success" && (
        <div className="glory-booking__panel glory-booking__panel--success">
          <h2 className="glory-booking__success-title">
            Thank you! Your appointment is booked.
          </h2>
          {selectedDate && selectedSlot && (
            <p className="glory-booking__success-meta">
              {formatBookingDate(selectedDate)} at{" "}
              {formatSlotLabel(selectedSlot.start)}
            </p>
          )}
          {successMessage &&
            successMessage !== "Thank you! Your appointment is booked." && (
              <p className="glory-booking__hint">{successMessage}</p>
            )}
          <div className="glory-booking__actions">
            <button
              type="button"
              className="glory-btn-outline"
              onClick={resetBooking}
            >
              Book another appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
