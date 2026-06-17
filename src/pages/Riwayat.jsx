import React, { useState, useEffect } from 'react';
import { History, Calendar, ArrowRight, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Riwayat = () => {
    const { user, loading: authLoading } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Wait for auth to initialize
        if (authLoading) return;

        const fetchHistory = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await api.getHistory(user.id);
                if (res.success) {
                    setHistory(res.data);
                } else {
                    setError('Gagal memuat riwayat.');
                }
            } catch (err) {
                console.error("Error fetching history:", err);
                setError('Terjadi kesalahan koneksi.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, authLoading]);

    // Helper to determine risk level based on score or diagnosis text
    const getRiskLevel = (item) => {
        const score = item.confidence_score || 0;
        const diagnosis = item.final_result?.toLowerCase() || '';

        if (score >= 85 || diagnosis.includes('bahaya') || diagnosis.includes('darurat') || diagnosis.includes('kritis')) {
            return 'High';
        } else if (score >= 50 || diagnosis.includes('periksa') || diagnosis.includes('lanjut')) {
            return 'Medium';
        }
        return 'Low';
    };

    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500">Memuat riwayat diagnosa...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Terjadi Kesalahan</h3>
                <p className="text-slate-500 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                    <div className="p-3 bg-indigo-50 rounded-xl mr-4">
                        <History className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Riwayat Diagnosa</h1>
                        <p className="text-slate-500">Rekam jejak pemeriksaan kesehatan Anda.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-3">
                {history.length > 0 ? (
                    history.map((item, index) => {
                        const riskLevel = getRiskLevel(item);
                        const badgeText = riskLevel === 'High' ? 'BAHAYA' : riskLevel === 'Medium' ? 'WASPADA' : 'AMAN';
                        const badgeClass = riskLevel === 'High' ? 'bg-red-50 text-red-600' : riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600';
                        return (
                            <motion.div
                                key={item.id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Mobile: compact card */}
                                <div className="flex items-start gap-3 p-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${riskLevel === 'High' ? 'bg-red-100 text-red-600' : riskLevel === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <History className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-0.5">
                                            <p className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 flex-1">{item.final_result}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>{badgeText}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-slate-400">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            {item.confidence_score && (
                                                <span className="text-xs text-slate-400">· {item.confidence_score}%</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-100 border-dashed">
                        <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Belum ada riwayat</h3>
                        <p className="text-slate-500 mb-6">Lakukan diagnosa pertama Anda sekarang.</p>
                        <a href="/diagnosa" className="inline-flex items-center text-blue-600 font-medium hover:underline">
                            Mulai Diagnosa <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Riwayat;
