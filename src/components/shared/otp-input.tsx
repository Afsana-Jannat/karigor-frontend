'use client';

import * as React from 'react';
import { toAsciiDigits } from '@/lib/format';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Value array handle korar jonno
  const valueArray = React.useMemo(() => {
    const digits = value.split('');
    return Array.from({ length }, (_, i) => digits[i] || '');
  }, [value, length]);

  const focusInput = (index: number) => {
    const target = inputRefs.current[index];
    if (target) {
      target.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawVal = e.target.value;
    const asciiVal = toAsciiDigits(rawVal);
    const digit = asciiVal.replace(/\D/g, '').slice(-1);

    if (!digit) {
      // Jodi kisu na thake, empty kore dibo
      const newValueArray = [...valueArray];
      newValueArray[index] = '';
      onChange(newValueArray.join(''));
      return;
    }

    const newValueArray = [...valueArray];
    newValueArray[index] = digit;
    onChange(newValueArray.join(''));

    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!valueArray[index] && index > 0) {
        focusInput(index - 1);
        const newValueArray = [...valueArray];
        newValueArray[index - 1] = '';
        onChange(newValueArray.join(''));
      } else {
        const newValueArray = [...valueArray];
        newValueArray[index] = '';
        onChange(newValueArray.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const asciiPaste = toAsciiDigits(pasteData);
    const digits = asciiPaste.replace(/\D/g, '').slice(0, length).split('');

    const newValueArray = [...valueArray];
    digits.forEach((d, i) => {
      if (i < length) {
        newValueArray[i] = d;
      }
    });
    onChange(newValueArray.join(''));

    const nextIndex = Math.min(digits.length, length - 1);
    focusInput(nextIndex);
  };

  return (
    <div className="flex gap-2 justify-between items-center" dir="ltr">
      {valueArray.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="h-12 w-12 text-center text-lg font-bold rounded-xl border border-slate-200 bg-white outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5 disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}