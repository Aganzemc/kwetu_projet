import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
type Profile = any;
type Group = any;
type Message = any;
import { Send, Users, Plus, Phone, Video, Paperclip, Smile, MoreVertical, Circle } from 'lucide-react';

type ChatType = 'user' | 'group';

interface ActiveChat {
  type: ChatType;
  id: string;
  name: string;
  avatar?: string | null;
  isOnline?: boolean;
}

export default function Chat() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchGroups();
      subscribeToUsers();
      subscribeToMessages();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    const data = await api.listProfiles();
    setUsers((data || []).filter((p: any) => p.id !== user?.id));
  };

  const fetchGroups = async () => {
    const data = await api.listGroups();
    setGroups(data || []);
  };

  const fetchMessages = async () => {
    if (!activeChat || !user) return;

    const data = await api.listMessages(
      activeChat.type === 'user' ? { peerId: activeChat.id } : { groupId: activeChat.id }
    );
    setMessages(data || []);
  };

  const subscribeToUsers = () => {
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  };

  const subscribeToMessages = () => {
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChat || !user) return;

    setLoading(true);
    const messageData: any = {
      sender_id: user.id,
      content: messageInput,
      message_type: 'text'
    };

    if (activeChat.type === 'user') {
      messageData.recipient_id = activeChat.id;
    } else {
      messageData.group_id = activeChat.id;
    }

    await api.sendMessage(messageData);

    setMessageInput('');
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !user) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `chat-files/${fileName}`;

    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/uploads`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      body: form
    });
    const { url: publicUrl } = await res.json();

    const messageData: any = {
        sender_id: user.id,
        content: `Sent a file: ${file.name}`,
        message_type: 'file',
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type
      };

      if (activeChat.type === 'user') {
        messageData.recipient_id = activeChat.id;
      } else {
        messageData.group_id = activeChat.id;
      }

    await api.sendMessage(messageData);

    setLoading(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Users</h3>
            </div>
            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setActiveChat({
                    type: 'user',
                    id: u.id,
                    name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.id,
                    avatar: u.profile_photo_url,
                    isOnline: u.is_online
                  })}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeChat?.id === u.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      {u.profile_photo_url && (
                        <img src={u.profile_photo_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    {u.is_online && (
                      <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate">
                      {`${u.first_name || ''} ${u.last_name || ''}`.trim() || 'User'}
                    </p>
                    <p className={`text-xs ${activeChat?.id === u.id ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'}`}>
                      {u.is_online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Groups</h3>
              <button className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveChat({
                    type: 'group',
                    id: g.id,
                    name: g.name,
                    avatar: g.avatar_url
                  })}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeChat?.id === g.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    {g.avatar_url ? (
                      <img src={g.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Users className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate">{g.name}</p>
                    <p className={`text-xs ${activeChat?.id === g.id ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'}`}>
                      Group
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  {activeChat.avatar && (
                    <img src={activeChat.avatar} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{activeChat.name}</h2>
                  {activeChat.type === 'user' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activeChat.isOnline ? 'Online' : 'Offline'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      {msg.message_type === 'file' && msg.file_url && (
                        <a
                          href={msg.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 underline mb-1"
                        >
                          <Paperclip className="w-4 h-4" />
                          {msg.file_name}
                        </a>
                      )}
                      <p className="break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 transition-colors">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || loading}
                  className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
