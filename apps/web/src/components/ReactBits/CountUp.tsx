import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

interface CountUpProps {
    to: number;
    from?: number;
    direction?: 'up' | 'down';
    delay?: number;
    duration?: number;
    className?: string;
    startWhen?: boolean;
    separator?: string;
    locale?: string;
    currency?: string;
    notation?: "standard" | "scientific" | "engineering" | "compact";
    compactDisplay?: "short" | "long";
    onStart?: () => void;
    onEnd?: () => void;
}

export default function CountUp({
    to,
    from = 0,
    direction = 'up',
    delay = 0,
    duration = 2,
    className = '',
    startWhen = true,
    separator = '',
    locale = 'en-US',
    currency,
    notation,
    compactDisplay,
    onStart,
    onEnd
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === 'down' ? to : from);

    const damping = 20 + 40 * (1 / duration);
    const stiffness = 100 * (1 / duration);

    const springValue = useSpring(motionValue, { damping, stiffness });
    const isInView = useInView(ref, { once: true, margin: '0px' });
    const hasAnimatedRef = useRef(false);

    const getDecimalPlaces = (num: number): number => {
        const str = num.toString();
        if (str.includes('.')) {
            const decimals = str.split('.')[1];
            if (parseInt(decimals) !== 0) return decimals.length;
        }
        return 0;
    };

    const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

    const formatValue = useCallback(
        (latest: number) => {
            const hasDecimals = maxDecimals > 0;
            const options: Intl.NumberFormatOptions = {
                useGrouping: !!separator,
                minimumFractionDigits: hasDecimals ? maxDecimals : 0,
                maximumFractionDigits: hasDecimals ? maxDecimals : 0,
                ...(currency && { style: 'currency', currency }),
                ...(notation && { notation }),
                ...(compactDisplay && { compactDisplay })
            };
            const formattedNumber = Intl.NumberFormat(locale, options).format(latest);
            return separator && !currency ? formattedNumber.replace(/,/g, separator) : formattedNumber;
        },
        [maxDecimals, separator, locale, currency, notation, compactDisplay]
    );

    useEffect(() => {
        if (ref.current) ref.current.textContent = formatValue(direction === 'down' ? to : from);
    }, [from, to, direction, formatValue]);

    useEffect(() => {
        if (isInView && startWhen) {
            if (!hasAnimatedRef.current) {
                hasAnimatedRef.current = true;
                if (typeof onStart === 'function') onStart();
                const timeoutId = setTimeout(() => {
                    motionValue.set(direction === 'down' ? from : to);
                }, delay * 1000);
                const durationTimeoutId = setTimeout(() => {
                    if (typeof onEnd === 'function') onEnd();
                }, delay * 1000 + duration * 1000);
                return () => {
                    clearTimeout(timeoutId);
                    clearTimeout(durationTimeoutId);
                };
            } else {
                motionValue.set(direction === 'down' ? from : to);
            }
        }
    }, [isInView, startWhen, motionValue, direction, from, to, delay, onStart, onEnd, duration]);

    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest: number) => {
            if (ref.current) ref.current.textContent = formatValue(latest);
        });
        return () => unsubscribe();
    }, [springValue, formatValue]);

    return <span className={className} ref={ref} />;
}
