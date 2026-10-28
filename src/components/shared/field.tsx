import { cloneElement, isValidElement, type ReactElement, type ReactNode, useId } from 'react';

type FieldProps = {
  label: string;
  /** Hint under the input, for example a limit. */
  hint?: string;
  /** First error message of the field. */
  error?: string;
  /** One input, select or textarea. It receives id and aria props. */
  children: ReactNode;
};

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error || hint ? messageId : undefined,
      })
    : children;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {control}
      {error ? (
        <p id={messageId} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** The input class from the design section, for plain inputs, selects and textareas. */
export const inputClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-950/5';
