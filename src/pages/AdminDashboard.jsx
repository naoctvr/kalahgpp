import React, { useState, useEffect } from 'react';
import { 
    Sparkles, Users, Crown, DollarSign, Search, Filter, 
    ArrowUpDown, ChevronDown, Check, X, Activity, 
    TrendingUp, UserCheck, UserX, Shield, Clock,
    BarChart3, Save, Plus, FileText, Bell, GitMerge, Brain, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../services/api';
import AdminNotificationDashboard from '../components/ui/AdminNotificationDashboard';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Overview state
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // User management state
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [premiumFilter, setPremiumFilter] = useState('all');
    const [togglingUser, setTogglingUser] = useState(null);

    // Logic state (existing)
    const [topic, setTopic] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedLogic, setGeneratedLogic] = useState(null);

    // Research Approvals state
    const [researchDrafts, setResearchDrafts] = useState([]);
    const [loadingResearch, setLoadingResearch] = useState(false);

    const fetchResearchDrafts = async () => {
        setLoadingResearch(true);
        try {
            const res = await api.getResearchDrafts(null, 'admin');
            if (res.success) {
                setResearchDrafts(res.drafts || []);
            }
        } catch (err) {
            console.error("Fetch research drafts error:", err);
        } finally {
            setLoadingResearch(false);
        }
    };

    // Fetch subscription stats
    const fetchStats = async () => {
        setLoadingStats(true);
        const res = await api.getSubscriptionStats();
        if (res.success) setStats(res.data);
        setLoadingStats(false);
    };

    // Fetch users
    const fetchUsers = async () => {
        setLoadingUsers(true);
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (roleFilter !== 'all') params.role = roleFilter;
        if (premiumFilter !== 'all') params.premium = premiumFilter;
        
        const res = await api.getAdminUsers(params);
        if (res.success) setUsers(res.data);
        setLoadingUsers(false);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'research') fetchResearchDrafts();
    }, [activeTab, roleFilter, premiumFilter]);

    // Debounce search
    useEffect(() => {
        if (activeTab !== 'users') return;
        const timer = setTimeout(() => fetchUsers(), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleTogglePremium = async (userId) => {
        setTogglingUser(userId);
        try {
            console.log("Toggling premium for user:", userId);
            const res = await api.toggleUserPremium(userId);
            console.log("Toggle premium result:", res);
            if (res.success) {
                fetchUsers();
                fetchStats(); // Refresh stats too
                alert(res.message || 'Status premium berhasil diperbarui!');
            } else {
                alert(res.message || 'Gagal memperbarui status premium.');
            }
        } catch (err) {
            console.error("Toggle Premium Error:", err);
            alert('Terjadi kesalahan koneksi saat memproses.');
        } finally {
            setTogglingUser(null);
        }
    };

    const handleReviewResearch = async (draftId, action) => {
        if (!window.confirm(`Apakah Anda yakin ingin ${action === 'approved' ? 'menyetujui' : 'menolak'} riset ini?`)) return;
        try {
            const res = await api.reviewResearchDraft(draftId, action);
            if (res.success) {
                alert(res.message);
                fetchResearchDrafts();
            } else {
                alert(res.message || 'Gagal memproses draf riset.');
            }
        } catch (err) {
            alert('Terjadi kesalahan saat memproses.');
        }
    };

    const handleAnalyze = () => {
        if (!topic) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setGeneratedLogic({
                id: 'new_node_' + Date.now(),
                question: `Apakah pasien mengalami gejala spesifik ${topic}?`,
                description: `Indikasi klinis untuk ${topic} seringkali meliputi demam tinggi dan batuk kering.`,
                options: [
                    { label: "Ya, Gejala Berat", value: 'severe' },
                    { label: "Ya, Gejala Ringan", value: 'mild' },
                    { label: "Tidak", value: 'no' }
                ]
            });
        }, 2000);
    };

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = (now - d) / 1000 / 60;
        if (diff < 5) return 'Online';
        if (diff < 60) return `${Math.floor(diff)} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return formatDate(dateStr);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Panel Admin & CRM</h1>
                    <p className="text-slate-300 max-w-xl">
                        Kelola pengguna, pantau langganan Pro, dan riset AI medis dari satu dashboard.
                    </p>
                </div>
                <Sparkles className="absolute right-8 top-8 w-32 h-32 text-white/5 rotate-12" />
            </div>

            {/* Tabs Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-fit overflow-x-auto whitespace-nowrap">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'users', label: 'Manajemen User', icon: Users },
                    { id: 'research', label: 'Persetujuan Riset', icon: Shield },
                    { id: 'crm', label: 'CRM & Notifikasi', icon: Bell },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === tab.id
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ===== TAB: OVERVIEW ===== */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {loadingStats ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                        </div>
                    ) : stats ? (
                        <>
                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</p>
                                    <p className="text-xs text-slate-500 mt-1">Total Pengguna</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                        <span className="text-blue-600 font-medium">{stats.totalPatients} Pasien</span>
                                        <span className="text-slate-300">|</span>
                                        <span className="text-teal-600 font-medium">{stats.totalExperts} Dokter</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                            <Crown className="w-5 h-5 text-amber-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-extrabold text-slate-900">{stats.proUsers}</p>
                                    <p className="text-xs text-slate-500 mt-1">User Pro Aktif</p>
                                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                                            style={{ width: `${stats.totalUsers > 0 ? (stats.proUsers / stats.totalUsers * 100) : 0}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-amber-600 font-medium mt-1">
                                        {stats.totalUsers > 0 ? Math.round(stats.proUsers / stats.totalUsers * 100) : 0}% dari total
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                            <UserX className="w-5 h-5 text-slate-500" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-extrabold text-slate-900">{stats.freeUsers}</p>
                                    <p className="text-xs text-slate-500 mt-1">User Free</p>
                                    <p className="text-xs text-slate-400 mt-2">Potensi konversi</p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-sm text-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold">{formatCurrency(stats.estimatedRevenue)}</p>
                                    <p className="text-xs text-emerald-100 mt-1">Estimasi Revenue / Bulan</p>
                                    <p className="text-xs text-emerald-200 mt-2">{stats.proUsers} × Rp 49.000</p>
                                </div>
                            </div>

                            {/* Recent Upgrades */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        User Terbaru yang Upgrade ke Pro
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {stats.recentUpgrades && stats.recentUpgrades.length > 0 ? (
                                        stats.recentUpgrades.map((u) => (
                                            <div key={u.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
                                                        {u.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                                                        <p className="text-xs text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Crown className="w-4 h-4 text-amber-500" />
                                                    <span className="text-xs text-slate-500">{formatDate(u.premium_since)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-400 text-sm">
                                            Belum ada user yang upgrade ke Pro.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400 py-12">Gagal memuat statistik.</div>
                    )}
                </div>
            )}

            {/* ===== TAB: USER MANAGEMENT ===== */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="all">Semua Role</option>
                                <option value="patient">Pasien</option>
                                <option value="expert">Dokter</option>
                            </select>
                            <select
                                value={premiumFilter}
                                onChange={(e) => setPremiumFilter(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="all">Semua Status</option>
                                <option value="true">Pro</option>
                                <option value="false">Free</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{users.length} pengguna ditemukan</span>
                        {premiumFilter !== 'all' && (
                            <span className={clsx(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                premiumFilter === 'true' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            )}>
                                {premiumFilter === 'true' ? 'Pro Only' : 'Free Only'}
                            </span>
                        )}
                    </div>

                    {/* User Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {loadingUsers ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-sm">
                                Tidak ada pengguna ditemukan.
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="col-span-3">Pengguna</div>
                                    <div className="col-span-2">Role</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-2">Terdaftar</div>
                                    <div className="col-span-1">Aktif</div>
                                    <div className="col-span-2 text-right">Aksi</div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-slate-50">
                                    {users.map((u) => (
                                        <div key={u.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                                            {/* Desktop Row */}
                                            <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-3 flex items-center gap-3 min-w-0">
                                                    <div className={clsx(
                                                        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border",
                                                        u.is_premium ? 'bg-teal-50 text-teal-700 border-teal-150' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    )}>
                                                        {u.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className={clsx(
                                                        "text-xs font-medium px-2.5 py-1 rounded-full",
                                                        u.role === 'expert' ? 'bg-teal-50 text-teal-700 border border-teal-150' : 'bg-blue-50 text-blue-700 border border-blue-150'
                                                    )}>
                                                        {u.role === 'expert' ? 'Dokter' : 'Pasien'}
                                                    </span>
                                                </div>
                                                <div className="col-span-2">
                                                    {u.is_premium ? (
                                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-150 flex items-center gap-1 w-fit">
                                                            <Shield className="w-3 h-3 text-teal-650" /> Pro
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                                                            Free
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-xs text-slate-500">
                                                    {formatDate(u.created_at)}
                                                </div>
                                                <div className="col-span-1">
                                                    {u.last_active_at ? (
                                                        <span className={clsx(
                                                            "text-xs font-medium",
                                                            formatTime(u.last_active_at) === 'Online' ? 'text-emerald-600' : 'text-slate-400'
                                                        )}>
                                                            {formatTime(u.last_active_at) === 'Online' && (
                                                                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1" />
                                                            )}
                                                            {formatTime(u.last_active_at)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-300">-</span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 flex justify-end">
                                                    <button
                                                        onClick={() => handleTogglePremium(u.id)}
                                                        disabled={togglingUser === u.id}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 border",
                                                            togglingUser === u.id && "opacity-50 cursor-wait",
                                                            u.is_premium
                                                                ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200"
                                                                : "bg-teal-50 text-teal-750 hover:bg-teal-100 border-teal-200"
                                                        )}
                                                    >
                                                        {togglingUser === u.id ? '...' : u.is_premium ? 'Downgrade' : 'Upgrade Pro'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Mobile Card */}
                                            <div className="md:hidden flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className={clsx(
                                                        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border",
                                                        u.is_premium ? 'bg-teal-50 text-teal-700 border-teal-150' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    )}>
                                                        {u.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                                            {u.is_premium && <Shield className="w-3 h-3 text-teal-650 shrink-0" />}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={clsx(
                                                                "text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                                                                u.role === 'expert' ? 'bg-teal-50 text-teal-700 border-teal-150' : 'bg-blue-50 text-blue-700 border-blue-150'
                                                            )}>
                                                                {u.role === 'expert' ? 'Dokter' : 'Pasien'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">{formatDate(u.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleTogglePremium(u.id)}
                                                    disabled={togglingUser === u.id}
                                                    className={clsx(
                                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border",
                                                        u.is_premium
                                                            ? "bg-rose-50 text-rose-600 border-rose-200"
                                                            : "bg-teal-50 text-teal-755 border-teal-200"
                                                    )}
                                                >
                                                    {togglingUser === u.id ? '...' : u.is_premium ? 'Downgrade' : 'Upgrade'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ===== TAB: LOGIC & RESEARCH ===== */}
            {/* ===== TAB: RESEARCH APPROVALS ===== */}
            {activeTab === 'research' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg">
                        <Shield className="w-5 h-5 text-teal-600 shrink-0" />
                        <h2>Persetujuan Riset AI Medis</h2>
                    </div>

                    {loadingResearch ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                        </div>
                    ) : researchDrafts.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-slate-700 font-bold">Tidak Ada Usulan Riset</h3>
                            <p className="text-slate-500 text-sm mt-1">Belum ada riset medis baru yang diajukan oleh dokter untuk disetujui.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {researchDrafts.map((d) => {
                                const content = typeof d.content === 'string' ? JSON.parse(d.content) : d.content;
                                return (
                                    <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Header */}
                                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${content?.type === 'logic_tree' ? 'bg-indigo-50 text-indigo-600' : content?.type === 'symptom' ? 'bg-teal-50 text-teal-600' : 'bg-cyan-50 text-cyan-600'}`}>
                                                    {content?.type === 'logic_tree' ? <Shield className="w-6 h-6" /> : content?.type === 'symptom' ? <GitMerge className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                                                            {content?.type === 'logic_tree' ? 'Pembaruan Struktur Pohon Keputusan (Decision Tree)' : (content?.name || 'Temuan Baru')}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                                                            content?.type === 'logic_tree' ? 'bg-indigo-50 text-indigo-700' :
                                                            content?.type === 'symptom' ? 'bg-teal-50 text-teal-700' : 'bg-cyan-50 text-cyan-700'
                                                        }`}>
                                                            {content?.type === 'logic_tree' ? 'Struktur Logika' : content?.type === 'symptom' ? 'Gejala Baru' : 'Aturan Logika'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Diusulkan oleh: <span className="font-semibold text-slate-700">{d.expert_name || 'Dokter Spesialis'}</span>
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">Diajukan: {new Date(d.created_at).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {d.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleReviewResearch(d.id, 'rejected')}
                                                            className="px-4 py-2 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 bg-white"
                                                        >
                                                            <X className="w-4 h-4" /> Tolak
                                                        </button>
                                                        <button
                                                            onClick={() => handleReviewResearch(d.id, 'approved')}
                                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5"
                                                        >
                                                            <Check className="w-4 h-4" /> Setujui & Rilis
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide inline-flex items-center gap-1.5 ${
                                                        d.status === 'approved' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                                        'bg-rose-50 text-rose-700 border border-rose-100'
                                                    }`}>
                                                        {d.status === 'approved' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                        {d.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-slate-100">
                                            <div className="p-6 space-y-2">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    {content?.type === 'logic_tree' ? 'Deskripsi Usulan Perubahan' : 'Bukti Klinis & Referensi Jurnal'}
                                                </h4>
                                                <p className="text-sm text-slate-700 leading-relaxed">
                                                    {content?.type === 'logic_tree' 
                                                        ? 'Usulan ini berisi pembaruan struktur keputusan diagnosa (decision tree) yang dimodifikasi secara manual oleh pakar melalui editor logika.'
                                                        : content?.clinical_evidence
                                                    }
                                                </p>
                                                <div className="pt-2">
                                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                        {content?.type === 'logic_tree' ? 'Aksi: Modifikasi Manual' : `Jurnal: ${d.source_journal || 'Referensi Tidak Disebutkan'}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/30 space-y-3">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    {content?.type === 'logic_tree' ? 'Detail Node & Alur Logika Baru' : 'Langkah Implementasi Logika'}
                                                </h4>
                                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
                                                    <p className="text-sm text-slate-800 font-semibold mb-2">
                                                        {content?.type === 'logic_tree' 
                                                            ? `Total Node: ${content?.treeData?.length || 0} Node Diagnosa`
                                                            : content?.suggested_action
                                                        }
                                                    </p>
                                                    {(content?.proposed_node || content?.treeData) && (
                                                        <pre className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-lg overflow-x-auto border border-slate-100 max-h-60 overflow-y-auto">
                                                            {JSON.stringify(content?.type === 'logic_tree' ? content?.treeData : content?.proposed_node, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ===== TAB: CRM ===== */}
            {activeTab === 'crm' && (
                <AdminNotificationDashboard />
            )}
        </div>
    );
};

export default AdminDashboard;
