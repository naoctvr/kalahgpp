import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
    Send,
    Search,
    ArrowLeft,
    Paperclip,
    Smile,
    Check,
    CheckCheck,
    Clock,
    MessageSquare,
    MoreVertical
} from 'lucide-react';
import clsx from 'clsx';

const Chat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileView, setMobileView] = useState('contacts');

    const location = useLocation();

    // --- FETCH & SORT CONTACTS ---
    const fetchContacts = async () => {
        if (!user?.id) return;
        const res = await api.getContacts(user.id);
        if (res.success) {
            // Normalize field names (backend returns snake_case or camelCase)
            const normalized = res.data.map(c => ({
                ...c,
                lastMessage: c.lastMessage || c.lastmessage || '',
                lastMessageTime: c.lastMessageTime || c.lastmessagetime || null,
                unreadCount: Number(c.unreadCount || c.unreadcount || 0),
            }));
            // SMART SORTING: Unread first, then newest message
            const sortedContacts = normalized.sort((a, b) => {
                // Unread messages bubble to top
                if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
                // Then sort by latest message time
                const dateA = new Date(a.lastMessageTime || 0);
                const dateB = new Date(b.lastMessageTime || 0);
                return dateB - dateA;
            });
            setContacts(sortedContacts);
        }
        setLoading(false);
    };

    // --- HANDLE INITIAL NAVIGATION (Fix for looping redirect) ---
    useEffect(() => {
        if (location.state?.targetContactId && contacts.length > 0 && !activeChat) {
            const target = contacts.find(c => c.id === location.state.targetContactId);
            if (target) {
                setActiveChat(target);
                setMobileView('messages'); // langsung buka room di mobile
                // Clear state to prevent re-opening on refresh
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, contacts]); // Logic decoupled from polling

    useEffect(() => {
        fetchContacts();
        const interval = setInterval(fetchContacts, 3000); // Poll contacts every 3s
        return () => clearInterval(interval);
    }, [user]); // Removed location.state dependency

    // --- FETCH MESSAGES ---
    useEffect(() => {
        let interval;
        if (activeChat && user?.id) {
            const fetchMessages = async () => {
                const res = await api.getMessages(user.id, activeChat.id);
                if (res.success) {
                    // Only update if data is different (simple length check or deep compare could be better, 
                    // but React state update usually handles shallow equality if referentially same. 
                    // API returns new array reference, so we need to be careful).
                    setMessages(res.data);
                }
            };

            fetchMessages(); // Initial fetch
            interval = setInterval(fetchMessages, 3000); // Poll messages every 3s

            // Mark as read logic
            const markAsRead = async () => {
                await api.markMessagesRead(user.id, activeChat.id);
                // Update local contacts state to remove badge immediately
                setContacts(prev => prev.map(c =>
                    c.id === activeChat.id ? { ...c, unreadCount: 0 } : c
                ));
            };
            markAsRead();
        }
        return () => clearInterval(interval);
    }, [activeChat, user]);

    // --- SCROLL TO BOTTOM (Fix for aggressive scrolling) ---
    // Track the last message ID to verify if we actually have new content
    const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lastMessageId]); // Only scroll when the *last message* changes, not on every poll update

    // Auto-focus input when chat opens
    useEffect(() => {
        if (activeChat) {
            inputRef.current?.focus();
        }
    }, [activeChat]);

    // --- SEND MESSAGE ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const tempMessage = {
            id: Date.now(),
            sender_id: user.id,
            receiver_id: activeChat.id,
            content: newMessage,
            created_at: new Date().toISOString(),
            is_temp: true
        };

        // Optimistic Update
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        // API Call
        const res = await api.sendMessage(user.id, activeChat.id, tempMessage.content);
        if (res.success) {
            fetchContacts(); // Refresh contact list to update last message preview
        } else {
            console.error("Failed to send message");
        }
    };

    // --- HELPERS ---
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const formatName = (contact) => {
        if (contact.role === 'expert') {
            return `dr. ${contact.name}${contact.title_degree ? `, ${contact.title_degree}` : ''}`;
        }
        return contact.name;
    };

    const isUserOnline = (dateString) => {
        if (!dateString) return false;
        const lastActive = new Date(dateString);
        const now = new Date();
        const diffMinutes = (now - lastActive) / 1000 / 60;
        return diffMinutes < 5; // Online if active within last 5 minutes
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContactSelect = (contact) => {
        setActiveChat(contact);
        setMobileView('messages');
    };

    const handleBackToContacts = () => {
        setMobileView('contacts');
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 p-4 pb-[72px] md:p-6 md:pb-6 flex items-center justify-center" style={{ height: '100%' }}>
            {/* FLOATING CARD CONTAINER */}
            <div className="w-full h-full max-w-7xl bg-white rounded-2xl shadow-xl overflow-hidden flex border border-slate-200">

                {/* --- SIDEBAR (CONTACT LIST) --- */}
                <div className={`${mobileView === 'contacts' ? 'flex' : 'hidden'} md:flex w-full md:w-[380px] bg-white border-r border-slate-100 flex-col`}>
                    {/* Header */}
                    <div className="p-5 border-b border-slate-50">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Pesan & Konsultasi</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari dokter atau pasien..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => handleContactSelect(contact)}
                                    className={clsx(
                                        "flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-slate-50 hover:bg-slate-50",
                                        activeChat?.id === contact.id ? "bg-blue-50/50 border-r-4 border-r-blue-500" : "border-r-4 border-r-transparent"
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className={clsx(
                                            "w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shadow-sm",
                                            contact.unreadCount > 0
                                                ? "bg-blue-500 text-white"
                                                : activeChat?.id === contact.id
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-slate-100 text-slate-500"
                                        )}>
                                            {contact.name.charAt(0)}
                                        </div>
                                        {isUserOnline(contact.last_active_at) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className={clsx(
                                                "text-sm truncate",
                                                contact.unreadCount > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                                            )}>
                                                {formatName(contact)}
                                            </h3>
                                            <span className={clsx(
                                                "text-[10px] font-medium shrink-0 ml-2",
                                                contact.unreadCount > 0 ? "text-blue-600 font-bold" : "text-slate-400"
                                            )}>
                                                {formatTime(contact.lastMessageTime)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <p className={clsx(
                                                "text-xs truncate",
                                                contact.unreadCount > 0 ? "font-semibold text-slate-700" : "text-slate-400"
                                            )}>
                                                {contact.lastMessage || "Mulai percakapan baru"}
                                            </p>
                                            {contact.unreadCount > 0 && (
                                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
                                                    {contact.unreadCount > 9 ? '9+' : contact.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400">
                                <p className="text-sm">Tidak ada kontak ditemukan.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- CHAT AREA --- */}
                <div className={`${mobileView === 'messages' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-slate-50/30 relative`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <button onClick={handleBackToContacts} className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-full">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200">
                                        {activeChat.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold text-slate-800 text-sm">{formatName(activeChat)}</h3>
                                        <div className="flex items-center gap-1">
                                            {isUserOnline(activeChat.last_active_at) ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                    <p className="text-xs text-emerald-600 font-medium">Online</p>
                                                </>
                                            ) : (
                                                <p className="text-xs text-slate-400">
                                                    {activeChat.last_active_at
                                                        ? `Terakhir ${new Date(activeChat.last_active_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                                                        : 'Offline'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    const currentDate = new Date(msg.created_at).setHours(0, 0, 0, 0);
                                    const prevDate = idx > 0 ? new Date(messages[idx - 1].created_at).setHours(0, 0, 0, 0) : null;
                                    const showDateHeader = !prevDate || currentDate !== prevDate;

                                    let dateLabel = '';
                                    if (showDateHeader) {
                                        const now = new Date().setHours(0, 0, 0, 0);
                                        const yesterday = new Date(now - 86400000).getTime();

                                        if (currentDate === now) {
                                            dateLabel = 'Hari Ini';
                                        } else if (currentDate === yesterday) {
                                            dateLabel = 'Kemarin';
                                        } else {
                                            dateLabel = new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                                        }
                                    }

                                    return (
                                        <React.Fragment key={idx}>
                                            {showDateHeader && (
                                                <div className="flex justify-center my-4">
                                                    <span className="bg-slate-200/50 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                        {dateLabel}
                                                    </span>
                                                </div>
                                            )}
                                            <div key={idx} className={clsx("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                                <div className={clsx(
                                                    "max-w-[85%] md:max-w-[70%] lg:max-w-[60%] rounded-2xl px-3 py-2 shadow-sm relative group transition-all",
                                                    isMe
                                                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none"
                                                        : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                                                )}>
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    <div className={clsx(
                                                        "text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70",
                                                        isMe ? "text-blue-100" : "text-slate-400"
                                                    )}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMe && <CheckCheck size={12} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 pb-safe bg-white border-t border-slate-100" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                                    <button type="button" className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                        <Paperclip size={20} />
                                    </button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            ref={inputRef}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Ketik pesan konsultasi..."
                                            className="w-full py-3 min-h-[44px] pl-5 pr-12 bg-slate-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                                        />
                                        <button type="button" className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-amber-500 transition-colors">
                                            <Smile size={20} />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-3.5 min-w-[44px] min-h-[44px] bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
                                    >
                                        <Send size={20} className={newMessage.trim() ? "ml-0.5" : ""} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* EMPTY STATE */
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                                <MessageSquare size={48} className="text-blue-500 opacity-50" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang di Telemedicine</h2>
                            <p className="text-slate-500 max-w-md leading-relaxed">
                                Pilih percakapan dari daftar di sebelah kiri untuk melihat riwayat medis dan memulai konsultasi dengan dokter spesialis.
                            </p>
                            <div className="mt-8 flex gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Aman</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
                                <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Terenkripsi</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
                                <span className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Profesional</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
