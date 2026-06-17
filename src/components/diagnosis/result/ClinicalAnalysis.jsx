import React from 'react';
import { Save, RefreshCw, Loader2, CheckCircle, FileText, Pill } from 'lucide-react';

const ClinicalAnalysis = ({ diagnosis, recommendation, saveStatus, onRestart }) => {
    return (
        <div className="p-4 md:p-6 space-y-4">
            {/* Analisis Klinis */}
            <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    Analisis Klinis
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                    Sistem mendeteksi pola gejala yang signifikan mengarah pada{' '}
                    <strong className="text-slate-900">{diagnosis}</strong>.
                    Kesimpulan ini ditarik berdasarkan korelasi antara durasi gejala, lokasi keluhan, dan faktor risiko yang Anda laporkan.
                </p>

                {recommendation && (
                    <div className="mt-3 bg-blue-50 rounded-xl p-3 border-l-4 border-blue-500">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Rekomendasi Utama
                        </p>
                        <p className="text-slate-800 text-sm font-medium italic leading-relaxed">
                            "{recommendation}"
                        </p>
                    </div>
                )}
            </div>

            {/* Saran Pengobatan */}
            <div className="bg-white rounded-xl border border-slate-100 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5 text-teal-500" />
                    Saran Pengobatan
                </h3>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <strong className="block mb-0.5">Catatan Penting:</strong>
                        Jangan mengonsumsi antibiotik tanpa resep dokter. Gunakan obat pereda gejala yang dijual bebas jika diperlukan.
                    </p>
                </div>
            </div>

            {/* Status & Actions */}
            <div className="space-y-2">
                {/* Save status */}
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-2">
                        <Save className="w-4 h-4 text-slate-300" />
                        <span className="text-sm text-slate-500">Status Data</span>
                    </div>
                    {saveStatus === 'saving' ? (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg">
                            <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...
                        </span>
                    ) : saveStatus === 'saved' ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                            <CheckCircle className="w-3 h-3" /> Tersimpan
                        </span>
                    ) : (
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Menunggu...</span>
                    )}
                </div>

                {/* Restart */}
                <button
                    onClick={onRestart}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Diagnosa Ulang
                </button>
            </div>
        </div>
    );
};

export default ClinicalAnalysis;
