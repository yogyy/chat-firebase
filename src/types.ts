export interface ChatTypes {
  createdAt: { nanoseconds: number; seconds: number };
  messages: Array<{
    createdAt: { nanoseconds: number; seconds: number };
    senderId: string;
    text: string;
    img?: string | null;
  }>;
}
export interface MessageType {
  chatId: string;
  isSeen: boolean;
  lastMessage: string;
  receiverId: string;
  updatedAt: number;
}

export interface UserType {
  avatar: string;
  blocked: string[];
  email: string;
  id: string;
  username: string;
}
