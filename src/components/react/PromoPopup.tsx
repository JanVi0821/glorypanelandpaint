import { useCallback, useEffect, useState } from 'react';
import GloryGoldText from '@/components/react/GloryGoldText';
import { promo } from '../../data/promo';

export default function PromoPopup() {
    const [open, setOpen] = useState(false);

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!promo.enabled) return;

        try {
            if (sessionStorage.getItem(promo.storageKey)) return;
        } catch {
            /* private browsing */
        }

        const timer = window.setTimeout(() => {
            setOpen(true);
            try {
                sessionStorage.setItem(promo.storageKey, '1');
            } catch {
                /* ignore */
            }
        }, promo.delayMs);

        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    if (!promo.enabled || !open) return null;

    return (
        <div className="glory-promo" role="presentation">
            <div className="glory-promo__backdrop" onClick={close} aria-hidden="true" />
            <div
                className="glory-promo__box"
                role="dialog"
                aria-modal="true"
                aria-label="Special offer"
            >
                <button
                    type="button"
                    className="glory-promo__close"
                    onClick={close}
                    aria-label="Close"
                >
                    &times;
                </button>
                <p className="glory-promo__head">{promo.headline}</p>
                <p className="glory-promo__head">
                    {promo.subline}{' '}
                    <GloryGoldText text={promo.highlight} />
                </p>
                <a className="glory-btn-gold glory-promo__cta" href={promo.ctaHref} onClick={close}>
                    {promo.ctaLabel}
                </a>
            </div>
        </div>
    );
}
