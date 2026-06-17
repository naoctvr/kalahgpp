import React, { useState } from 'react';
import { Check, Shield, Zap, Sparkles, MessageSquare, Bell, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/modals/UpgradeModal';

const Pricing = () => {
    const { user } = useAuth();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const isPremium = user?.is_premium || user?.isPremium;

    const plans = [
        {
            name: 'Free Plan',
            price: 'Rp 0',
            period: 'selamanya',
            description: 'Fitur esensial untuk memantau kesehatan pernapasan dasar Anda.',
            features: [
                'Diagnosa mandiri harian (batuk/pilek)',
                'Akses artikel & tips kesehatan',
                'Riwayat diagnosa terbatas (3 data terakhir)',
                'Konsultasi dokter reguler (tanpa live-chat)',
            ],
            cta: 'Aktif Saat Ini',
            active: !isPremium,
            disabled: true,
            premium: false,
        },
        {
            name: 'Pro Plan',
            price: 'Rp 49.000',
            period: 'bulan',
            description: 'Fitur lengkap untuk pemantauan intensif dan konsultasi real-time.',
            features: [
                'Semua fitur Free Plan',
                'Notifikasi & Laporan Harian via Telegram',
                'Live Chat Tanpa Batas dengan Expert/Dokter',
                'Riwayat diagnosa tanpa batas waktu',
                'Prioritas antrean konsultasi dokter',
                'Analisa tren kesehatan bertenaga AI',
            ],
            cta: isPremium ? 'Paket Pro Aktif' : 'Upgrade ke Pro',
            active: isPremium,
            disabled: isPremium,
            premium: true,
            popular: true,
        },
        {
            name: 'Enterprise Plan',
            price: 'Custom',
            period: 'institusi',
            description: 'Solusi terintegrasi untuk rumah sakit, klinik, dan organisasi kesehatan.',
            features: [
                'Semua fitur Pro Plan',
                'Integrasi API Sistem Informasi RS (SIRS)',
                'Dashboard khusus monitoring multi-pasien',
                'Layanan Customer Support 24/7 dedikatif',
                'Training dan setup sistem gratis',
                'Custom domain dan branding institusi',
            ],
            cta: 'Hubungi Kami',
            active: false,
            disabled: false,
            premium: false,
            enterprise: true,
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Pilih Paket Terbaik untuk Kesehatan Anda
                </h1>
                <p className="text-lg text-slate-500">
                    Akses dashboard kesehatan premium, pantau kondisi paru-paru secara real-time, dan konsultasi langsung dengan dokter spesialis.
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
                            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit">
                                👑 Member Pro Aktif
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

            {/* Grid Kartu Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${
                            plan.active && isPremium
                                ? 'bg-gradient-to-b from-teal-950 via-teal-900 to-slate-950 text-white shadow-xl scale-105 border-2 border-teal-500 z-10'
                                : plan.popular && !isPremium
                                ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl scale-105 border border-slate-700 z-10'
                                : plan.name === 'Free Plan' && isPremium
                                ? 'bg-white text-slate-400 shadow-sm border border-slate-200 opacity-60'
                                : 'bg-white text-slate-800 shadow-md hover:shadow-lg border border-slate-200'
                        }`}
                    >
                        {/* Tag Rekomendasi */}
                        {plan.popular && !isPremium && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Rekomendasi
                            </span>
                        )}

                        {/* Tag Aktif untuk Pro */}
                        {plan.active && isPremium && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                👑 Plan Aktif Anda
                            </span>
                        )}

                        <div>
                            {/* Nama & Harga */}
                            <div className="mb-6">
                                <h3 className={`text-xl font-bold ${plan.active && isPremium ? 'text-teal-400' : plan.popular ? 'text-teal-400' : 'text-slate-900'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-xs mt-1 ${plan.active && isPremium ? 'text-slate-300' : plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {plan.description}
                                </p>
                                <div className="mt-4 flex items-baseline">
                                    <span className={`text-4xl font-extrabold tracking-tight ${plan.active && isPremium ? 'text-white' : plan.popular ? 'text-white' : 'text-slate-900'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`ml-1 text-sm font-semibold ${plan.active && isPremium ? 'text-teal-300' : plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                                        /{plan.period}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className={`h-px w-full my-6 ${plan.active && isPremium ? 'bg-teal-800' : plan.popular ? 'bg-slate-700' : 'bg-slate-100'}`} />

                            {/* Fitur */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-2.5 text-sm">
                                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.active && isPremium ? 'text-teal-400' : plan.popular ? 'text-teal-400' : 'text-teal-600'}`} />
                                        <span className={plan.active && isPremium ? 'text-slate-300' : plan.popular ? 'text-slate-300' : 'text-slate-600'}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tombol Aksi */}
                        <button
                            onClick={() => {
                                if (plan.premium) {
                                    setShowUpgradeModal(true);
                                } else if (plan.enterprise) {
                                    window.open('https://t.me/respira_support_bot', '_blank');
                                }
                            }}
                            disabled={plan.disabled}
                            className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-150 ${
                                plan.active
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                    : plan.popular
                                    ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 active:scale-95'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95'
                            }`}
                        >
                            {plan.cta}
                            {!plan.disabled && !plan.active && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                ))}
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
