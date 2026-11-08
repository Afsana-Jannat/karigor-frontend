"use client";

import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useMetaOptions } from "@/features/meta";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChatTechnician } from "../types";

function rateLabel(technician: ChatTechnician) {
  if (technician.rateMin != null && technician.rateMax != null) {
    return `${formatMoney(technician.rateMin)} – ${formatMoney(technician.rateMax)}`;
  }
  if (technician.rateMin != null) {
    return formatMoney(technician.rateMin);
  }
  if (technician.rateMax != null) {
    return formatMoney(technician.rateMax);
  }
  return "চার্জ আলোচনা সাপেক্ষে";
}

export function ChatTechnicianCard({
  technician,
}: {
  technician: ChatTechnician;
}) {
  const { skillName, areaName } = useMetaOptions();
  const skills = technician.skills.map(skillName).filter(Boolean).join(" · ");
  const areas = technician.areas.map(areaName).filter(Boolean).join(" · ");

  return (
    <Link
      href={`/technicians/${technician.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-orange-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-brand group-hover:text-accent">
            {technician.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Star
              aria-hidden="true"
              className="size-3.5 fill-amber-400 text-amber-400"
            />
            {technician.ratingAvg.toFixed(1)} ·{" "}
            {formatNumber(technician.ratingCount)} রিভিউ ·{" "}
            {formatNumber(technician.experienceYears)} বছরের অভিজ্ঞতা
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
            technician.isAvailableNow
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600",
          )}
        >
          {technician.isAvailableNow ? "এখনই উপলব্ধ" : "এখন ব্যস্ত"}
        </span>
      </div>

      {skills ? <p className="mt-2 text-xs text-slate-600">{skills}</p> : null}
      {areas ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{areas}</span>
        </p>
      ) : null}

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <p className="text-xs font-bold text-accent">{rateLabel(technician)}</p>
        <span className="text-[11px] font-semibold text-brand">
          প্রোফাইল দেখুন
        </span>
      </div>
    </Link>
  );
}
