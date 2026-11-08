"use client";

import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "./api";

// Chat errors are shown inside the panel, so this mutation does not toast.
export const useSendChatMessage = () =>
  useMutation({
    mutationFn: sendChatMessage,
  });
