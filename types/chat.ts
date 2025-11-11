// types/chat.ts
export type Message = {
  text: string;
  sender: 'user' | 'ai';
};