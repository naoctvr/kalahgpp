import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Calendar, User, Activity, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, cn } from '../components/ui/Widgets';

const ConsultationHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('all'); // all, gawat, waspada, stabil
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user?.id) {
                try {
                    const res = await api.getAllDiagnosisHistory();
                    if (res.success) {
                        setHistory(res.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch history", err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchHistory();
    }, [user]);

    const getSeverity = (result) => {
        if (!result) return 'stabil';
        if (result.includes('GAWAT DARURAT')) return 'gawat';
        if (result.includes('Suspek') || result.includes('Eksaserbasi')) return 'waspada';
        return 'stabil';
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.diagnosis_result && item.diagnosis_result.toLowerCase().includes(searchTerm.toLowerCase()));

        const severity = getSeverity(item.diagnosis_result);
        const matchesFilter = filterSeverity === 'all' || severity === filterSeverity;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Riwayat Diagnosa</h1>
                    <p className="text-slate-500">Arsip lengkap diagnosa dan konsultasi pasien.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cari pasien atau diagnosa..."
                            className="pl-10 pr-4 py-2 min-h-[44px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-64 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Button
                            variant="outline"
                            className={`border-slate-200 text-slate-600 ${filterSeverity !== 'all' ? 'bg-teal-50 border-teal-200 text-teal-700' : ''}`}
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
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
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* MOBILE: Card list view */}
                <div className="md:hidden divide-y divide-slate-50">
                    {loading ? (
                        <div className="px-4 py-12 text-center text-slate-400">Memuat riwayat...</div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="px-4 py-12 text-center text-slate-400">
                            <Activity size={32} className="mx-auto mb-2 opacity-20" />
                            <p>Tidak ada data riwayat ditemukan.</p>
                        </div>
                    ) : (
                        filteredHistory.map((item) => {
                            const dateObj = new Date(item.requested_date.replace(' ', 'T'));
                            const result = item.diagnosis_result || '';
                            let badgeText = 'STABIL';
                            let badgeClass = 'bg-blue-50 text-blue-600';
                            if (result.includes('GAWAT DARURAT')) { badgeText = 'GAWAT'; badgeClass = 'bg-red-50 text-red-600'; }
                            else if (result.includes('Suspek') || result.includes('Eksaserbasi')) { badgeText = 'WASPADA'; badgeClass = 'bg-amber-50 text-amber-600'; }
                            return (
                                <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-slate-50/80 transition-colors">
                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-teal-100 shrink-0">
                                        {item.patient_name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <p className="font-bold text-slate-800 text-sm truncate">{item.patient_name}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>{badgeText}</span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-medium leading-snug line-clamp-2">{item.diagnosis_result || 'Belum ada diagnosa'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-slate-400">
                                                {dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {item.confidence_score && (
                                                <span className="text-xs text-slate-400">· {item.confidence_score}%</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* DESKTOP: Table view */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs w-[20%]">Pasien</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs w-[15%]">Tanggal</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs w-[35%]">Hasil Diagnosa</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs w-[15%]">Akurasi</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-center w-[15%]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Memuat riwayat...</td></tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        <Activity size={32} className="mx-auto mb-2 opacity-20" />
                                        <p>Tidak ada data riwayat ditemukan.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((item) => {
                                    const dateObj = new Date(item.requested_date.replace(' ', 'T'));
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border border-teal-100">
                                                        {item.patient_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{item.patient_name}</p>
                                                        <p className="text-xs text-slate-400 font-mono">#{item.id.toString().padStart(4, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
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
                                            <td className="px-6 py-4 align-top">
                                                <p className="font-bold text-slate-800 text-sm leading-relaxed">{item.diagnosis_result || 'Belum ada diagnosa'}</p>
                                                <p className="text-xs text-slate-500 mt-1">Berdasarkan analisis gejala fisik</p>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                {item.confidence_score ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="font-medium text-slate-700">{item.confidence_score}%</span>
                                                            <span className="text-slate-400 text-[10px]">Akurasi</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full rounded-full transition-all duration-500", item.confidence_score > 80 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-amber-400 to-amber-500")}
                                                                style={{ width: `${item.confidence_score}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center align-top">
                                                {(() => {
                                                    const result = item.diagnosis_result || '';
                                                    let badgeVariant = 'default';
                                                    let badgeText = 'INFO';
                                                    let badgeClass = 'bg-slate-100 text-slate-600';

                                                    if (result.includes('GAWAT DARURAT')) {
                                                        badgeVariant = 'danger';
                                                        badgeText = 'GAWAT';
                                                        badgeClass = 'bg-red-50 text-red-600 border border-red-100';
                                                    } else if (result.includes('Suspek') || result.includes('Eksaserbasi')) {
                                                        badgeVariant = 'warning';
                                                        badgeText = 'WASPADA';
                                                        badgeClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                                                    } else {
                                                        badgeVariant = 'info';
                                                        badgeText = 'STABIL';
                                                        badgeClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                                                    }

                                                    return (
                                                        <Badge variant={badgeVariant} className={`${badgeClass} shadow-sm px-3 py-1 text-[10px] font-bold tracking-wide`}>
                                                            {badgeText}
                                                        </Badge>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* end desktop table */}
            </div>
        </div>
    );
};

export default ConsultationHistory;
