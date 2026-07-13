export type { BookingFormValues } from '../../lib/schemas/booking-form';

export type BookingStep = 'date' | 'time' | 'details' | 'success';

export type BookingSlot = {
    start: number;
    end: number;
    available: boolean;
};

export type BookingAppointmentPayload = {
    slotStart: string;
    name: string;
    email: string;
    phone: string;
    vehicle?: string;
    notes?: string;
};

export type BookingAppointmentResponse = {
    success: boolean;
    appointmentId?: string;
    message: string;
};

export type BookingCancelResponse = {
    success: boolean;
    message?: string;
};

export type BookingEvent = {
    id: string;
    start?: number;
    end?: number;
};

export type BookingEventsResponse = {
    success: boolean;
    data: BookingEvent[];
    message?: string;
};
