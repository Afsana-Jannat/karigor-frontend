"use client";

import { useForm } from "@tanstack/react-form";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { AppCard } from "@/components/shared/app-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Field, inputClass } from "@/components/shared/field";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { AreaSelect, SkillSelect, useMetaOptions } from "@/features/meta";
import { getErrorMessage } from "@/lib/apiClient";
import { formatNumber } from "@/lib/format";
import { useSession } from "@/lib/session/use-session";
import { cn } from "@/lib/utils";
import { useCreateJob } from "../queries";
import {
  type CreateJobFormValues,
  createJobSchema,
  dateToInputValue,
  getDateLimits,
} from "../schemas";

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

/** New job: /jobs/new. Customers only. Supports /jobs/new?skill=...&area=... */
export default function NewJobPage() {
  const searchParams = useSearchParams();
  const { data: user } = useSession();
  const { skills, areas } = useMetaOptions();
  const createJob = useCreateJob();

  const today = dateToInputValue(new Date());
  const limits = getDateLimits();

  // Typed as the form values, otherwise `false` would be inferred as a literal type.
  const defaultValues: CreateJobFormValues = {
    skill: "",
    area: "",
    description: "",
    preferredDate: today,
    isEmergency: false,
  };

  const form = useForm({
    defaultValues,
    // On submit TanStack Form also runs the change validators, so one schema is enough.
    validators: { onChange: createJobSchema },
    onSubmit: ({ value }) => {
      createJob.mutate({
        skill: value.skill,
        area: value.area,
        description: value.description.trim(),
        preferredDate: value.preferredDate,
        isEmergency: value.isEmergency,
      });
    },
  });

  // Prefill from the URL once the options are known, and only with real slugs.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || skills.length === 0 || areas.length === 0) return;
    prefilled.current = true;
    const skill = searchParams.get("skill");
    const area = searchParams.get("area");
    if (skill && skills.some((option) => option.slug === skill)) {
      form.setFieldValue("skill", skill);
    }
    if (area && areas.some((option) => option.slug === area)) {
      form.setFieldValue("area", area);
    }
  }, [skills, areas, searchParams, form]);

  // A technician who opens the page gets a clear message, not a form.
  if (user?.role === "TECHNICIAN") {
    return (
      <PageContainer narrow>
        <EmptyState
          icon={Briefcase}
          text="শুধু গ্রাহকরা কাজ পোস্ট করতে পারেন।"
          action={
            <Link
              href="/jobs/open"
              className={buttonVariants({ variant: "accent", size: "xl" })}
            >
              খোলা কাজ দেখুন
            </Link>
          }
        />
      </PageContainer>
    );
  }

  // Success screen: the button opens the new job, not the list.
  if (createJob.data) {
    const { job, notifiedCount } = createJob.data;
    return (
      <PageContainer narrow>
        <AppCard className="border-emerald-100 p-7 shadow-xl shadow-blue-950/5 sm:p-10">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Sparkles className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-2xl font-extrabold text-brand">
            আপনার কাজ পোস্ট হয়েছে
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            {notifiedCount > 0
              ? `${formatNumber(notifiedCount)} জন উপযুক্ত কারিগরকে কাজের বিজ্ঞপ্তি পাঠানো হয়েছে।`
              : "এখনো কোনো মিল থাকা কারিগরকে বিজ্ঞপ্তি পাঠানো যায়নি। আপনার কাজটি খোলা কাজের তালিকায় থাকবে।"}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/jobs/${job.id}`}
              className={buttonVariants({ variant: "accent", size: "xl" })}
            >
              কাজটি দেখুন <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white px-5 font-semibold text-brand hover:bg-slate-50"
            >
              আমার কাজগুলো
            </Link>
          </div>
        </AppCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <Link
        href="/jobs"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> কাজের তালিকায় ফিরুন
      </Link>

      <AppCard className="shadow-xl shadow-blue-950/5 sm:p-9">
        <PageHeader
          eyebrow="নতুন কাজ"
          title="আপনার কী কাজ দরকার?"
          description="কাজের তথ্য দিন। আগ্রহী কারিগররা আপনাকে মূল্যসহ প্রস্তাব পাঠাবেন।"
        />

        {/* TODO(Samir): put <SmartJobSearchBox mode="job" /> here when
            features/search is merged. Its result should fill skill, area,
            isEmergency, and the description only while it is still empty
            (form.setFieldValue). */}
        <p className="mb-6 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-center text-sm text-slate-500">
          স্মার্ট সার্চ বক্স এখানে বসবে (Samir)
        </p>

        {createJob.isError ? (
          <div className="mb-5">
            <ErrorState
              error={createJob.error}
              // The generic CONFLICT text is replaced for this screen (section 8.2).
              message={getErrorMessage(createJob.error, {
                CONFLICT: "আপনার একসাথে সর্বোচ্চ ১০টি খোলা কাজ থাকতে পারে।",
              })}
            />
          </div>
        ) : null}

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-5"
        >
          <form.Field name="skill">
            {(field) => (
              <Field
                label="কাজের ধরন"
                error={
                  field.state.meta.isTouched
                    ? firstError(field.state.meta.errors)
                    : undefined
                }
              >
                <SkillSelect
                  value={field.state.value}
                  onChange={(slug) => {
                    field.handleChange(slug);
                    field.handleBlur();
                  }}
                  invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="area">
            {(field) => (
              <Field
                label="কাজের এলাকা"
                error={
                  field.state.meta.isTouched
                    ? firstError(field.state.meta.errors)
                    : undefined
                }
              >
                <AreaSelect
                  value={field.state.value}
                  onChange={(slug) => {
                    field.handleChange(slug);
                    field.handleBlur();
                  }}
                  invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Field
                label="কাজের বিস্তারিত"
                hint={`${formatNumber(field.state.value.length)}/৫০০`}
                error={
                  field.state.meta.isTouched
                    ? firstError(field.state.meta.errors)
                    : undefined
                }
              >
                <textarea
                  rows={5}
                  maxLength={500}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="কী সমস্যা হয়েছে এবং কী ধরনের সাহায্য দরকার তা লিখুন"
                  className={cn(
                    inputClass,
                    "h-auto resize-y py-3 leading-7 placeholder:text-slate-400",
                  )}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="preferredDate">
            {(field) => (
              <Field
                label="কাজের পছন্দের তারিখ"
                hint="আজ থেকে ৬০ দিনের মধ্যে"
                error={
                  field.state.meta.isTouched
                    ? firstError(field.state.meta.errors)
                    : undefined
                }
              >
                <input
                  type="date"
                  min={limits.min}
                  max={limits.max}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="isEmergency">
            {(field) => (
              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(event) => field.handleChange(event.target.checked)}
                  className="mt-1 size-4 accent-cta"
                />
                <span>
                  <span className="block font-bold text-brand">কাজটি জরুরি</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    জরুরি কাজের বিজ্ঞপ্তি এখন উপলভ্য কারিগরদের কাছে যাবে।
                  </span>
                </span>
              </label>
            )}
          </form.Field>

          <Button
            type="submit"
            variant="accent"
            size="xl"
            disabled={createJob.isPending}
            className="w-full"
          >
            {createJob.isPending ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                পোস্ট হচ্ছে
              </>
            ) : (
              <>
                কাজ পোস্ট করুন <ArrowRight aria-hidden="true" />
              </>
            )}
          </Button>
        </form>
      </AppCard>
    </PageContainer>
  );
}
