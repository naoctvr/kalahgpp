import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

const DiagnosisHeaderCard = ({ diagnosis, severity, confidence }) => {
    const isCritical = severity === 'critical';
    const isHigh = severity === 'high';

    const config = isCritical
        ? { bg: 'bg-red-50', border: 'border-red-200', accent: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-700', icon: ShieldAlert, label: 'Gawat Darurat' }
        : isHigh
        ? { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', icon: AlertTriangle, label: 'Perlu Perhatian' }
        : { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Kondisi Stabil' };

    const Icon = config.icon;

    return (
        <div className={clsx('rounded-2xl border overflow-hidden shadow-sm', config.bg, config.border)}>
            {/* Top accent bar */}
            <div className={clsx('h-1 w-full', config.accent)} />

            <div className="p-4 md:p-6">
                {/* Badge + confidence inline */}
                <div className="flex items-center justify-between mb-3">
                    <span className={clsx('flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full', config.badge)}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                    </span>
                    <div className="text-right">
                        <span className={clsx('text-2xl font-black', config.text)}>{confidence}%</span>
                        <p className="text-[10px] text-slate-400 leading-none">keyakinan</p>
                    </div>
                </div>

                {/* Diagnosis name */}
                <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 leading-tight">
                    {diagnosis}
                </h1>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Berdasarkan pola gejala klinis dan analisis riwayat medis.
                </p>
            </div>
        </div>
    );
};

export default DiagnosisHeaderCard;
