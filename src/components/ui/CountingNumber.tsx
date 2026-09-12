'use client';

import {
  type AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type ValueAnimationTransition,
} from 'framer-motion';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { cn } from '@/lib/utils';

export type CountingNumberRef = {
  startAnimation: () => void;
};

export type CountingNumberProps = {
  from?: number;
  target: number;
  transition?: ValueAnimationTransition;
  className?: string;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
  /** BCP-47 locale for digit formatting - e.g. 'bn' renders Bengali numerals. */
  locale?: string;
};

export const CountingNumber = forwardRef<CountingNumberRef, CountingNumberProps>(
  (
    {
      from = 0,
      target = 100,
      transition = { duration: 1.8, ease: 'easeOut', type: 'tween' },
      className,
      onStart,
      onComplete,
      autoStart = true,
      locale,
      ...props
    },
    ref,
  ) => {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) =>
      Math.round(latest).toLocaleString(locale),
    );
    const controlsRef = useRef<AnimationPlaybackControls | null>(null);

    const startAnimation = useCallback(() => {
      controlsRef.current?.stop();
      onStart?.();
      count.set(from);
      controlsRef.current = animate(count, target, {
        ...transition,
        onComplete: () => onComplete?.(),
      });
    }, [from, target, transition, onStart, onComplete, count]);

    useImperativeHandle(ref, () => ({ startAnimation }));

    useEffect(() => {
      if (autoStart) startAnimation();
      return () => controlsRef.current?.stop();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart, startAnimation]);

    return (
      <motion.span className={cn('tabular-nums', className)} {...props}>
        {rounded}
      </motion.span>
    );
  },
);

CountingNumber.displayName = 'CountingNumber';

export default CountingNumber;