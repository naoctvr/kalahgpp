import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    Brain,
    AlertCircle,
    Search,
    FileText,
    Bell,
    MessageSquare,
    Calendar,
    Check,
    X,
    Clock,
    User,
    Filter,
    CheckCircle,
    History
} from 'lucide-react';
import { Card, Badge, Button, cn } from '../components/ui/Widgets';
import NotificationCard from '../components/dashboard/NotificationCard';
import BioNetwork from '../components/visuals/BioNetwork';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PrescribeMedicationModal from '../components/modals/PrescribeMedicationModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DashboardExpert = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isMedModalOpen, setIsMedModalOpen] = useState(false);
    
    const [stats, setStats] = useState({
        total_users: 0,
        total_diagnoses: 0,
        emergency_count: 0,
        alerts: []
    });
    const [appointments, setAppointments] = useState([]);
    const [diagnosisHistory, setDiagnosisHistory] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestMessage, setLatestMessage] = useState(null);
    const [filterSeverity, setFilterSeverity] = useState('all'); // all, gawat, waspada, stabil
    const [showFilter, setShowFilter] = useState(false);

    const fetchData = async () => {
        try {
            // Fetch Stats
            const statsRes = await fetch(`${API_BASE}/admin/stats`);
            const statsData = await statsRes.json();
            if (statsData.success) {
                setStats(prev => ({ ...prev, ...statsData.data }));
            }

            // Fetch Appointments (For Widget)
            if (user?.id) {
                const apptRes = await api.getExpertAppointments(user.id);
                if (apptRes.success) {
                    setAppointments(apptRes.data);
                }
            }

            // Fetch All Diagnosis History (For Table)
            const historyRes = await api.getAllDiagnosisHistory();
            if (historyRes.success) {
                setDiagnosisHistory(historyRes.data);
            }

            // 4. Contacts / Notifications
            if (user?.id) {
                const contactsRes = await api.getContacts(user.id);
                if (contactsRes.success) {
                    const sorted = contactsRes.data.sort((a, b) =>
                        new Date(b.lastmessagetime || b.lastMessageTime || 0) - new Date(a.lastmessagetime || a.lastMessageTime || 0)
                    );

                    // Hanya tampilkan jika ada pesan yang belum dibaca
                    const priorityContact = sorted.find(c => (c.unreadcount || c.unreadCount) > 0);

                    if (priorityContact) {
                        setLatestMessage({
                            ...priorityContact,
                            sender_name: priorityContact.name,
                            content: priorityContact.lastmessage || priorityContact.lastMessage,
                            contact_id: priorityContact.id
                        });
                    } else {
                        setLatestMessage(null);
                    }

                    const totalUnread = sorted.reduce((acc, curr) => acc + (Number(curr.unreadcount || curr.unreadCount) || 0), 0);
                    setUnreadCount(totalUnread);
                }
            }

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleAppointmentResponse = async (id, status) => {
        const res = await api.respondAppointment(id, status, status === 'approved' ? 'Jadwal dikonfirmasi.' : 'Maaf, jadwal penuh.');
        if (res.success) fetchData();
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

    const getSeverity = (result) => {
        if (!result) return 'stabil';
        if (result.includes('GAWAT DARURAT') || result.includes('Bahaya') || result.includes('Segera')) return 'gawat';
        if (result.includes('Suspek') || result.includes('Eksaserbasi')) return 'waspada';
        return 'stabil';
    };

    // Derived Data for Widgets
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const nextAppointment = appointments
        .filter(a => (a.status === 'approved' || a.status === 'pending') && new Date(a.requested_date) >= new Date())
        .sort((a, b) => new Date(a.requested_date) - new Date(b.requested_date))[0] || null;

    // Fix: Calculate Critical Patients based on assigned appointments only
    const myEmergencyCount = appointments.filter(a => {
        const severity = getSeverity(a.diagnosis_result);
        return severity === 'gawat' && (a.status === 'pending' || a.status === 'approved');
    }).length;

    const filteredDiagnosisHistory = diagnosisHistory.filter(item => {
        const severity = getSeverity(item.diagnosis_result);
        return filterSeverity === 'all' || severity === filterSeverity;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-4 md:space-y-6">

                {/* --- ROW 1: HERO SECTION (Unified Design) --- */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                        <Card className="relative min-h-[200px] md:min-h-[350px] bg-slate-900 border-none text-white overflow-hidden flex flex-col justify-center p-6 md:p-10 shadow-2xl shadow-slate-900/20 rounded-3xl">
                            <BioNetwork />
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">
                                <div className="space-y-3 md:space-y-6">
                                    <Badge variant="teal" className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm">
                                        EXPERT DASHBOARD
                                    </Badge>
                                    <div>
                                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight">
                                            Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">dr. {user?.name || 'User'}</span>
                                        </h1>
                                        <p className="hidden md:block text-slate-300 text-lg max-w-xl leading-relaxed">
                                            Anda memiliki <strong className="text-white">{pendingCount} Permintaan Baru</strong> dan <strong className="text-white">{stats.emergency_count || 0} Kasus Kritis</strong> yang membutuhkan perhatian.
                                        </p>
                                        <p className="md:hidden text-slate-400 text-sm leading-relaxed">
                                            {pendingCount} permintaan baru · {stats.emergency_count || 0} kasus kritis
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 md:gap-4">
                                        <Button
                                            onClick={() => navigate('/expert/knowledge')}
                                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-none px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg shadow-lg shadow-cyan-500/25 rounded-xl w-fit"
                                        >
                                            <Search className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                                            Mulai Riset AI
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* --- MOBILE: Horizontal scroll metrics strip --- */}
                <div className="md:hidden -mx-4 px-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
                         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {/* Pasien Kritis compact */}
                        <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <p className="text-xs text-slate-400 mb-1">Pasien Kritis</p>
                            <p className="text-3xl font-bold text-red-600">{stats.emergency_count || 0}</p>
                            <p className="text-xs text-red-500 font-medium mt-1">Butuh penanganan</p>
                        </div>
                        {/* Total Diagnosa compact */}
                        <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <p className="text-xs text-slate-400 mb-1">Total Diagnosa</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.total_diagnoses}</p>
                            <p className="text-xs text-emerald-600 font-medium mt-1">+8% minggu ini</p>
                        </div>
                        {/* Permintaan Masuk compact */}
                        <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <p className="text-xs text-slate-400 mb-1">Permintaan</p>
                            <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                            <p className="text-xs text-amber-600 font-medium mt-1">Menunggu respons</p>
                        </div>
                        {/* Pesan compact */}
                        <div className="snap-start shrink-0 w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer active:bg-slate-50"
                             onClick={() => navigate('/chat', { state: latestMessage ? { targetContactId: latestMessage.contact_id } : undefined })}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-slate-400">Pesan</p>
                                {unreadCount > 0 && (
                                    <span className="w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
                                )}
                            </div>
                            {latestMessage ? (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mb-2">
                                        {latestMessage.sender_name?.charAt(0) || '?'}
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">{latestMessage.sender_name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-tight">{latestMessage.content || 'Tidak ada pesan'}</p>
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-7 h-7 text-slate-200 mb-2" />
                                    <p className="text-xs font-medium text-slate-500">Mulai Chat</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Konsultasi pasien</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- DESKTOP: METRICS GRID (3 Columns) --- */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Emergency */}
                    <Card className="p-6 bg-gradient-to-br from-red-500 to-rose-600 text-white border-none shadow-lg shadow-red-500/20 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <AlertCircle size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xs font-bold text-red-100 uppercase tracking-wider">Pasien Kritis</h3>
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Activity size={16} />
                                </div>
                            </div>
                            <div className="text-4xl font-bold mb-1">{stats.emergency_count || 0}</div>
                            <p className="text-red-100 text-sm">Pasien butuh penanganan segera</p>
                        </div>
                    </Card>

                    {/* 2. Total Diagnoses */}
                    <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Diagnosa</h3>
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <Brain size={16} />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-slate-800 mb-1">{stats.total_diagnoses}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="text-emerald-500 font-bold flex items-center">
                                <Activity size={14} className="mr-1" /> +8%
                            </span>
                            minggu ini
                        </div>
                    </Card>

                    {/* 3. INCOMING REQUESTS (Replaces Validation) */}
                    <Card className="p-0 bg-white border-slate-100 shadow-sm rounded-3xl flex flex-col h-auto md:h-[200px] overflow-hidden">
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Permintaan Masuk</h3>
                            <Badge variant="warning" className="rounded-full px-2 bg-amber-100 text-amber-700 border-none">{pendingCount}</Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {appointments.filter(a => a.status === 'pending').length > 0 ? (
                                appointments.filter(a => a.status === 'pending').map(appt => (
                                    <div key={appt.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-teal-200 transition-colors shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
                                                <User size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">{appt.patient_name}</p>
                                                <p className="text-xs text-slate-400 truncate">
                                                    {new Date(appt.requested_date.replace(' ', 'T')).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(appt.requested_date.replace(' ', 'T')).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {appt.diagnosis_result && (
                                                    <p className="text-[10px] text-teal-600 font-medium mt-1 bg-teal-50 px-1.5 py-0.5 rounded inline-block truncate max-w-full">
                                                        {appt.diagnosis_result}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => handleAppointmentResponse(appt.id, 'approved')}
                                                className="w-7 h-7 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center hover:bg-teal-100 transition-colors"
                                                title="Terima"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleAppointmentResponse(appt.id, 'rejected')}
                                                className="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                                                title="Tolak"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <CheckCircle size={24} className="mb-2 opacity-20" />
                                    <p className="text-xs">Semua permintaan selesai.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* --- ROW 3: MAIN CONTENT (Grid 8:4) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: TICKET LIST (8 Cols) */}
                    <div className="lg:col-span-8 order-2 lg:order-1">
                        <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden min-h-[600px]">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-teal-500" />
                                    Riwayat Diagnosa Terbaru
                                </h3>
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`text-slate-500 ${filterSeverity !== 'all' ? 'bg-teal-50 text-teal-700' : ''}`}
                                        onClick={() => setShowFilter(!showFilter)}
                                    >
                                        <Filter size={16} className="mr-2" />
                                        {filterSeverity === 'all' ? 'Filter' : filterSeverity.toUpperCase()}
                                    </Button>

                                    {showFilter && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                                            <div className="p-1">
                                                {['all', 'gawat', 'waspada', 'stabil'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setFilterSeverity(type);
                                                            setShowFilter(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${filterSeverity === type ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        {type === 'all' ? 'Semua Status' : type.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-0">
                                {/* MOBILE: Card list view */}
                                <div className="md:hidden divide-y divide-slate-50">
                                    {filteredDiagnosisHistory.length > 0 ? (
                                        filteredDiagnosisHistory.slice(0, 6).map((log) => {
                                            const dateObj = new Date(log.requested_date.replace(' ', 'T'));
                                            const result = log.diagnosis_result || '';
                                            let badgeText = 'STABIL';
                                            let badgeClass = 'bg-blue-50 text-blue-600';
                                            if (result.includes('GAWAT DARURAT')) { badgeText = 'GAWAT'; badgeClass = 'bg-red-50 text-red-600'; }
                                            else if (result.includes('Suspek') || result.includes('Eksaserbasi')) { badgeText = 'WASPADA'; badgeClass = 'bg-amber-50 text-amber-600'; }
                                            return (
                                                <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-slate-50/80 transition-colors">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-teal-100 shrink-0">
                                                        {log.patient_name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                                            <p className="font-bold text-slate-800 text-sm truncate">{log.patient_name}</p>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>{badgeText}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-700 font-medium leading-snug line-clamp-2">{log.diagnosis_result || 'Tidak ada data'}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs text-slate-400">
                                                                {dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            {log.confidence_score && (
                                                                <span className="text-xs text-slate-400">· {log.confidence_score}%</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-12 text-center text-slate-400">
                                            <Activity size={32} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">Belum ada riwayat diagnosa.</p>
                                        </div>
                                    )}
                                </div>

                                {/* DESKTOP: Table view */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                                <th className="p-4 font-semibold w-[25%]">Pasien</th>
                                                <th className="p-4 font-semibold w-[20%]">Tanggal</th>
                                                <th className="p-4 font-semibold w-[30%]">Hasil Diagnosa</th>
                                                <th className="p-4 font-semibold w-[15%]">Akurasi</th>
                                                <th className="p-4 font-semibold text-center w-[10%]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredDiagnosisHistory.length > 0 ? (
                                                filteredDiagnosisHistory.slice(0, 6).map((log) => {
                                                    const dateObj = new Date(log.requested_date.replace(' ', 'T'));
                                                    return (
                                                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                                            <td className="p-4 align-top">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-teal-100">
                                                                        {log.patient_name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-800 text-sm">{log.patient_name}</p>
                                                                        <p className="text-xs text-slate-400 font-mono">#{log.id.toString().padStart(4, '0')}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-top">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm text-slate-700 font-medium">
                                                                        {dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                                        <Clock size={10} />
                                                                        {dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-top">
                                                                <p className="font-bold text-slate-800 text-sm leading-relaxed">{log.diagnosis_result || 'Tidak ada data'}</p>
                                                                <p className="text-xs text-slate-500 mt-1">Berdasarkan gejala fisik</p>
                                                            </td>
                                                            <td className="p-4 align-top">
                                                                {log.confidence_score ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                                            <span className="font-medium text-slate-700">{log.confidence_score}%</span>
                                                                        </div>
                                                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={cn("h-full rounded-full transition-all duration-500", log.confidence_score > 80 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-amber-400 to-amber-500")}
                                                                                style={{ width: `${log.confidence_score}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-center align-top">
                                                                {(() => {
                                                                    const result = log.diagnosis_result || '';
                                                                    let badgeVariant = 'default';
                                                                    let badgeText = 'INFO';
                                                                    let badgeClass = 'bg-slate-100 text-slate-600';
                                                                    if (result.includes('GAWAT DARURAT')) {
                                                                        badgeVariant = 'danger'; badgeText = 'GAWAT'; badgeClass = 'bg-red-50 text-red-600 border border-red-100';
                                                                    } else if (result.includes('Suspek') || result.includes('Eksaserbasi')) {
                                                                        badgeVariant = 'warning'; badgeText = 'WASPADA'; badgeClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                                                                    } else {
                                                                        badgeVariant = 'info'; badgeText = 'STABIL'; badgeClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                                                                    }
                                                                    return (
                                                                        <Badge variant={badgeVariant} className={`${badgeClass} shadow-sm px-2 py-0.5 text-[10px] font-bold tracking-wide`}>
                                                                            {badgeText}
                                                                        </Badge>
                                                                    );
                                                                })()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="p-12 text-center text-slate-400">
                                                        <Activity size={32} className="mx-auto mb-2 opacity-20" />
                                                        <p className="text-sm">Belum ada riwayat diagnosa.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: WIDGETS (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">

                        {/* JADWAL TERDEKAT */}
                        <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={100} className="text-teal-500" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Jadwal Terdekat</h3>
                            {nextAppointment ? (
                                <div>
                                    <div className="text-4xl font-bold text-slate-800 mb-1">
                                        {new Date(nextAppointment.requested_date.replace(' ', 'T')).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-lg text-slate-400 font-normal ml-2">WIB</span>
                                    </div>
                                    <p className="text-slate-500 mb-6">
                                        {new Date(nextAppointment.requested_date.replace(' ', 'T')).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{nextAppointment.patient_name}</p>
                                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{nextAppointment.diagnosis_result || 'Keluhan Umum'}</p>
                                            <span className={`text-[10px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded-full ${nextAppointment.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {nextAppointment.status === 'approved' ? 'Dikonfirmasi' : 'Menunggu'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-32 flex flex-col items-center justify-center text-slate-400">
                                    <Calendar size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">Tidak ada jadwal aktif.</p>
                                </div>
                            )}
                        </Card>

                        {/* NOTIFIKASI CHAT — desktop only */}
                        <div className="hidden md:block h-[250px]">
                            <NotificationCard
                                message={latestMessage}
                                onReply={() => navigate('/chat', {
                                    state: { targetContactId: latestMessage?.contact_id }
                                })}
                            />
                        </div>

                    </div>
                </div>

            </div>

            {/* Modal Resep Obat (Expert / Dokter Only) */}
            <PrescribeMedicationModal
                isOpen={isMedModalOpen}
                onClose={() => {
                    setIsMedModalOpen(false);
                    setSelectedPatient(null);
                }}
                patientId={selectedPatient?.id}
                patientName={selectedPatient?.name}
            />
        </div>
    );
};

export default DashboardExpert;
