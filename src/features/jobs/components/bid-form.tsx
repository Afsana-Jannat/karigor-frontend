"use client";

import { type FormEvent, useState } from "react";
import { z } from "zod";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/apiClient";
import { bidStatusLabels } from "@/lib/labels";
import { useSubmitBid, useWithdrawBid } from "../queries";
import type { OpenJobItem } from "../types";

const bidSchema = z.object({
  price: z.number().int().min(1).max(1_000_000),
  note: z.string().trim().max(200),
});

type BidFormProps = {
  jobId: string;
  myBid: OpenJobItem["myBid"];
};

export function BidForm({ jobId, myBid }: BidFormProps) {
  const [price, setPrice] = useState(myBid ? String(myBid.price) : "");
  const [note, setNote] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const submitBid = useSubmitBid();
  const withdrawBid = useWithdrawBid();
  const canBid =
    !myBid || myBid.status === "ACTIVE" || myBid.status === "WITHDRAWN";

  if (!canBid) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        আপনার প্রস্তাবের অবস্থা: {bidStatusLabels[myBid.status]}
      </p>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = bidSchema.safeParse({
      price: Number(price),
      note,
    });

    if (!parsed.success) {
      setValidationError(
        "মূল্য ১ থেকে ১০,০০,০০০ টাকার মধ্যে পূর্ণসংখ্যা হতে হবে; নোট সর্বোচ্চ ২০০ অক্ষর।",
      );
      return;
    }

    setValidationError("");
    submitBid.mutate({
      jobId,
      input: {
        price: parsed.data.price,
        ...(parsed.data.note ? { note: parsed.data.note } : {}),
      },
    });
  }

  return (
    <div className="space-y-3">
      {myBid?.status === "ACTIVE" ? (
        <p className="text-sm text-slate-600">
          বর্তমান প্রস্তাব: <Money amount={myBid.price} />
        </p>
      ) : myBid?.status === "WITHDRAWN" ? (
        <p className="text-sm text-slate-600">
          প্রত্যাহার করা প্রস্তাব আবার পাঠাতে পারবেন।
        </p>
      ) : null}

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            আপনার প্রস্তাবিত মূল্য (টাকা)
          </span>
          <input
            type="number"
            min={1}
            max={1_000_000}
            step={1}
            inputMode="numeric"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-blue-950/5"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            নোট{" "}
            <span className="font-normal text-slate-500">
              (ঐচ্ছিক, সর্বোচ্চ ২০০ অক্ষর)
            </span>
          </span>
          <textarea
            rows={2}
            maxLength={200}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-blue-950/5"
          />
        </label>

        {validationError ? (
          <p role="alert" className="text-sm text-red-700">
            {validationError}
          </p>
        ) : null}
        {submitBid.isError ? (
          <p role="alert" className="text-sm text-red-700">
            {getErrorMessage(submitBid.error, {
              CONFLICT: "এই কাজটিতে আর প্রস্তাব দেওয়া যাচ্ছে না।",
              FORBIDDEN: "আপনার দক্ষতা বা এলাকা এই কাজের সাথে মেলে না।",
              INVALID_STATUS: "কাজটি আর প্রস্তাব গ্রহণ করছে না।",
            })}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="accent" disabled={submitBid.isPending}>
            {submitBid.isPending
              ? "পাঠানো হচ্ছে…"
              : myBid?.status === "ACTIVE"
                ? "প্রস্তাব আপডেট করুন"
                : "প্রস্তাব পাঠান"}
          </Button>

          {myBid?.status === "ACTIVE" ? (
            <Button
              type="button"
              variant="outline"
              disabled={withdrawBid.isPending}
              onClick={() => setWithdrawOpen(true)}
            >
              প্রস্তাব প্রত্যাহার
            </Button>
          ) : null}
        </div>
      </form>

      <ConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title="প্রস্তাবটি প্রত্যাহার করবেন?"
        description="প্রত্যাহারের পর কাজটি খোলা থাকলে আবার প্রস্তাব পাঠাতে পারবেন।"
        confirmLabel="প্রত্যাহার করুন"
        destructive
        pending={withdrawBid.isPending}
        onConfirm={() =>
          withdrawBid.mutate(jobId, {
            onSuccess: () => setWithdrawOpen(false),
          })
        }
      />
    </div>
  );
}
