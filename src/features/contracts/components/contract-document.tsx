import { CheckCircle2, Clock } from "lucide-react";
import { AppCard } from "@/components/shared/app-card";
import { Money } from "@/components/shared/money";
import { formatDate } from "@/lib/format";
import type { Contract } from "../types";

type SignatureRowProps = {
  party: string;
  name: string;
  signedAt: string | null;
};

// The state is written as text, never only as a color or an icon.
function SignatureRow({ party, name, signedAt }: SignatureRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
      <div>
        <p className="text-sm text-slate-500">{party}</p>
        <p className="font-bold text-brand">{name}</p>
      </div>
      {signedAt ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          স্বাক্ষরিত: {formatDate(signedAt, true)}
        </p>
      ) : (
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-700">
          <Clock className="size-4" aria-hidden="true" />
          অপেক্ষমাণ
        </p>
      )}
    </div>
  );
}

type ContractDocumentProps = { contract: Contract };

/** The readable Bangla agreement. Everything comes from the frozen content. */
export function ContractDocument({ contract }: ContractDocumentProps) {
  const { content } = contract;

  return (
    <AppCard className="shadow-xl shadow-blue-950/5 sm:p-9 print:border-0 print:shadow-none">
      <h1 className="text-center text-3xl font-extrabold tracking-tight text-brand">
        কাজের চুক্তি
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        চুক্তি তৈরির তারিখ: {formatDate(content.createdAt, true)}
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">গ্রাহক</dt>
          <dd className="font-bold text-brand">{content.customerName}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">কারিগর</dt>
          <dd className="font-bold text-brand">{content.technicianName}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">কাজের ধরন</dt>
          {/* Already a Bangla name in the snapshot, so no skillName() here. */}
          <dd className="font-semibold text-slate-800">{content.skill}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">এলাকা</dt>
          <dd className="font-semibold text-slate-800">{content.area}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm text-slate-500">কাজের তারিখ</dt>
          <dd className="font-semibold text-slate-800">
            {formatDate(content.preferredDate)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm text-slate-500">কাজের বিবরণ</dt>
          <dd className="whitespace-pre-line leading-7 text-slate-700">
            {content.description}
          </dd>
        </div>
      </dl>

      <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-500">নির্ধারিত দাম</p>
        <Money amount={content.agreedPrice} className="text-4xl" />
      </div>

      {content.terms && content.terms.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-brand">শর্তাবলি</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 leading-7 text-slate-700">
            {content.terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-bold text-brand">স্বাক্ষর</h2>
        <SignatureRow
          party="গ্রাহক"
          name={content.customerName}
          signedAt={contract.customerSignedAt}
        />
        <SignatureRow
          party="কারিগর"
          name={content.technicianName}
          signedAt={contract.technicianSignedAt}
        />
      </section>
    </AppCard>
  );
}
