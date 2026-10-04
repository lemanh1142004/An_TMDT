import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Headphones, 
  Send, 
  Search, 
  Loader2,
  Inbox
} from 'lucide-react';
import { chatService, type ChatMessage, type ChatThread } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

interface AdminStaffChatPanelProps {
  userRole: 'ROLE_ADMIN' | 'ROLE_STAFF';
}

export const AdminStaffChatPanel: React.FC<AdminStaffChatPanelProps> = ({ userRole }) => {
  const { user } = useAuth();
  const isAdmin = userRole === 'ROLE_ADMIN';

  // Sub-tabs: 'CUSTOMER' (Khách hàng) vs 'INTERNAL' (Admin <-> Staff)
  const [activeSubTab, setActiveSubTab] = useState<'CUSTOMER' | 'INTERNAL'>('CUSTOMER');

  // Customer threads state
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerReply, setCustomerReply] = useState('');
  const [isSendingCustomer, setIsSendingCustomer] = useState(false);

  // Internal messages state
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([]);
  const [internalInput, setInternalInput] = useState('');
  const [isSendingInternal, setIsSendingInternal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const internalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    internalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch threads for Customer Support
  const fetchThreads = async (_silent = false) => {
    try {
      const data = await chatService.getCustomerThreads();
      setThreads(data);
      if (!selectedThreadId && data.length > 0) {
        setSelectedThreadId(data[0].conversationId);
      }
    } catch (err) {
      console.error('Failed to fetch threads:', err);
    }
  };

  // Fetch messages for selected customer thread
  const fetchSelectedThreadMessages = async (convId: string, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const msgs = await chatService.getThreadMessages(convId);
      setThreadMessages(msgs);
      await chatService.markThreadRead(convId);
    } catch (err) {
      console.error('Failed to fetch thread messages:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Fetch internal messages (Staff <-> Admin)
  const fetchInternalMessages = async (_silent = false) => {
    try {
      const msgs = await chatService.getInternalMessages();
      setInternalMessages(msgs);
    } catch (err) {
      console.error('Failed to fetch internal messages:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchThreads();
    fetchInternalMessages();
  }, []);

  // Polling for real-time synchronization every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSubTab === 'CUSTOMER') {
        fetchThreads(true);
        if (selectedThreadId) {
          fetchSelectedThreadMessages(selectedThreadId, true);
        }
      } else {
        fetchInternalMessages(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSubTab, selectedThreadId]);

  // Load messages when selecting a thread
  useEffect(() => {
    if (selectedThreadId) {
      fetchSelectedThreadMessages(selectedThreadId);
    }
  }, [selectedThreadId]);

  // Auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [threadMessages, internalMessages]);

  // Send reply to customer
  const handleSendCustomerReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerReply.trim() || !selectedThreadId || isSendingCustomer) return;

    setIsSendingCustomer(true);
    try {
      await chatService.sendMessage({
        channelType: 'CUSTOMER_SUPPORT',
        conversationId: selectedThreadId,
        content: customerReply.trim(),
        senderName: user?.fullName || (isAdmin ? 'Quản trị viên' : 'Nhân viên'),
        senderEmail: user?.email || '',
      });
      setCustomerReply('');
      await fetchSelectedThreadMessages(selectedThreadId, true);
      await fetchThreads(true);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send customer reply:', err);
    } finally {
      setIsSendingCustomer(false);
    }
  };

  // Send message in internal channel (Staff <-> Admin)
  const handleSendInternalMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalInput.trim() || isSendingInternal) return;

    setIsSendingInternal(true);
    try {
      await chatService.sendMessage({
        channelType: 'INTERNAL',
        content: internalInput.trim(),
        senderName: user?.fullName || (isAdmin ? 'Quản trị viên' : 'Nhân viên'),
        senderEmail: user?.email || '',
      });
      setInternalInput('');
      await fetchInternalMessages(true);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send internal message:', err);
    } finally {
      setIsSendingInternal(false);
    }
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.customerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(customerSearch.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const currentSelectedThread = threads.find((t) => t.conversationId === selectedThreadId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[720px]">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" /> Trung Tâm Tin Nhắn & Hỗ Trợ Khách Hàng
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isAdmin ? 'Quản trị hội thoại & Giao tiếp nội bộ' : 'Kênh tư vấn khách hàng & Liên hệ Admin'}
          </h2>
        </div>

        {/* 2 Sub-Tabs as requested: Khách hàng & Admin/Nhân viên */}
        <div className="flex bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSubTab('CUSTOMER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'CUSTOMER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Khách hàng ({threads.length})</span>
            {threads.some((t) => t.unreadCount > 0) && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('INTERNAL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'INTERNAL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            {isAdmin ? <Users className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{isAdmin ? 'Nhân viên (Nội bộ)' : 'Admin (Quản trị viên)'}</span>
          </button>
        </div>
      </div>

      {/* ==================== SUB-TAB 1: KHÁCH HÀNG (CUSTOMER SUPPORT) ==================== */}
      {activeSubTab === 'CUSTOMER' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Customer Threads List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 bg-slate-50 flex flex-col h-full">
            {/* Search Box */}
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm khách hàng hoặc tin nhắn..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Thread Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Chưa có cuộc trò chuyện khách hàng nào
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = thread.conversationId === selectedThreadId;
                  return (
                    <button
                      key={thread.conversationId}
                      onClick={() => setSelectedThreadId(thread.conversationId)}
                      className={`w-full p-3.5 text-left transition flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {thread.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {thread.customerName}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(thread.lastMessageTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {thread.lastMessage}
                        </p>
                        {thread.customerEmail && (
                          <span className="text-[10px] text-indigo-600 font-mono block truncate mt-0.5">
                            {thread.customerEmail}
                          </span>
                        )}
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation Message History */}
          <div className="flex-1 flex flex-col h-full bg-white">
            {selectedThreadId && currentSelectedThread ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 px-5 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {currentSelectedThread.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        {currentSelectedThread.customerName}
                        <span className="text-[11px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-mono">
                          {currentSelectedThread.conversationId}
                        </span>
                      </h3>
                      {currentSelectedThread.customerEmail && (
                        <p className="text-xs text-slate-500">{currentSelectedThread.customerEmail}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Admin & Staff cùng nhìn thấy</span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/50">
                  {isLoading && threadMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                  ) : (
                    threadMessages.map((msg) => {
                      const isCustomer = msg.senderRole === 'ROLE_CUSTOMER' || msg.senderRole === 'GUEST';
                      const isMsgAdmin = msg.senderRole === 'ROLE_ADMIN';
                      const isMe = msg.senderEmail === user?.email;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            {isCustomer ? (
                              <span className="text-[11px] font-bold text-slate-700">
                                {msg.senderName} (Khách hàng)
                              </span>
                            ) : isMsgAdmin ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                <ShieldCheck className="w-3 h-3" />
                                Quản trị viên ({msg.senderName}) {isMe && '• Bạn'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                <Headphones className="w-3 h-3" />
                                Nhân viên ({msg.senderName}) {isMe && '• Bạn'}
                              </span>
                            )}
                          </div>

                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                              isCustomer
                                ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                : isMe
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-white rounded-br-none'
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

                {/* Reply Form */}
                <form
                  onSubmit={handleSendCustomerReply}
                  className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`Trả lời ${currentSelectedThread.customerName} (với tư cách ${
                      isAdmin ? 'Quản trị viên' : 'Nhân viên tư vấn'
                    })...`}
                    value={customerReply}
                    onChange={(e) => setCustomerReply(e.target.value)}
                    disabled={isSendingCustomer}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={isSendingCustomer || !customerReply.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                  >
                    {isSendingCustomer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Gửi</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">Chọn một khách hàng ở danh sách bên trái để xem cuộc trò chuyện</p>
                <p className="text-slate-400 mt-1">Cả Nhân viên và Quản trị viên đều có thể theo dõi và phản hồi khách hàng cùng lúc.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: NỘI BỘ (STAFF <-> ADMIN) ==================== */}
      {activeSubTab === 'INTERNAL' && (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50">
          {/* Header Bar */}
          <div className="p-3.5 px-5 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                {isAdmin ? <Users className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">
                  {isAdmin
                    ? 'Kênh chỉ đạo & Trao đổi nội bộ với Nhân viên vận hành (Staff)'
                    : 'Kênh báo cáo & Trao đổi trực tiếp với Quản trị viên (Admin)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Bảo mật nội bộ • Cập nhật tiến độ đơn hàng, sự cố kho vận và phê duyệt
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Kênh Nội Bộ
            </span>
          </div>

          {/* Internal Message Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {internalMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Chưa có trao đổi nội bộ nào. Hãy gửi tin nhắn đầu tiên!
              </div>
            ) : (
              internalMessages.map((msg) => {
                const isMsgAdmin = msg.senderRole === 'ROLE_ADMIN';
                const isMe = msg.senderEmail === user?.email;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {isMsgAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          <ShieldCheck className="w-3 h-3" />
                          Quản trị viên ({msg.senderName}) {isMe && '• Bạn'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <Headphones className="w-3 h-3" />
                          Nhân viên ({msg.senderName}) {isMe && '• Bạn'}
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : isMsgAdmin
                          ? 'bg-purple-50 text-purple-900 border border-purple-200 rounded-bl-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
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
            <div ref={internalEndRef} />
          </div>

          {/* Internal Input Box */}
          <form
            onSubmit={handleSendInternalMessage}
            className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                isAdmin
                  ? 'Nhập chỉ đạo hoặc phản hồi cho Nhân viên...'
                  : 'Nhập báo cáo hoặc thắc mắc gửi tới Quản trị viên (Admin)...'
              }
              value={internalInput}
              onChange={(e) => setInternalInput(e.target.value)}
              disabled={isSendingInternal}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white border border-transparent focus:border-purple-400 transition"
            />
            <button
              type="submit"
              disabled={isSendingInternal || !internalInput.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
            >
              {isSendingInternal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Gửi tin nhắn</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
