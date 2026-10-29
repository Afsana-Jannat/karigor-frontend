"use client";

import { useForm } from "@tanstack/react-form";
import { FileSignature, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AppCard } from "@/components/shared/app-card";
import { Field, inputClass } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/apiClient";
import { formatNumber, toAsciiDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useRequestSignOtp, useSignContract } from "../queries";
import { type SignOtpFormValues, signOtpSchema } from "../schemas";

const RESEND_SECONDS = 60;

// Standard Schema issues arrive as objects with a message, other validators as strings.
function firstError(errors: unknown[]): string | undefined {
  const first = errors[0];
  if (!first) return undefined;
  if (typeof first === "string") return first;
  if (typeof first === "object" && "message" in first) {
    return String((first as { message: unknown }).message);
  }
  return undefined;
}

type SignContractPanelProps = {
  /** The CONTRACT id, not the job id. */
  contractId: string;
};

/**
 * Signing flow: send a code, type it, sign. The code goes to the signer's own
 * phone. Shown only when the contract is PENDING and the viewer has not signed.
 */
export function SignContractPanel({ contractId }: SignContractPanelProps) {
  const requestOtp = useRequestSignOtp();
  const sign = useSignContract(contractId);

  const [sent, setSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [devCode, setDevCode] = useState<string | undefined>();

  // Resend countdown: one tick per second until it reaches zero.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const defaultValues: SignOtpFormValues = { otp: "" };
  const form = useForm({
    defaultValues,
    validators: { onChange: signOtpSchema },
    onSubmit: ({ value }) => sign.mutate(value.otp),
  });

  function sendCode() {
    requestOtp.mutate(contractId, {
      onSuccess: (result) => {
        setSent(true);
        setSecondsLeft(RESEND_SECONDS);
        setDevCode(result.devCode);
        sign.reset();
        form.reset();
      },
    });
  }

  const requestError = requestOtp.isError
    ? getErrorMessage(requestOtp.error, {
        CONFLICT: "আপনি আগেই এই চুক্তিতে স্বাক্ষর করেছেন।",
      })
    : undefined;

  return (
    <AppCard className="print:hidden">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand">
          <FileSignature className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-brand">চুক্তিতে স্বাক্ষর করুন</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            আপনার ফোন নম্বরে একটি কোড যাবে। কোডটি লিখে স্বাক্ষর নিশ্চিত করুন।
          </p>
        </div>
      </div>

      {requestError ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {requestError}
        </p>
      ) : null}

      {!sent ? (
        <Button
          type="button"
          variant="accent"
          size="xl"
          disabled={requestOtp.isPending}
          onClick={sendCode}
          className="mt-5 w-full sm:w-auto"
        >
          {requestOtp.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : null}
          স্বাক্ষর করতে কোড পাঠান
        </Button>
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="mt-5 space-y-4"
        >
          {/* Demo mode only: the backend returns the code so testers need no SMS. */}
          {devCode ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              ডেমো কোড: <strong>{devCode}</strong>
            </p>
          ) : null}

          <form.Field name="otp">
            {(field) => (
              <Field
                label="কোড"
                error={
                  sign.isError
                    ? getErrorMessage(sign.error, {
                        CONFLICT: "আপনি আগেই এই চুক্তিতে স্বাক্ষর করেছেন।",
                      })
                    : field.state.meta.isTouched
                      ? firstError(field.state.meta.errors)
                      : undefined
                }
              >
                {/* TODO(Mohebul): replace with <OtpInput> once it is merged. */}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    // Bangla digits are turned into ASCII before anything else.
                    field.handleChange(
                      toAsciiDigits(event.target.value)
                        .replace(/\D/g, "")
                        .slice(0, 6),
                    );
                  }}
                  placeholder="৬ সংখ্যার কোড"
                  className={cn(
                    inputClass,
                    "text-center text-xl tracking-[0.5em]",
                  )}
                />
              </Field>
            )}
          </form.Field>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              variant="accent"
              size="xl"
              disabled={sign.isPending}
            >
              {sign.isPending ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : null}
              স্বাক্ষর করুন
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xl"
              disabled={secondsLeft > 0 || requestOtp.isPending}
              onClick={sendCode}
            >
              {secondsLeft > 0
                ? `${formatNumber(secondsLeft)} সেকেন্ড পরে আবার পাঠান`
                : "আবার কোড পাঠান"}
            </Button>
          </div>
        </form>
      )}
    </AppCard>
  );
}
