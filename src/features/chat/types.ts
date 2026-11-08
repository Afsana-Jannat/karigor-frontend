export type ChatTechnician = {
  id: string;
  name: string;
  skills: string[];
  areas: string[];
  experienceYears: number;
  ratingAvg: number;
  ratingCount: number;
  isAvailableNow: boolean;
  rateMin: number | null;
  rateMax: number | null;
};

export type ChatResponse = {
  sessionId: string;
  answer: string;
  technicians: ChatTechnician[];
};

export type SendChatMessageInput = {
  message: string;
  sessionId?: string;
};

export type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      technicians: ChatTechnician[];
    };
