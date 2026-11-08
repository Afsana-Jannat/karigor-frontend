"use client";

import { Sparkles } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../types";
import { ChatTechnicianCard } from "./chat-technician-card";

function InlineText({ text }: { text: string }) {
  // Only bold Markdown is rendered. We never inject the answer as HTML.
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g).filter(Boolean);
  const nodes: ReactNode[] = [];
  let offset = 0;

  for (const part of parts) {
    const key = `${offset}-${part}`;
    offset += part.length;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      nodes.push(<strong key={key}>{part.slice(2, -2)}</strong>);
    } else {
      nodes.push(<Fragment key={key}>{part}</Fragment>);
    }
  }

  return <>{nodes}</>;
}

function ChatAnswer({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter((block) => block.trim());
  const rendered: ReactNode[] = [];
  let blockOffset = 0;

  if (!blocks.length) {
    return <p className="leading-6">উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।</p>;
  }

  for (const block of blocks) {
    const blockKey = `${blockOffset}-${block.slice(0, 16)}`;
    blockOffset += block.length + 2;

    const lines = block.split("\n");
    const isList =
      lines.length > 1 && lines.every((line) => /^\s*[-*]\s+/.test(line));

    if (isList) {
      const items: ReactNode[] = [];
      let lineOffset = 0;

      for (const line of lines) {
        const lineKey = `${lineOffset}-${line.slice(0, 16)}`;
        lineOffset += line.length + 1;
        items.push(
          <li key={lineKey} className="break-words leading-6">
            <InlineText text={line.replace(/^\s*[-*]\s+/, "")} />
          </li>,
        );
      }

      rendered.push(
        <ul key={blockKey} className="list-disc space-y-1 pl-5">
          {items}
        </ul>,
      );
      continue;
    }

    rendered.push(
      <p key={blockKey} className="whitespace-pre-wrap break-words leading-6">
        <InlineText text={block} />
      </p>,
    );
  }

  return <div className="space-y-2">{rendered}</div>;
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
          <Sparkles aria-hidden="true" className="size-3.5" />
        </span>
      ) : null}

      <div
        className={cn(
          "min-w-0",
          isUser ? "max-w-[85%]" : "w-full max-w-[calc(100%-2.25rem)]",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm",
            isUser
              ? "rounded-br-md bg-brand text-white"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-700",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-6">
              {message.content}
            </p>
          ) : (
            <ChatAnswer content={message.content} />
          )}
        </div>

        {!isUser && message.technicians.length ? (
          <div className="mt-2 space-y-2">
            <p className="px-1 text-[11px] font-bold text-slate-500">
              সম্ভাব্য কারিগর
            </p>
            {message.technicians.map((technician) => (
              <ChatTechnicianCard key={technician.id} technician={technician} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
