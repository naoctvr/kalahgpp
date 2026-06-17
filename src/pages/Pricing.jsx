import React, { useState } from 'react';
import { Check, X, Shield, Zap, Sparkles, MessageSquare, Bell, ArrowRight, Crown, Activity, Calendar, History, Brain, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/modals/UpgradeModal';

const Pricing = () => {
    const { user } = useAuth();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const isPremium = user?.is_premium || user?.isPremium;

    const comparisonFeatures = [
        { name: 'Diagnosa mandiri (AI)', free: true, pro: true },
        { name: 'Akses berita & tips kesehatan', free: true, pro: true },
        { name: 'Kamus penyakit pernapasan', free: true, pro: true },
        { name: 'Skor harian paru-paru', free: true, pro: true },
        { name: 'Riwayat diagnosa', free: '5 terakhir', pro: 'Unlimited' },
        { name: 'Chat langsung dengan dokter', free: false, pro: true },
        { name: 'Booking konsultasi dokter', free: false, pro: true },
        { name: 'Prioritas antrean konsultasi', free: false, pro: true },
        { name: 'Notifikasi Telegram real-time', free: false, pro: true },
        { name: 'Pengingat minum obat via Telegram', free: false, pro: true },
        { name: 'Alert kualitas udara otomatis', free: false, pro: true },
        { name: 'Analisa tren kesehatan AI', free: false, pro: true },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/50 px-4 py-1.5 rounded-full mb-6">
                    <Shield className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-bold text-teal-700">Respira Premium</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Pilih Paket Terbaik untuk Kesehatan Anda
                </h1>
                <p className="text-lg text-slate-500">
                    Akses fitur telemedicine lengkap dan konsultasi langsung dengan dokter spesialis paru.
                </p>
            </div>

            {/* Banner Khusus User Premium (Pro) */}
            {isPremium && (
                <div className="mb-12 bg-gradient-to-r from-teal-950 via-teal-800 to-cyan-950 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-teal-500/10 relative overflow-hidden border border-teal-500/30">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Sparkles className="w-64 h-64 -mr-10 -mb-10 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <span className="bg-teal-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit">
                                <Shield className="w-3.5 h-3.5" /> Member Pro Aktif
                            </span>
                            <h2 className="text-2xl font-black">Terima kasih atas kepercayaan Anda pada RESPIRA!</h2>
                            <p className="text-teal-50 text-sm max-w-2xl">
                                Akun Anda kini sepenuhnya terintegrasi dengan status Premium. Nikmati akses tanpa batas, notifikasi kesehatan real-time via Telegram, dan prioritas antrean konsultasi dokter.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                            <button 
                                onClick={() => window.open('https://t.me/healthycrm_bot', '_blank')}
                                className="bg-white hover:bg-teal-50 text-teal-900 font-bold px-6 py-3 rounded-2xl text-center text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4 text-teal-600" /> Buka Bot Telegram
                            </button>
                        </div>
                    </div>

                    {/* Rangkuman Fitur yang Didapat */}
                    <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center mb-3">
                                <Bell className="w-4 h-4 text-teal-200" />
                            </div>
                            <h4 className="font-bold text-sm text-white">Notifikasi Telegram</h4>
                            <p className="text-teal-100 text-xs mt-1">Laporan harian & alert polusi dikirim instan.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center mb-3">
                                <MessageSquare className="w-4 h-4 text-teal-200" />
                            </div>
                            <h4 className="font-bold text-sm text-white">Live Chat Unlimited</h4>
                            <p className="text-teal-100 text-xs mt-1">Konsultasi real-time dengan dokter spesialis.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center mb-3">
                                <Zap className="w-4 h-4 text-teal-200" />
                            </div>
                            <h4 className="font-bold text-sm text-white">Analisa AI & Diagnosis</h4>
                            <p className="text-teal-100 text-xs mt-1">Riwayat diagnosa terekam tanpa batas waktu.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center mb-3">
                                <Shield className="w-4 h-4 text-teal-200" />
                            </div>
                            <h4 className="font-bold text-sm text-white">Prioritas Antrean</h4>
                            <p className="text-teal-100 text-xs mt-1">Mendapatkan jadwal tercepat saat konsultasi.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Kartu Pricing — 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-12 max-w-4xl mx-auto">
                {/* FREE PLAN */}
                <div className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
                    isPremium
                        ? 'bg-white text-slate-400 shadow-sm border border-slate-200 opacity-60'
                        : 'bg-white text-slate-800 shadow-md hover:shadow-lg border border-slate-200'
                }`}>
                    {!isPremium && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                            Paket Saat Ini
                        </span>
                    )}

                    <div>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <Activity className="w-6 h-6 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Free Plan</h3>
                            <p className="text-xs mt-1 text-slate-500">Fitur esensial untuk memantau kesehatan pernapasan dasar.</p>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold tracking-tight text-slate-900">Rp 0</span>
                                <span className="ml-1 text-sm font-semibold text-slate-500">/selamanya</span>
                            </div>
                        </div>

                        <div className="h-px w-full my-6 bg-slate-100" />

                        <ul className="space-y-3 mb-8">
                            {[
                                'Diagnosa mandiri harian (AI)',
                                'Akses artikel & tips kesehatan',
                                'Riwayat diagnosa terbatas (5 data terakhir)',
                                'Kamus penyakit pernapasan',
                                'Skor harian kesehatan paru',
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm">
                                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-teal-600" />
                                    <span className="text-slate-600">{feature}</span>
                                </li>
                            ))}
                            {[
                                'Chat langsung dengan dokter',
                                'Booking konsultasi',
                                'Notifikasi Telegram',
                            ].map((feature, idx) => (
                                <li key={`locked-${idx}`} className="flex items-start gap-2.5 text-sm">
                                    <X className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
                                    <span className="text-slate-400 line-through">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        disabled
                        className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-100 text-slate-500 cursor-default"
                    >
                        {isPremium ? 'Paket Sebelumnya' : 'Aktif Saat Ini'}
                    </button>
                </div>

                {/* PRO PLAN */}
                <div className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between bg-gradient-to-b from-teal-950 via-teal-900 to-slate-950 text-white shadow-xl scale-[1.02] z-10 ${
                    isPremium
                        ? 'border-2 border-teal-500'
                        : 'border border-teal-600/50'
                }`}>
                    {isPremium ? (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" /> Plan Aktif Anda
                        </span>
                    ) : (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Rekomendasi
                        </span>
                    )}

                    <div>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                                <Shield className="w-6 h-6 text-teal-400" />
                            </div>
                            <h3 className="text-xl font-bold text-teal-400">Pro Plan</h3>
                            <p className="text-xs mt-1 text-slate-300">Fitur lengkap untuk pemantauan intensif dan konsultasi real-time.</p>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold tracking-tight text-white">Rp 49.000</span>
                                <span className="ml-1 text-sm font-semibold text-teal-300">/bulan</span>
                            </div>
                        </div>

                        <div className="h-px w-full my-6 bg-teal-800" />

                        <ul className="space-y-3 mb-8">
                            {[
                                'Semua fitur Free Plan',
                                'Live Chat Unlimited dengan Dokter',
                                'Booking konsultasi tanpa batas',
                                'Prioritas antrean konsultasi',
                                'Notifikasi & Laporan Harian via Telegram',
                                'Pengingat minum obat otomatis',
                                'Alert kualitas udara real-time',
                                'Riwayat diagnosa tanpa batas waktu',
                                'Analisa tren kesehatan bertenaga AI',
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm">
                                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-teal-400" />
                                    <span className="text-slate-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => {
                            if (!isPremium) setShowUpgradeModal(true);
                        }}
                        disabled={isPremium}
                        className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-150 ${
                            isPremium
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 active:scale-95'
                        }`}
                    >
                        {isPremium ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-500" /> Paket Pro Aktif
                            </>
                        ) : (
                            <>
                                Upgrade ke Pro
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="max-w-4xl mx-auto mb-12">
                <h2 className="text-xl font-bold text-slate-900 text-center mb-6">Perbandingan Fitur Lengkap</h2>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 py-3 px-4">
                        <div className="text-sm font-bold text-slate-700">Fitur</div>
                        <div className="text-sm font-bold text-slate-500 text-center">Free</div>
                        <div className="text-sm font-bold text-teal-700 text-center">Pro</div>
                    </div>
                    {comparisonFeatures.map((feature, idx) => (
                        <div key={idx} className={`grid grid-cols-3 py-3 px-4 text-sm ${idx !== comparisonFeatures.length - 1 ? 'border-b border-slate-100' : ''}`}>
                            <div className="text-slate-700 font-medium">{feature.name}</div>
                            <div className="flex justify-center">
                                {feature.free === true ? (
                                    <Check className="w-5 h-5 text-emerald-500" />
                                ) : feature.free === false ? (
                                    <X className="w-5 h-5 text-slate-300" />
                                ) : (
                                    <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{feature.free}</span>
                                )}
                            </div>
                            <div className="flex justify-center">
                                {feature.pro === true ? (
                                    <Check className="w-5 h-5 text-teal-500" />
                                ) : (
                                    <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{feature.pro}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tambahan Info Jaminan Keamanan */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">Sistem Transaksi Aman & Transparan</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kami tidak menyimpan data kartu kredit atau kredensial perbankan Anda. Pembayaran diverifikasi langsung menggunakan Telegram Payment Gateway yang aman dan terenkripsi.
                    </p>
                </div>
            </div>

            {/* Modal Upgrade */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
};

export default Pricing;
