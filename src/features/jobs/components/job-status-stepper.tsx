import { Check } from "lucide-react";
import { jobStatusLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { JobStatus } from "../types";

// The happy path, in order. CANCELLED and DISPUTED are not steps: the page
// shows a notice for them instead of a stepper.
const steps: JobStatus[] = [
  "OPEN",
  "CONTRACT_PENDING",
  "IN_PROGRESS",
  "AWAITING_CONFIRMATION",
  "COMPLETED",
];

type JobStatusStepperProps = { status: JobStatus };

export function JobStatusStepper({ status }: JobStatusStepperProps) {
  const current = steps.indexOf(status);
  if (current === -1) return null;

  return (
    <ol aria-label="কাজের অবস্থা" className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                done && "bg-emerald-100 text-emerald-700",
                active && "bg-brand text-white",
                !done && !active && "bg-slate-100 text-slate-400",
              )}
            >
              {done ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            {/* The state is written as text too, never only as a color. */}
            <span
              className={cn(
                "text-sm",
                active ? "font-bold text-brand" : "text-slate-500",
              )}
            >
              {jobStatusLabels[step]}
              {active ? <span className="sr-only"> (এখন এই ধাপে)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
