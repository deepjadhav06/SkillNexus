import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { mockService } from '../services/mockService';
import { ChatWindow } from '../components/ChatWindow';

interface MessagesProps {
  user: User;
}

export const Messages: React.FC<MessagesProps> = ({ user }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [openChat, setOpenChat] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const loadConversations = async () => {
    const convs = await mockService.getAllChatsForUser(user.id);
    setConversations(convs.sort((a, b) => b.timestamp - a.timestamp));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">Messages</h1>
        <p className="text-slate-600 dark:text-slate-400">Chat with your skill swap partners</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No conversations yet</h3>
          <p className="text-slate-600 dark:text-slate-400">Accept skill swap requests to start chatting with partners</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conv) => (
            <div
              key={conv.swapId}
              onClick={() => setOpenChat(conv.swapId)}
              className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {conv.otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{conv.otherUserName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(conv.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{conv.lastMessage}</p>
                </div>
                <div className="ml-4">
                  <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {openChat && (() => {
        const conv = conversations.find(c => c.swapId === openChat);
        if (!conv) return null;

        return (
          <ChatWindow
            swapId={openChat}
            currentUserId={user.id}
            currentUserName={user.name}
            otherUserName={conv.otherUserName}
            onClose={() => setOpenChat(null)}
          />
        );
      })()}
    </div>
  );
};
