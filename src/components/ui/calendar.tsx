import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '../../lib/utils';
import './calendar.scss';

export type CalendarProps = DayPickerProps;

function ChevronLeft() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

/** shadcn/ui Calendar — styled with SCSS until Tailwind is added. */
export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            navLayout="around"
            className={cn('glory-calendar', className)}
            classNames={{
                months: 'glory-calendar__months',
                month: 'glory-calendar__month',
                month_caption: 'glory-calendar__caption',
                caption_label: 'glory-calendar__caption-label',
                button_previous: 'glory-calendar__nav-btn glory-calendar__nav-btn--prev',
                button_next: 'glory-calendar__nav-btn glory-calendar__nav-btn--next',
                month_grid: 'glory-calendar__grid',
                weekdays: 'glory-calendar__weekdays',
                weekday: 'glory-calendar__weekday',
                week: 'glory-calendar__week',
                day: 'glory-calendar__day',
                day_button: 'glory-calendar__day-btn',
                selected: 'glory-calendar__selected',
                today: 'glory-calendar__today',
                outside: 'glory-calendar__outside',
                disabled: 'glory-calendar__disabled',
                hidden: 'glory-calendar__hidden',
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => (orientation === 'left' ? <ChevronLeft /> : <ChevronRight />),
            }}
            {...props}
        />
    );
}
