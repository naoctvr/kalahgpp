import React, { useState } from 'react';
import { Brain, Search, Check, X, FileText, Loader2, Sparkles, ArrowRight, GitMerge } from 'lucide-react';
import LogicManager from '../components/expert/LogicManager';
import { decisionTree } from '../data/decisionTree';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ExpertResearch = () => {
    const [activeTab, setActiveTab] = useState('research'); // 'research' | 'logic'
    const [loading, setLoading] = useState(false);
    const [drafts, setDrafts] = useState([]);
    const [error, setError] = useState(null);

    const handleAutoResearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/expert/research`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'auto' }), // Signal for auto-research
            });
            const data = await res.json();
            if (data.success) {
                // Expecting an array of drafts
                setDrafts(prev => [...data.data, ...prev]);
            } else {
                setError(data.message || 'Gagal melakukan riset.');
            }
        } catch (err) {
            console.error(err);
            setError('Terjadi kesalahan koneksi.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (draft, index) => {
        try {
            const res = await fetch(`${API_BASE}/expert/merge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draft }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Data berhasil ditambahkan ke sistem!');
                setDrafts(prev => prev.filter((_, i) => i !== index));
            }
        } catch (err) {
            alert('Gagal menyimpan data.');
        }
    };

    const handleReject = (index) => {
        if (window.confirm('Hapus draft riset ini?')) {
            setDrafts(prev => prev.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto overflow-x-hidden">
            {/* Header */}
            <div className="text-center space-y-3 py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-1">
                    <Brain className="w-7 h-7 text-blue-600" />
                </div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 px-4">Expert Knowledge Center</h1>
                <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base px-4">
                    Pusat kendali pengetahuan medis AI. Kelola logika diagnosis secara manual atau gunakan AI untuk riset otomatis.
                </p>
            </div>

            {/* TABS */}
            <div className="flex justify-center">
                <div className="bg-slate-100 p-1 rounded-xl flex w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('research')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'research' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Riset AI
                    </button>
                    <button
                        onClick={() => setActiveTab('logic')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'logic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Logic Editor
                    </button>
                </div>
            </div>

            {activeTab === 'research' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Auto-Research Trigger */}
                    <div className="flex justify-center mb-8">
                        <button
                            onClick={handleAutoResearch}
                            disabled={loading}
                            className="group relative overflow-hidden w-full md:w-auto min-h-[52px] px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12 -translate-x-full"></div>
                            <div className="flex items-center justify-center space-x-2 text-sm md:text-base font-semibold">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                                        <span>AI Sedang Memindai Jurnal...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 shrink-0" />
                                        <span>MULAI RISET OTOMATIS</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                                    </>
                                )}
                            </div>
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-center border border-red-100 mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Drafts List */}
                    <div className="space-y-4">
                        {drafts.length > 0 && (
                            <div className="flex items-center space-x-2 text-slate-800 font-bold text-base">
                                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                <h2>Hasil Temuan ({drafts.length})</h2>
                            </div>
                        )}

                        {drafts.map((draft, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
                                {/* Draft header */}
                                <div className="p-4 md:p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${draft.type === 'symptom' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                                            {draft.type === 'symptom' ? <GitMerge className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900 text-sm leading-tight break-words w-full">{draft.name || 'Temuan Baru'}</h3>
                                                <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${draft.type === 'symptom' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {draft.type === 'symptom' ? 'Gejala Baru' : 'Aturan Logika'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 break-words">Sumber: {draft.source_journal || 'Analisis AI General'}</p>
                                        </div>
                                    </div>

                                    {/* Action buttons — full width on mobile */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReject(index)}
                                            className="flex-1 md:flex-none h-10 min-h-[44px] px-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-red-600 font-medium transition-colors flex items-center justify-center text-sm"
                                        >
                                            <X className="w-4 h-4 mr-1" /> Tolak
                                        </button>
                                        <button
                                            onClick={() => handleApprove(draft, index)}
                                            className="flex-1 md:flex-none h-10 min-h-[44px] px-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center justify-center shadow-sm text-sm"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            <span className="hidden sm:inline">Setujui & Gabung</span>
                                            <span className="sm:hidden">Setujui</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Detail section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-slate-100">
                                    <div className="p-4 md:p-5">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bukti Klinis</h4>
                                        <p className="text-xs md:text-sm text-slate-700 leading-relaxed break-words">{draft.clinical_evidence}</p>
                                    </div>
                                    <div className="p-4 md:p-5 border-t md:border-t-0 md:border-l border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Usulan Implementasi</h4>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-xs md:text-sm text-slate-800 font-medium mb-2 break-words">{draft.suggested_action}</p>
                                            {draft.proposed_node && (
                                                <div className="text-[10px] font-mono text-slate-600 whitespace-pre-wrap break-all overflow-hidden">
                                                    {JSON.stringify(draft.proposed_node, null, 2)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LogicManager initialTree={decisionTree} />
                </div>
            )}
        </div>
    );
};

export default ExpertResearch;

