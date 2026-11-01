'use client';

import * as React from 'react';

export function useCountdown(initialSeconds: number = 60) {
  const [secondsLeft, setSecondsLeft] = React.useState<number>(0);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const startCountdown = (seconds: number = initialSeconds) => {
    setSecondsLeft(seconds);
  };

  return {
    secondsLeft,
    isRunning: secondsLeft > 0,
    startCountdown,
  };
}