import api from './api';

export type ChatChannelType = 'CUSTOMER_SUPPORT' | 'INTERNAL';

export interface ChatMessage {
  id: number;
  channelType: ChatChannelType;
  conversationId: string;
  senderId?: number;
  senderName: string;
  senderEmail?: string;
  senderRole: 'ROLE_CUSTOMER' | 'ROLE_STAFF' | 'ROLE_ADMIN' | 'GUEST';
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatThread {
  conversationId: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface SendMessagePayload {
  channelType?: ChatChannelType;
  conversationId?: string;
  content: string;
  senderName?: string;
  senderEmail?: string;
}

export const chatService = {
  // Send message
  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>('/api/chat/send', payload);
    return response.data;
  },

  // Customer get message history
  async getCustomerMessages(guestId?: string): Promise<ChatMessage[]> {
    const params = guestId ? { guestId } : {};
    const response = await api.get<ChatMessage[]>('/api/chat/customer', { params });
    return response.data;
  },

  // Staff / Admin get customer threads list
  async getCustomerThreads(): Promise<ChatThread[]> {
    const response = await api.get<ChatThread[]>('/api/chat/threads');
    return response.data;
  },

  // Staff / Admin get specific customer conversation
  async getThreadMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/api/chat/thread/${conversationId}`);
    return response.data;
  },

  // Staff / Admin get internal messages
  async getInternalMessages(): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>('/api/chat/internal');
    return response.data;
  },

  // Mark customer thread as read
  async markThreadRead(conversationId: string): Promise<void> {
    await api.patch(`/api/chat/thread/${conversationId}/read`);
  },
};
