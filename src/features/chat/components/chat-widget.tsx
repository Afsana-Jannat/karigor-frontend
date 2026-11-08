"use client";

import {
  CircleAlert,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { getApiErrorStatus, getErrorMessage } from "@/lib/apiClient";
import { useSession } from "@/lib/session/use-session";
import { cn } from "@/lib/utils";
import { useSendChatMessage } from "../queries";
import type { ChatMessage } from "../types";
import { ChatMessageBubble } from "./chat-message";

const CHAT_STORAGE_KEY = "karigor.chat.v1";
const MAX_STORED_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 1000;

const suggestions = [
  "মিরপুরে একজন প্লাম্বার দরকার",
  "ইলেকট্রিশিয়ান খুঁজছি",
  "ধানমন্ডিতে কাজের লোক দরকার",
];

type StoredChat = {
  userId: string;
  sessionId?: string;
  messages: ChatMessage[];
};

let messageSequence = 0;

function nextMessageId() {
  messageSequence += 1;
  return `chat-${Date.now()}-${messageSequence}`;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  if (typeof message.id !== "string" || typeof message.content !== "string") {
    return false;
  }
  if (message.role === "user") return true;
  return message.role === "assistant" && Array.isArray(message.technicians);
}

function readStoredChat(): StoredChat | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const record = parsed as Record<string, unknown>;
    if (typeof record.userId !== "string" || !Array.isArray(record.messages)) {
      return null;
    }

    return {
      userId: record.userId,
      ...(typeof record.sessionId === "string"
        ? { sessionId: record.sessionId }
        : {}),
      messages: record.messages.filter(isChatMessage),
    };
  } catch {
    return null;
  }
}

function writeStoredChat(
  userId: string,
  sessionId: string | undefined,
  messages: ChatMessage[],
) {
  try {
    window.sessionStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify({
        userId,
        ...(sessionId ? { sessionId } : {}),
        messages: messages.slice(-MAX_STORED_MESSAGES),
      }),
    );
  } catch {
    // Storage can be unavailable or full. Chat still works without it.
  }
}

function clearStoredChat() {
  try {
    window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function chatErrorMessage(error: unknown) {
  const status = getApiErrorStatus(error);
  if (status === 401) {
    return "চ্যাট ব্যবহার করতে অনুগ্রহ করে আগে লগইন করুন।";
  }
  if (status === 403) {
    return "চ্যাট সহায়তা শুধু গ্রাহক অ্যাকাউন্টের জন্য প্রাপ্য।";
  }
  return getErrorMessage(error);
}

function PanelCenter({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-slate-50 px-6 py-10 text-center">
      {children}
    </div>
  );
}

function ChatWelcome({
  onPick,
  disabled,
}: {
  onPick: (message: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <span className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-accent">
        <Sparkles aria-hidden="true" size={21} />
      </span>
      <p className="mt-3 font-bold text-brand">আসসালামু আলাইকুম!</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        কী ধরনের কাজ এবং কোন এলাকায় দরকার লিখুন। উপযুক্ত কারিগর খুঁজে দিতে সাহায্য করব।
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPick(suggestion)}
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-accent disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        উত্তর AI থেকে আসে। প্রোফাইল দেখে নিজের প্রয়োজন মিলিয়ে নিন।
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
        <Sparkles aria-hidden="true" className="size-3.5" />
      </span>
      <output
        aria-live="polite"
        className="block rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3"
      >
        <span className="sr-only">উত্তর লেখা হচ্ছে</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
        </span>
      </output>
    </div>
  );
}

export function ChatWidget() {
  const session = useSession();
  const user = session.data ?? null;
  const isCustomer = user?.role === "CUSTOMER";
  const sendMessage = useSendChatMessage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string>();
  const [input, setInput] = useState("");
  const [chatError, setChatError] = useState<unknown>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null,
  );
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [storeUserId, setStoreUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load the previous conversation for the current account only.
  useEffect(() => {
    if (session.isPending) return;

    const stored = user?.id ? readStoredChat() : null;
    if (stored && user?.id && stored.userId === user.id) {
      setMessages(stored.messages);
      setChatSessionId(stored.sessionId);
    } else {
      setMessages([]);
      setChatSessionId(undefined);
      clearStoredChat();
    }

    setStoreUserId(user?.id ?? null);
    setStoreLoaded(true);
  }, [session.isPending, user?.id]);

  // Persist only after the store is matched to the current account.
  useEffect(() => {
    if (!storeLoaded || !user?.id || storeUserId !== user.id) return;

    if (!messages.length && !chatSessionId) {
      clearStoredChat();
      return;
    }

    writeStoredChat(user.id, chatSessionId, messages);
  }, [storeLoaded, storeUserId, user?.id, messages, chatSessionId]);

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: The scroll must also run when the conversation, loading, or error state changes.
  useEffect(() => {
    if (!isOpen) return;
    const container = scrollRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [isOpen, messages, sendMessage.isPending, chatError]);

  function submitMessage(rawMessage: string, appendUserMessage = true) {
    const message = rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!message || !isCustomer || sendMessage.isPending) return;

    setChatError(null);
    setLastFailedMessage(null);

    if (appendUserMessage) {
      setMessages((current) => [
        ...current,
        { id: nextMessageId(), role: "user", content: message },
      ]);
      setInput("");
    }

    sendMessage.mutate(
      {
        message,
        ...(chatSessionId ? { sessionId: chatSessionId } : {}),
      },
      {
        onSuccess: (response) => {
          setChatSessionId(response.sessionId);
          setMessages((current) => [
            ...current,
            {
              id: nextMessageId(),
              role: "assistant",
              content: response.answer,
              technicians: response.technicians ?? [],
            },
          ]);
        },
        onError: (error) => {
          setChatError(error);
          setLastFailedMessage(message);
        },
      },
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(input);
    }
  }

  function resetChat() {
    if (sendMessage.isPending) return;
    setMessages([]);
    setChatSessionId(undefined);
    setInput("");
    setChatError(null);
    setLastFailedMessage(null);
    clearStoredChat();
  }

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          aria-label="কারিগর সহায়ক চ্যাট খুলুন"
          aria-expanded="false"
          aria-controls="karigor-chat-panel"
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-3.5 py-3 font-bold text-white shadow-xl shadow-orange-500/30 transition hover:-translate-y-0.5 hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 sm:right-6 sm:px-5"
        >
          <MessageCircle aria-hidden="true" size={22} />
          <span className="hidden sm:inline">কারিগর সহায়ক</span>
          <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-emerald-500 sm:hidden" />
        </button>
      ) : null}

      {isOpen ? (
        <section
          id="karigor-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="karigor-chat-title"
          className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[60] flex h-[min(620px,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 sm:inset-x-auto sm:right-6 sm:w-[420px]"
        >
          <header className="flex items-start justify-between gap-3 bg-brand px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Sparkles aria-hidden="true" size={20} />
              </span>
              <div className="min-w-0">
                <h2
                  id="karigor-chat-title"
                  className="truncate text-sm font-bold"
                >
                  কারিগর সহায়ক
                </h2>
                <p className="truncate text-[11px] text-blue-100">
                  কাজ ও এলাকা বলুন, কারিগর খুঁজে দেব
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {isCustomer && messages.length ? (
                <button
                  type="button"
                  onClick={resetChat}
                  disabled={sendMessage.isPending}
                  aria-label="নতুন চ্যাট শুরু করুন"
                  title="নতুন চ্যাট"
                  className="flex size-8 items-center justify-center rounded-lg text-blue-100 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <RotateCcw aria-hidden="true" size={16} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="চ্যাট বন্ধ করুন"
                className="flex size-8 items-center justify-center rounded-lg text-blue-100 transition hover:bg-white/10 hover:text-white"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
          </header>

          {session.isPending ? (
            <PanelCenter>
              <LoaderCircle
                aria-hidden="true"
                className="size-7 animate-spin text-brand"
              />
              <p className="text-sm text-slate-500">অ্যাকাউন্ট যাচাই হচ্ছে...</p>
            </PanelCenter>
          ) : session.isError ? (
            <PanelCenter>
              <CircleAlert aria-hidden="true" className="size-8 text-red-500" />
              <p className="font-bold text-brand">অ্যাকাউন্ট যাচাই করা যায়নি</p>
              <p className="max-w-xs text-sm leading-6 text-slate-500">
                ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={() => void session.refetch()}
                className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 font-bold text-white"
              >
                আবার চেষ্টা করুন
              </button>
            </PanelCenter>
          ) : !user ? (
            <PanelCenter>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-accent">
                <Sparkles aria-hidden="true" size={26} />
              </span>
              <h3 className="text-lg font-bold text-brand">কারিগর সহায়ক</h3>
              <p className="max-w-xs text-sm leading-6 text-slate-600">
                চ্যাট করে আপনার কাজ ও এলাকা বলুন, উপযুক্ত কারিগর খুঁজে নিন। চ্যাট ব্যবহার করতে
                লগইন করুন।
              </p>
              <Link
                href="/login"
                className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 font-bold text-white"
              >
                লগইন করুন
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-accent"
              >
                নতুন অ্যাকাউন্ট খুলুন
              </Link>
            </PanelCenter>
          ) : user.role !== "CUSTOMER" ? (
            <PanelCenter>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand">
                <MessageCircle aria-hidden="true" size={26} />
              </span>
              <h3 className="text-lg font-bold text-brand">
                শুধু গ্রাহক অ্যাকাউন্টের জন্য
              </h3>
              <p className="max-w-xs text-sm leading-6 text-slate-600">
                এই চ্যাট সহায়তা গ্রাহকদের তাদের কাজের জন্য উপযুক্ত কারিগর খুঁজতে সাহায্য করে।
              </p>
              <Link
                href="/dashboard"
                className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 font-bold text-white"
              >
                ড্যাশবোর্ডে যান
              </Link>
            </PanelCenter>
          ) : (
            <>
              <div
                ref={scrollRef}
                aria-live="polite"
                aria-relevant="additions"
                className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4"
              >
                {messages.length ? (
                  messages.map((message) => (
                    <ChatMessageBubble key={message.id} message={message} />
                  ))
                ) : (
                  <ChatWelcome
                    onPick={(suggestion) => submitMessage(suggestion)}
                    disabled={sendMessage.isPending}
                  />
                )}

                {sendMessage.isPending ? <TypingIndicator /> : null}

                {chatError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-700"
                  >
                    <p>{chatErrorMessage(chatError)}</p>
                    {getApiErrorStatus(chatError) === 401 ? (
                      <Link
                        href="/login"
                        className="mt-2 inline-flex font-bold underline underline-offset-2"
                      >
                        লগইন করুন
                      </Link>
                    ) : lastFailedMessage ? (
                      <button
                        type="button"
                        onClick={() => submitMessage(lastFailedMessage, false)}
                        disabled={sendMessage.isPending}
                        className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-red-200 bg-white px-3 font-bold text-red-700 disabled:opacity-50"
                      >
                        আবার চেষ্টা করুন
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t border-slate-100 bg-white p-3"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 transition focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10">
                  <textarea
                    ref={inputRef}
                    value={input}
                    aria-label="আপনার বার্তা"
                    onChange={(event) =>
                      setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))
                    }
                    onKeyDown={handleInputKeyDown}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={1}
                    placeholder="যেমন: মিরপুরে প্লাম্বার দরকার"
                    className="max-h-28 min-h-9 flex-1 resize-none overflow-y-auto bg-transparent py-1.5 text-sm leading-6 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sendMessage.isPending}
                    aria-label="বার্তা পাঠান"
                    className={cn(
                      "mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-dark",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {sendMessage.isPending ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="animate-spin"
                        size={17}
                      />
                    ) : (
                      <Send aria-hidden="true" size={17} />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 px-1 text-[11px] text-slate-400">
                  Enter দিয়ে পাঠান · Shift + Enter দিয়ে নতুন লাইন
                </p>
              </form>
            </>
          )}
        </section>
      ) : null}
    </>
  );
}
