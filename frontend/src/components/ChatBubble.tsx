import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareText, X, Send, Sparkles, ShieldCheck, Headphones, Loader2 } from 'lucide-react';
import { chatService, type ChatMessage } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

export const ChatBubble: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Guest session ID
  const getGuestId = () => {
    let id = localStorage.getItem('fs_guest_chat_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('fs_guest_chat_id', id);
    }
    return id;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (silent = false) => {
    if (!silent) setIsLoadingHistory(true);
    try {
      const guestId = !isAuthenticated ? getGuestId() : undefined;
      const data = await chatService.getCustomerMessages(guestId);
      setMessages(data);

      // Check unread replies from Staff or Admin
      const unreadReplies = data.filter(
        (m) => (m.senderRole === 'ROLE_STAFF' || m.senderRole === 'ROLE_ADMIN') && !m.isRead
      );
      setUnreadBadge(unreadReplies.length);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      if (!silent) setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (!isOpen) return;
    fetchMessages(true);
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadBadge(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      const guestId = !isAuthenticated ? getGuestId() : undefined;
      const conversationId = isAuthenticated && user ? `customer_${user.id}` : guestId;

      await chatService.sendMessage({
        channelType: 'CUSTOMER_SUPPORT',
        conversationId,
        content: text,
        senderName: user ? user.fullName : 'Khách hàng',
        senderEmail: user ? user.email : '',
      });

      setInputMessage('');
      await fetchMessages(true);
      scrollToBottom();
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    '👗 Tư vấn chọn size đồ',
    '📦 Thời gian giao hàng bao lâu?',
    '🎁 Shop có voucher giảm giá nào không?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-3 px-4 py-3.5 rounded-full bg-slate-900 text-white shadow-2xl hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          aria-label="Mở khung trò chuyện hỗ trợ"
        >
          <div className="relative">
            <MessageSquareText className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-semibold text-sm hidden sm:inline">Hỗ trợ trực tuyến</span>

          {unreadBadge > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
              {unreadBadge}
            </span>
          )}
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  Fashion Store Support
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  Nhân viên & Admin đang sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
            {/* Welcome card */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-xs">
              <p className="font-semibold mb-1">👋 Xin chào quý khách!</p>
              <p className="text-slate-600 leading-relaxed">
                Đội ngũ chăm sóc khách hàng và Quản trị viên của Fashion Store luôn túc trực để hỗ trợ tư vấn chọn size, chất liệu và đơn hàng.
              </p>
            </div>

            {/* Quick Questions */}
            {messages.length === 0 && (
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Gợi ý câu hỏi nhanh:
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoadingHistory && messages.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderRole === 'ROLE_CUSTOMER' || msg.senderRole === 'GUEST';
                const isStaff = msg.senderRole === 'ROLE_STAFF';
                const isAdmin = msg.senderRole === 'ROLE_ADMIN';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            <ShieldCheck className="w-3 h-3" />
                            Quản trị viên ({msg.senderName})
                          </span>
                        ) : isStaff ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            <Headphones className="w-3 h-3" />
                            Nhân viên ({msg.senderName})
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-slate-900 text-white rounded-br-none shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                disabled={isSending}
                className="flex-1 px-3.5 py-2.5 bg-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-400 transition"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isSending || !inputMessage.trim()}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            {!isAuthenticated && (
              <p className="text-[10px] text-slate-400 text-center mt-2">
                💡 <span className="font-medium text-indigo-600">Đăng nhập</span> để đồng bộ tin nhắn vào tài khoản của bạn.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
