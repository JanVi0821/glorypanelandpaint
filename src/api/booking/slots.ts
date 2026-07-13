import { TZDate } from "@date-fns/tz";
import { differenceInCalendarDays } from "date-fns";
import { BOOKING_CONFIG } from "./config";
import type { BookingSlot } from "./types";

const TZ = BOOKING_CONFIG.timezone;

function calendarParts(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

function nzTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  return new TZDate(year, month, day, hour, minute, 0, TZ).getTime();
}

export function toIsoTimestamp(ms: number): string {
  return new Date(ms).toISOString();
}

/** Whether a calendar day can be selected (Mon–Sat, not in the past, within advance window). */
export function isBookableDate(date: Date, now = new Date()): boolean {
  const { year, month, day } = calendarParts(date);
  const candidate = new TZDate(year, month, day, 12, 0, 0, TZ);
  if (candidate.getDay() === 0) return false;

  const today = TZDate.tz(TZ, now);
  const todayAnchor = new TZDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
    0,
    0,
    TZ,
  );
  const diff = differenceInCalendarDays(candidate, todayAnchor);

  return diff >= 0 && diff <= BOOKING_CONFIG.maxAdvanceDays;
}

/** Generate all assessment slots for a calendar day in NZ time. */
export function generateSlots(date: Date, now = Date.now()): BookingSlot[] {
  const { year, month, day } = calendarParts(date);
  const dayOfWeek = new TZDate(year, month, day, 12, 0, 0, TZ).getDay();
  if (dayOfWeek === 0) return [];

  const hours =
    dayOfWeek === 6 ? BOOKING_CONFIG.saturday : BOOKING_CONFIG.weekday;
  const slots: BookingSlot[] = [];
  let cursor = hours.openHour * 60 + hours.openMinute;
  const close = hours.closeHour * 60 + hours.closeMinute;

  while (cursor + BOOKING_CONFIG.durationMinutes <= close) {
    const start = nzTimestamp(
      year,
      month,
      day,
      Math.floor(cursor / 60),
      cursor % 60,
    );
    const end = start + BOOKING_CONFIG.durationMinutes * 60_000;

    slots.push({
      start,
      end,
      available: start > now,
    });

    cursor += BOOKING_CONFIG.durationMinutes;
  }

  return slots;
}

export function formatSlotLabel(start: number): string {
  return new Date(start).toLocaleTimeString("en-NZ", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatBookingDate(date: Date): string {
  const { year, month, day } = calendarParts(date);
  return new TZDate(year, month, day, 12, 0, 0, TZ).toLocaleDateString(
    "en-NZ",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}
