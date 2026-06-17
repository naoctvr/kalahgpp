import React, { useState } from 'react';
import { Lock, Sparkles, Zap, MessageSquare, Calendar, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import UpgradeModal from '../modals/UpgradeModal';

const ProGateOverlay = ({ 
    feature = 'fitur ini',
    description = 'Silakan upgrade ke Pro untuk mengakses fitur premium.',
    icon: CustomIcon = Lock,
    showFeatureList = true,
    compact = false,
    onUpgradeSuccess
}) => {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    if (compact) {
        return (
            <>
                <div className="bg-teal-50 border border-teal-200/50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-teal-100">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-teal-650" /> Fitur Pro
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
                    >
                        Upgrade
                    </button>
                </div>
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    onSuccess={() => {
                        onUpgradeSuccess?.();
                        window.location.reload();
                    }}
                />
            </>
        );
    }

    return (
        <>
            <div className="relative flex flex-col items-center justify-center text-center p-8 md:p-12 min-h-[400px]">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-teal-50/10 to-white/90 rounded-3xl" />
                
                {/* Floating Icons */}
                <div className="absolute top-8 left-8 opacity-10 animate-bounce" style={{ animationDelay: '0s' }}>
                    <MessageSquare className="w-8 h-8 text-teal-500" />
                </div>
                <div className="absolute top-12 right-12 opacity-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
                    <Calendar className="w-8 h-8 text-cyan-500" />
                </div>
                <div className="absolute bottom-12 left-16 opacity-10 animate-bounce" style={{ animationDelay: '1s' }}>
                    <Zap className="w-8 h-8 text-teal-400" />
                </div>

                <div className="relative z-10 max-w-md">
                    {/* Lock Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-500/30 rotate-3 hover:rotate-0 transition-transform">
                        <CustomIcon className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
                        Akses <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">{feature}</span>
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8">
                        {description}
                    </p>

                    {/* Feature List */}
                    {showFeatureList && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 text-left shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Keuntungan Pro Member
                            </p>
                            <div className="space-y-2.5">
                                {[
                                    { icon: MessageSquare, text: 'Chat unlimited dengan dokter spesialis' },
                                    { icon: Calendar, text: 'Booking konsultasi tanpa batas' },
                                    { icon: Sparkles, text: 'Notifikasi real-time via Telegram' },
                                    { icon: ShieldCheck, text: 'Riwayat diagnosa tanpa batas' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                                            <item.icon className="w-3.5 h-3.5 text-teal-600" />
                                        </div>
                                        <span className="text-sm text-slate-700">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA Button */}
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full px-8 py-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-base"
                    >
                        <ShieldCheck className="w-5 h-5 text-white" />
                        Upgrade ke Pro — Rp 49.000/bulan
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </button>

                    <p className="text-xs text-slate-400 mt-3">
                        Bebas chat dokter manapun tanpa biaya tambahan
                    </p>
                </div>
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onSuccess={() => {
                    onUpgradeSuccess?.();
                    window.location.reload();
                }}
            />
        </>
    );
};

export default ProGateOverlay;
