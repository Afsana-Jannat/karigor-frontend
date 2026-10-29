import { Phone } from "lucide-react";

type PhoneLinkProps = { phone: string };

/** Shown only when the backend returns a phone (after both parties signed). */
export function PhoneLink({ phone }: PhoneLinkProps) {
  return (
    <a
      href={`tel:${phone}`}
      className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand hover:underline"
    >
      <Phone className="size-4" aria-hidden="true" />
      {phone}
    </a>
  );
}
