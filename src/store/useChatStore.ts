import { create } from 'zustand';
import type { ChatMessage } from '../types/models';

interface ChatState {
  messages: ChatMessage[];
  isSending: boolean;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSending: (value: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isSending: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setSending: (isSending) => set({ isSending }),
}));
