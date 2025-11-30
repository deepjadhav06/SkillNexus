import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { mockService } from '../services/mockService';

interface ChatWindowProps {
  swapId: string;
  currentUserId: string;
  currentUserName: string;
  otherUserName: string;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  swapId,
  currentUserId,
  currentUserName,
  otherUserName,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, [swapId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const msgs = await mockService.getChatMessages(swapId);
    setMessages(msgs);
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await mockService.sendMessage(swapId, currentUserId, currentUserName, newMessage);
      setNewMessage('');
      await loadMessages();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-96 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-950 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white">{otherUserName}</h3>
          <p className="text-xs text-indigo-100">Online</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
        {isLoading ? (
          <div className="text-center text-slate-400 py-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm">
            <p>Start your conversation!</p>
            <p className="text-xs mt-2">Exchange information about the skill swap</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === currentUserId
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                <p className="text-xs font-semibold mb-1">
                  {msg.senderName === currentUserName ? 'You' : msg.senderName}
                </p>
                <p className="text-sm break-words">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === currentUserId ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full p-2 font-bold transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
            title="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
