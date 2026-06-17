import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, History as HistoryIcon, MessageSquare, Calendar, AlertTriangle, Phone, Check, X, Clock, Plus, MapPin, Sparkles, Lock, Crown } from 'lucide-react';
import { Card, Badge, Button, cn } from '../components/ui/Widgets';
import BioNetwork from '../components/visuals/BioNetwork';
import { ScoreCard, AQICard, ProfileMiniCard } from '../components/ui/DashboardWidgets';
import BreathingWidget from '../components/dashboard/BreathingWidget';
import DailyTestModal from '../components/modals/DailyTestModal';
import BookingModal from '../components/modals/BookingModal';
import UpgradeModal from '../components/modals/UpgradeModal';
import ConsultationCard from '../components/dashboard/ConsultationCard';
import NotificationCard from '../components/dashboard/NotificationCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DashboardUser = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isPremium = user?.is_premium || user?.isPremium;

    // State
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        userName: '',
        userProfile: {},
        latestScore: null,
        history: []
    });
    const [appointments, setAppointments] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestMessage, setLatestMessage] = useState(null);
    const [aqiData, setAqiData] = useState({ aqi: 0, city: 'Memuat...', pm25: 0, co: 0 });

    // Modals
    const [showTestModal, setShowTestModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        if (user?.id) {
            try {
                // 1. Dashboard Data
                const response = await fetch(`${API_BASE}/dashboard/${user.id}`);
                const result = await response.json();

                if (result.success) {
                    setDashboardData(result.data);
                    if (result.data.latestScore === null) {
                        setShowTestModal(true);
                    }
                }

                // 2. Appointments
                const apptRes = await api.getPatientAppointments(user.id);
                if (apptRes.success) setAppointments(apptRes.data);

                // 3. Contacts / Notifications
                const contactsRes = await api.getContacts(user.id);
                if (contactsRes.success) {
                    const sorted = contactsRes.data.sort((a, b) => new Date(b.lastmessagetime || b.lastMessageTime || 0) - new Date(a.lastmessagetime || a.lastMessageTime || 0));

                    // Hanya tampilkan jika ada pesan yang belum dibaca
                    const priorityContact = sorted.find(c => (c.unreadcount || c.unreadCount) > 0);

                    if (priorityContact) {
                        setLatestMessage({
                            ...priorityContact,
                            sender_name: priorityContact.role === 'expert'
                                ? `dr. ${priorityContact.name}${priorityContact.title_degree ? `, ${priorityContact.title_degree}` : ''}`
                                : priorityContact.name,
                            content: priorityContact.lastmessage || priorityContact.lastMessage,
                            contact_id: priorityContact.id
                        });
                    } else {
                        setLatestMessage(null);
                    }

                    const totalUnread = sorted.reduce((acc, curr) => acc + (Number(curr.unreadcount || curr.unreadCount) || 0), 0);
                    setUnreadCount(totalUnread);
                }

                // 4. AQI (Auto-fetch if location allowed)
                fetchAQI();

            } catch (error) {
                console.error("Failed to fetch dashboard", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const fetchAQI = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const res = await api.getAQI(pos.coords.latitude, pos.coords.longitude);
                if (res.success) setAqiData(res.data);
            }, (err) => console.log("Loc error", err));
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Poll pesan baru setiap 5 detik
    useEffect(() => {
        if (!user?.id) return;

        const fetchMessages = async () => {
            const contactsRes = await api.getContacts(user.id);
            if (contactsRes.success) {
                const sorted = contactsRes.data.sort((a, b) => new Date(b.lastmessagetime || b.lastMessageTime || 0) - new Date(a.lastmessagetime || a.lastMessageTime || 0));
                const priorityContact = sorted.find(c => (c.unreadcount || c.unreadCount) > 0);
                if (priorityContact) {
                    setLatestMessage({
                        ...priorityContact,
                        sender_name: priorityContact.role === 'expert'
                            ? `dr. ${priorityContact.name}${priorityContact.title_degree ? `, ${priorityContact.title_degree}` : ''}`
                            : priorityContact.name,
                        content: priorityContact.lastmessage || priorityContact.lastMessage,
                        contact_id: priorityContact.id
                    });
                } else {
                    setLatestMessage(null);
                }
                const totalUnread = sorted.reduce((acc, curr) => acc + (Number(curr.unreadcount || curr.unreadCount) || 0), 0);
                setUnreadCount(totalUnread);
            }
        };

        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const handleTestComplete = async (score) => {
        await api.saveScore(user.id, score);
        setDashboardData(prev => ({ ...prev, latestScore: score }));
        setShowTestModal(false);
    };

    const handleConsultationSuccess = () => {
        fetchData();
    };

    const handleCancelAppointment = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin membatalkan janji ini?')) {
            const res = await api.cancelAppointment(id);
            if (res.success) fetchData();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">

            <DailyTestModal
                isOpen={showTestModal}
                onClose={() => setShowTestModal(false)}
                onComplete={handleTestComplete}
            />

            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                userId={user.id}
                history={dashboardData.history}
                onSuccess={handleConsultationSuccess}
            />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onSuccess={() => {
                    fetchData();
                    window.location.reload();
                }}
            />

            <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-4 md:space-y-6">

                {/* --- ROW 1: HERO SECTION --- */}
                <div className="grid grid-cols-12 gap-4 md:gap-6">
                    <div className="col-span-12">
                        <Card className="relative min-h-[200px] md:min-h-[400px] bg-slate-900 border-none text-white overflow-hidden flex flex-col justify-center p-6 md:p-10 shadow-2xl shadow-slate-900/20 rounded-3xl">
                            <BioNetwork />
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">
                                <div className="space-y-3 md:space-y-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {user?.is_premium ? (
                                            <Badge variant="teal" className="bg-gradient-to-r from-amber-500/20 to-teal-500/20 text-teal-300 border border-teal-500/40 backdrop-blur-sm px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm font-bold flex items-center gap-1.5 animate-pulse">
                                                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> RESPIRA PRO AKTIF
                                            </Badge>
                                        ) : (
                                            <>
                                                <Badge variant="secondary" className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm">
                                                    FREE PLAN
                                                </Badge>
                                                <button
                                                    onClick={() => setShowUpgradeModal(true)}
                                                    className="text-[11px] md:text-xs text-teal-400 hover:text-teal-300 font-bold underline transition"
                                                >
                                                    Upgrade ke Pro ⚡
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight">
                                            Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{dashboardData.userName}</span>
                                        </h1>
                                        <p className="hidden md:block text-slate-300 text-lg max-w-xl leading-relaxed">
                                            Sistem RESPIRA siap membantu. Pantau kesehatan paru Anda. Lakukan diagnosa lengkap jika merasakan <strong className="text-white">nyeri dada, batuk persisten, atau keluhan fisik lainnya.</strong>
                                        </p>
                                        <p className="md:hidden text-slate-400 text-sm leading-relaxed">
                                            Pantau kesehatan paru-paru Anda hari ini.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => navigate('/diagnosa')}
                                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-none px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg shadow-lg shadow-cyan-500/25 rounded-xl w-fit"
                                    >
                                        <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                                        Mulai Diagnosa
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* --- MOBILE: Horizontal scroll metrics strip (iOS Health style) --- */}
                <div className="md:hidden -mx-4 px-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
                         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {/* Lung Score compact */}
                        <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <p className="text-xs text-slate-400 mb-1">Skor Paru</p>
                            <p className="text-3xl font-bold text-slate-800">{dashboardData.latestScore || 0}</p>
                            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                                     style={{ width: `${dashboardData.latestScore || 0}%` }} />
                            </div>
                            <p className="text-xs text-teal-600 font-medium mt-1">
                                {(dashboardData.latestScore || 0) >= 70 ? 'Baik' : 'Perlu Perhatian'}
                            </p>
                        </div>

                        {/* AQI compact */}
                        <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <p className="text-xs text-slate-400 mb-1">Kualitas Udara</p>
                            <p className="text-3xl font-bold text-slate-800">{aqiData.aqi}</p>
                            <p className="text-xs text-slate-500 mt-1 truncate">{aqiData.city}</p>
                            <p className="text-xs font-medium mt-1"
                               style={{ color: aqiData.aqi <= 50 ? '#10b981' : aqiData.aqi <= 100 ? '#f59e0b' : '#ef4444' }}>
                                {aqiData.aqi <= 50 ? 'Baik' : aqiData.aqi <= 100 ? 'Sedang' : 'Buruk'}
                            </p>
                        </div>

                        {/* Chat notification compact */}
                        <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer active:bg-slate-50 relative"
                             onClick={() => {
                                 if (!isPremium) { setShowUpgradeModal(true); return; }
                                 navigate('/chat', { state: latestMessage ? { targetContactId: latestMessage.contact_id } : undefined });
                             }}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-slate-400">Pesan</p>
                                {!isPremium && (
                                    <span className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Lock className="w-2.5 h-2.5 text-amber-600" />
                                    </span>
                                )}
                                {isPremium && unreadCount > 0 && (
                                    <span className="w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
                                )}
                            </div>
                            {!isPremium ? (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mb-2">
                                        <Crown className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <p className="text-xs font-bold text-amber-700">Pro Only</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Upgrade untuk chat</p>
                                </>
                            ) : latestMessage ? (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mb-2">
                                        {latestMessage.sender_name?.charAt(0) || '?'}
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">{latestMessage.sender_name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-tight">{latestMessage.content || latestMessage.lastMessage || 'Tidak ada pesan'}</p>
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-7 h-7 text-slate-200 mb-2" />
                                    <p className="text-xs font-medium text-slate-500">Mulai Chat</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Konsultasi dokter</p>
                                </>
                            )}
                        </div>

                        {/* Appointment compact */}
                        {(() => {
                            const nextAppt = appointments.filter(a => new Date(a.requested_date) >= new Date() && a.status !== 'rejected')[0];
                            return (
                                <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer active:bg-slate-50"
                                     onClick={() => {
                                         if (!isPremium) { setShowUpgradeModal(true); return; }
                                         nextAppt ? navigate('/konsultasi') : setShowBookingModal(true);
                                     }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-slate-400">Konsultasi</p>
                                        {!isPremium && (
                                            <span className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center">
                                                <Lock className="w-2.5 h-2.5 text-amber-600" />
                                            </span>
                                        )}
                                    </div>
                                    {!isPremium ? (
                                        <>
                                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
                                                <Crown className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <p className="text-xs font-bold text-amber-700">Pro Only</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Upgrade untuk booking</p>
                                        </>
                                    ) : nextAppt ? (
                                        <>
                                            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center mb-2">
                                                <Calendar className="w-4 h-4 text-teal-600" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">
                                                {new Date(nextAppt.requested_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(nextAppt.requested_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                            </p>
                                            <span className={`text-[10px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded-full ${nextAppt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {nextAppt.status === 'approved' ? 'Dikonfirmasi' : 'Menunggu'}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                                                <Plus className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <p className="text-xs font-medium text-blue-600">Buat Janji</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Dengan dokter spesialis</p>
                                        </>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* --- DESKTOP: BENTO METRICS (3 Columns) --- */}
                <div className="hidden md:grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-6 lg:col-span-4 h-[250px]">
                        <ScoreCard score={dashboardData.latestScore || 0} />
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-4 h-[250px]">
                        <AQICard data={aqiData} onRefresh={fetchAQI} />
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-4 h-[250px]">
                        <ProfileMiniCard
                            profile={dashboardData.userProfile}
                            name={dashboardData.userName}
                            email={user?.email}
                            onEdit={() => navigate('/profile')}
                            isPremium={user?.is_premium || user?.isPremium}
                            onUpgrade={() => setShowUpgradeModal(true)}
                        />
                    </div>
                </div>

                {/* --- MOBILE: Riwayat ringkas langsung --- */}
                <div className="md:hidden">
                    <Card className="p-4 bg-white border-slate-100 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <HistoryIcon className="w-4 h-4 text-slate-400" />
                                Riwayat Diagnosa
                            </h3>
                            <Link to="/riwayat" className="text-xs font-semibold text-blue-600 whitespace-nowrap">
                                Lihat Semua →
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {dashboardData.history.slice(0, 2).map((log) => (
                                <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                        log.confidence_score >= 75 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                                    )}>
                                        <Activity size={14} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-800 text-xs leading-tight truncate">{log.final_result}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded-full shrink-0",
                                        log.confidence_score >= 75 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {log.confidence_score >= 75 ? "Tinggi" : "Normal"}
                                    </span>
                                </div>
                            ))}
                            {dashboardData.history.length === 0 && (
                                <p className="text-center text-slate-400 text-xs py-4">Belum ada riwayat diagnosa.</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* --- MOBILE: Breathing Widget compact --- */}
                <div className="md:hidden">
                    <BreathingWidget />
                </div>

                {/* --- ROW 3: ACTIONS & HISTORY (Desktop only full version) --- */}
                <div className="hidden md:grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-4 h-full min-h-[400px]">
                        <BreathingWidget />
                    </div>
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto">
                            <NotificationCard
                                message={latestMessage}
                                onReply={() => navigate('/chat', {
                                    state: { targetContactId: latestMessage?.contact_id }
                                })}
                            />
                            <ConsultationCard
                                appointment={appointments.filter(a => new Date(a.requested_date) >= new Date().setHours(0, 0, 0, 0) && a.status !== 'rejected')[0] || null}
                                onBookNew={() => setShowBookingModal(true)}
                                onCancel={handleCancelAppointment}
                            />
                        </div>
                        <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl">
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <HistoryIcon className="w-5 h-5 text-slate-400" />
                                    Riwayat Diagnosa Terkini
                                </h3>
                                <Link to="/riwayat" className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0">
                                    Lihat Semua →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {dashboardData.history.slice(0, 3).map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                                                log.confidence_score >= 75 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                                            )}>
                                                <Activity size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{log.final_result}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0",
                                            log.confidence_score >= 75 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {log.confidence_score >= 75 ? "Tinggi" : "Normal"}
                                        </div>
                                    </div>
                                ))}
                                {dashboardData.history.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 text-sm">
                                        Belum ada riwayat diagnosa.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* --- ROW 4: EMERGENCY --- */}
                <div className="grid grid-cols-12">
                    <div className="col-span-12">
                        <Card className="p-1 bg-gradient-to-r from-red-500 to-rose-600 border-none shadow-lg shadow-red-500/20 rounded-3xl">
                            <div className="bg-white rounded-[20px] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-5 h-5 md:w-7 md:h-7 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm md:text-lg">Butuh Bantuan Darurat?</h3>
                                        <p className="text-xs md:text-sm text-slate-500 hidden md:block max-w-lg">
                                            Jangan ragu untuk mencari pertolongan jika Anda mengalami gejala kritis seperti sesak napas berat.
                                        </p>
                                    </div>
                                </div>
                                <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white border-none px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base rounded-xl shadow-lg shadow-red-500/30">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Panggil Ambulans
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </div >
    );
};

export default DashboardUser;
