import { requestApi } from "@/lib/apiClient";
import type { ChatResponse, SendChatMessageInput } from "./types";

export const sendChatMessage = ({ message, sessionId }: SendChatMessageInput) =>
  requestApi<ChatResponse>("chat", {
    method: "POST",
    body: sessionId ? { message, sessionId } : { message },
  });
