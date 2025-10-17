import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
type Profile = any;
type Group = any;
type Message = any;
import { Send, Users, Plus, Phone, Video, Paperclip, Smile, MoreVertical, Circle } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
// realtime disabled

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
  const [groupMembers, setGroupMembers] = useState<Profile[]>([]);
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleDeleteGroup = async () => {
    if (!activeChat || activeChat.type !== 'group') return;
    if (!confirm('Are you sure you want to delete this group? This cannot be undone.')) return;
    try {
      await api.groups.delete(activeChat.id);
      await fetchGroups();
      setActiveChat(null);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeChat || activeChat.type !== 'group') return;
    if (!confirm('Quit this group?')) return;
    try {
      await api.groups.leave(activeChat.id);
      await fetchGroups();
      setActiveChat(null);
    } catch (e: any) {
      alert(e?.message || 'Failed to leave group');
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchGroups();
      subscribeToUsers();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat]);

  // Load members when a group is selected
  useEffect(() => {
    const loadMembers = async () => {
      if (activeChat?.type !== 'group') {
        setGroupMembers([]);
        return;
      }
      const res = await api.groups.members(activeChat.id);
      setGroupMembers(res?.data || []);
    };
    loadMembers();
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;
    const interval = setInterval(() => {
      fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddMember = async () => {
    if (!activeChat || activeChat.type !== 'group') return;
    const name = selectedMemberName?.trim() || prompt('Entrez le nom du membre à ajouter (exact)') || '';
    if (!name.trim()) return;
    try {
      // Chercher par nom parmi la liste des utilisateurs connus (hors soi)
      const candidate = users.find((u) => (u.name || '').toLowerCase() === name.toLowerCase());
      if (!candidate) {
        alert('Utilisateur introuvable par ce nom. Vérifiez la casse ou créez l’utilisateur.');
        return;
      }
      await api.groups.addMember(activeChat.id, Number(candidate.id));
      // Refresh members list
      const res = await api.groups.members(activeChat.id);
      setGroupMembers(res?.data || []);
      setSelectedMemberName('');
      alert('Membre ajouté');
    } catch (e: any) {
      alert(e?.message || 'Failed to add member');
    }
  };

  const fetchUsers = async () => {
    const data = await api.listProfiles();
    const list = data?.data || [];
    setUsers(list.filter((p: any) => String(p.id) !== String(user?.id)));
  };

  const fetchGroups = async () => {
    const data = await api.listGroups();
    setGroups((data?.data) || []);
  };

  const handleCreateGroup = async () => {
    const name = prompt('Group name');
    if (!name || !name.trim()) return;
    try {
      await api.groups.create(name.trim());
      await fetchGroups();
    } catch (e: any) {
      alert(e?.message || 'Failed to create group');
    }
  };

  const fetchMessages = async () => {
    if (!activeChat || !user) return;
    const data = await api.messages.list(
      activeChat.type === 'user' ? { peerId: activeChat.id } : { groupId: activeChat.id }
    );
    setMessages((data?.data) || []);
  };

  const subscribeToUsers = () => {
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  };

  // messaging polling disabled

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChat || !user) return;
    // UI guard: only group members can send to a group
    if (activeChat.type === 'group') {
      const isMember = groupMembers.some((m) => String(m.id) === String(user.id));
      if (!isMember) return;
    }

    setLoading(true);
    const payload: any = { content: messageInput };
    if (activeChat.type === 'user') payload.recipientId = Number(activeChat.id);
    if (activeChat.type === 'group') payload.groupId = Number(activeChat.id);
    await api.messages.send(payload);
    await fetchMessages();

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
              {users.map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => setActiveChat({
                    type: 'user',
                    id: String(u.id),
                    name: u.name || String(u.id),
                    avatar: undefined,
                    isOnline: Boolean(u.isOnline)
                  })}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeChat?.id === u.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      {/* avatar placeholder */}
                    </div>
                    {u.isOnline && (
                      <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate">
                      {u.name || 'User'}
                    </p>
                    <p className={`text-xs ${activeChat?.id === u.id ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'}`}>
                      {u.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Groups</h3>
              <button onClick={handleCreateGroup} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors">
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
              <div className="flex items-center gap-3 md:gap-4">
                {activeChat.type === 'group' && (
                  <div className="flex items-center gap-2">
                    <input
                      list="candidate-users"
                      value={selectedMemberName}
                      onChange={(e) => setSelectedMemberName(e.target.value)}
                      placeholder="Add member by name"
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                    />
                    <datalist id="candidate-users">
                      {users
                        .filter((u) => !groupMembers.some((m) => String(m.id) === String(u.id)))
                        .map((u) => (
                          <option key={u.id} value={u.name || u.email || String(u.id)} />
                        ))}
                    </datalist>
                    <button onClick={handleAddMember} className="px-3 py-1 text-sm rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition">
                      Add
                    </button>
                    {(() => {
                      const groupMeta = groups.find((g) => String(g.id) === String(activeChat.id));
                      const isCreator = groupMeta && String(groupMeta.creatorId) === String(user?.id);
                      if (!isCreator) return null;
                      return (
                        <button onClick={handleDeleteGroup} className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition">
                          Delete group
                        </button>
                      );
                    })()}
                  </div>
                )}
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                  <Video className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMoreOpen((v) => !v)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                      {activeChat.type === 'group' && (
                        <>
                          <button onClick={() => { setMoreOpen(false); handleAddMember(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Add member</button>
                          <button onClick={() => { setMoreOpen(false); alert('Group settings coming soon'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Group settings</button>
                          {(() => {
                            const groupMeta = groups.find((g) => String(g.id) === String(activeChat.id));
                            const isCreator = groupMeta && String(groupMeta.creatorId) === String(user?.id);
                            if (isCreator) return null;
                            return (
                              <button onClick={() => { setMoreOpen(false); handleLeaveGroup(); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Leave group</button>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-2">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.type === 'group' && groupMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {groupMembers.map((m) => (
                    <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      {m.name || m.email || m.id}
                    </span>
                  ))}
                </div>
              )}
              {messages.map((msg) => {
                const isOwn = String(msg.senderId) === String(user?.id);
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(msg.createdAt)}
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
                {(() => {
                  const isGroup = activeChat.type === 'group';
                  const isMember = isGroup ? groupMembers.some((m) => String(m.id) === String(user?.id)) : true;
                  return (
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isGroup && !isMember ? 'You must be a member to send messages' : 'Type a message...'}
                      disabled={isGroup && !isMember}
                      className={`flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors ${
                        isGroup && !isMember ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                  );
                })()}
                <button
                  onClick={sendMessage}
                  disabled={(() => {
                    const isGroup = activeChat.type === 'group';
                    const isMember = isGroup ? groupMembers.some((m) => String(m.id) === String(user?.id)) : true;
                    return !messageInput.trim() || loading || (isGroup && !isMember);
                  })()}
                  className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {activeChat.type === 'group' && !groupMembers.some((m) => String(m.id) === String(user?.id)) && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">You are not a member of this group. Ask an admin/member to add you.</p>
              )}
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
