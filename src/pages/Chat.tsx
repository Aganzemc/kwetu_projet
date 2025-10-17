import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
type Profile = any;
type Group = any;
type Message = any;
import { Send, Users, Plus, Phone, Video, Paperclip, Smile, MoreVertical, Circle, Menu, ArrowLeft } from 'lucide-react';
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
  const [addListOpen, setAddListOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [lastByUser, setLastByUser] = useState<Record<string, any>>({});
  const [lastByGroup, setLastByGroup] = useState<Record<string, any>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth < 768;

  // Fermer la sidebar quand on sélectionne une conversation sur mobile
  useEffect(() => {
    if (activeChat && isMobile) {
      setSidebarOpen(false);
    }
  }, [activeChat, isMobile]);

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Vérifier au chargement initial
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const resolveSenderName = (senderId: string | number) => {
    if (String(senderId) === String(user?.id)) return 'You';
    const fromUsers = users.find((x: any) => String(x.id) === String(senderId))?.name;
    const fromGroup = groupMembers.find((x: any) => String(x.id) === String(senderId))?.name;
    return fromUsers || fromGroup || String(senderId);
  };

  const handleAddMemberByUser = async (userId: number | string) => {
    if (!activeChat || activeChat.type !== 'group') return;
    try {
      await api.groups.addMember(activeChat.id, Number(userId));
      const res = await api.groups.members(activeChat.id);
      setGroupMembers(res?.data || []);
      setAddListOpen(false);
      setMoreOpen(false);
      alert('Membre ajouté');
    } catch (e: any) {
      alert(e?.message || 'Failed to add member');
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
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const fetchConversations = async () => {
    try {
      const data = await api.conversations.list();
      const items = data?.data || [];
      const u: Record<string, any> = {};
      const g: Record<string, any> = {};
      for (const c of items) {
        if (c.type === 'private') u[String(c.id)] = c;
        else if (c.type === 'group') g[String(c.id)] = c;
      }
      setLastByUser(u);
      setLastByGroup(g);
    } catch {}
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
    const list = (data?.data) || [];
    setMessages(list);
    // Marquer comme lus les messages reçus non lus
    try {
      const unread = list.filter((m: any) => String(m.senderId) !== String(user.id) && !m.readAt);
      // Option simple: appels individuels
      await Promise.all(unread.map((m: any) => api.messages.markRead(m.id)));
    } catch {}
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

  const formatDateOrTime = (timestamp: string) => {
    const d = new Date(timestamp);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                      {/* avatar placeholder a */}
                    </div>
                    {u.isOnline && (
                      <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate">
                      {u.name || 'User'}
                    </p>
                    {(() => {
                      const last = lastByUser[String(u.id)];
                      if (!last) return (
                        <p className={`text-xs ${activeChat?.id === u.id ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'}`}>
                          {u.isOnline ? 'Online' : 'Offline'}
                        </p>
                      );
                      const senderName = String(last.lastSenderId) === String(user?.id)
                        ? 'You'
                        : (users.find((x: any) => String(x.id) === String(last.lastSenderId))?.name || '');
                      return (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {senderName ? senderName + ': ' : ''}{last.lastMessage}
                        </p>
                      );
                    })()}
                  </div>
                  {(() => {
                    const last = lastByUser[String(u.id)];
                    if (!last) return null;
                    return (
                      <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">{formatDateOrTime(last.lastAt)}</span>
                    );
                  })()}
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
                    {(() => {
                      const last = lastByGroup[String(g.id)];
                      if (!last) return (
                        <p className={`text-xs ${activeChat?.id === g.id ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'}`}>Group</p>
                      );
                      const senderName = String(last.lastSenderId) === String(user?.id)
                        ? 'You'
                        : (users.find((x: any) => String(x.id) === String(last.lastSenderId))?.name || '');
                      return (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {senderName ? senderName + ': ' : ''}{last.lastMessage}
                        </p>
                      );
                    })()}
                  </div>
                  {(() => {
                    const last = lastByGroup[String(g.id)];
                    if (!last) return null;
                    return (
                      <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">{formatDateOrTime(last.lastAt)}</span>
                    );
                  })()}
                </button>
              ))}
      </div>
    </div>

    
  </div>
  </div>

  {/* Chat Area */}
  <div className={`flex-1 flex flex-col transition-all duration-300 ${
    sidebarOpen ? 'ml-0 md:ml-0' : 'ml-0'
  }`}>
    {activeChat ? (
      <>
        {/* Chat Header */}
        <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <button 
              onClick={() => isMobile ? setSidebarOpen(true) : null}
              className="md:hidden mr-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="relative">
              <img 
                src={activeChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=random`} 
                alt={activeChat.name}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              />
              {activeChat.isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-xs">
                {activeChat.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {activeChat.isOnline ? 'En ligne' : 'Hors ligne'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2">
            <button 
              className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title="Appel vocal"
            >
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title="Appel vidéo"
            >
              <Video className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setMoreOpen(!moreOpen)}
                className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="Plus d'options"
              >
                <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                  {activeChat.type === 'group' && (
                    <>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation();
                          setAddListOpen((v) => !v);
                          setMoreOpen(false);
                        }} 
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Ajouter un membre
                      </button>
                      {addListOpen && (
                        <div className="px-3 pb-2">
                          <input
                            value={addSearch}
                            onChange={(e) => setAddSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="max-h-48 overflow-auto -mx-1">
                            {users
                              .filter((u) => !groupMembers.some((m) => String(m.id) === String(u.id)))
                              .filter((u) => (u.name || u.email || '').toLowerCase().includes(addSearch.toLowerCase()))
                              .slice(0, 5)
                              .map((u) => (
                                <button
                                  key={u.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddMemberByUser(u.id);
                                    setAddListOpen(false);
                                    setMoreOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                  {u.name || u.email || u.id}
                                </button>
                              ))}
                            {users.filter((u) => !groupMembers.some((m) => String(m.id) === String(u.id))).length === 0 && (
                              <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">Aucun utilisateur disponible</div>
                            )}
                          </div>
                        </div>
                      )}
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation();
                          setMoreOpen(false);
                          alert('Paramètres du groupe bientôt disponibles'); 
                        }} 
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Paramètres du groupe
                      </button>
                      {(() => {
                        const groupMeta = groups.find((g) => String(g.id) === String(activeChat.id));
                        const isCreator = groupMeta && String(groupMeta.creatorId) === String(user?.id);
                        if (isCreator) return null;
                        return (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              setMoreOpen(false);
                              handleLeaveGroup(); 
                            }} 
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Quitter le groupe
                          </button>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 dark:bg-gray-900"
          onClick={() => setMoreOpen(false)}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-md rounded-lg px-3 py-2 ${
                  message.senderId === user?.id
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="break-words text-sm md:text-base">{message.content}</p>
                <div className="flex justify-end items-center mt-1 space-x-1">
                  <span className={`text-xs ${
                    message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.senderId === user?.id && (
                    <span className="text-xs">
                      {message.readAt ? '✓✓' : message.deliveredAt ? '✓' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={activeChat.type === 'group' && !groupMembers.some((m) => String(m.id) === String(user?.id)) ? 'You are not a member of this group' : 'Type a message'}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={(() => {
              const isGroup = activeChat.type === 'group';
              const isMember = isGroup ? groupMembers.some((m) => String(m.id) === String(user?.id)) : true;
              return loading || (isGroup && !isMember);
            })()}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm md:text-base bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeChat.type === 'group' && !groupMembers.some((m) => String(m.id) === String(user?.id)) ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          />        
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
