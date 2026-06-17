import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wind, Activity, User, Edit, Droplet, Ruler, Weight } from 'lucide-react';
import { Card, Button, cn } from './Widgets';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// --- 1. SCORE CARD (Gradient Gauge) ---
export const ScoreCard = ({ score = 0 }) => {
    // Gauge Data
    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score },
    ];
    // Gradient Colors based on score
    const getColor = (s) => {
        if (s >= 80) return ['#10b981', '#d1fae5']; // Emerald
        if (s >= 50) return ['#f59e0b', '#fef3c7']; // Amber
        return ['#ef4444', '#fee2e2']; // Red
    };
    const colors = getColor(score);

    return (
        <Card className="h-full p-6 flex flex-col justify-between relative overflow-hidden bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start z-10">
                <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Kesehatan Paru</h3>
                    <p className="text-xs text-slate-400 mt-1">Update Harian</p>
                </div>
                <div className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                    score >= 80 ? "bg-emerald-100 text-emerald-700" :
                        score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                )}>
                    {score >= 80 ? 'Optimal' : score >= 50 ? 'Cukup' : 'Perlu Perhatian'}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative my-4">
                {/* Recharts Gauge */}
                <div className="w-40 h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="score" fill={colors[0]} />
                                <Cell key="rest" fill={colors[1]} />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                        <span className="text-4xl font-bold text-slate-800">{score}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Poin</span>
                    </div>
                </div>
            </div>

            <div className="text-center z-10">
                <p className="text-xs text-slate-500">
                    {score >= 80 ? "Paru-paru Anda dalam kondisi prima." : "Lakukan latihan pernapasan rutin."}
                </p>
            </div>
        </Card>
    );
};

// --- 2. AQI CARD (Dynamic Background) ---
export const AQICard = ({ data, onRefresh }) => {
    const { aqi, city, pm25 } = data || { aqi: 0, city: 'Unknown', pm25: 0 };

    // Dynamic Backgrounds
    const getBgClass = (val) => {
        if (val <= 1) return "bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-100";
        if (val <= 3) return "bg-gradient-to-br from-amber-50 to-orange-100 border-amber-100";
        return "bg-gradient-to-br from-red-50 to-rose-100 border-red-100";
    };

    const getTextColor = (val) => {
        if (val <= 1) return "text-emerald-800";
        if (val <= 3) return "text-amber-800";
        return "text-red-800";
    };

    return (
        <Card className={cn(
            "h-full p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300",
            getBgClass(aqi)
        )}>
            <div className="flex justify-between items-start z-10">
                <div>
                    <h3 className={cn("text-xs font-bold uppercase tracking-wider opacity-70", getTextColor(aqi))}>
                        Kualitas Udara
                    </h3>
                    <div className={cn("flex items-center gap-1 font-semibold text-sm mt-1", getTextColor(aqi))}>
                        <Wind size={14} />
                        {city}
                    </div>
                </div>
                {onRefresh && (
                    <button onClick={onRefresh} className="p-1.5 bg-white/50 hover:bg-white/80 rounded-full transition-colors">
                        <Wind size={14} className={getTextColor(aqi)} />
                    </button>
                )}
            </div>

            <div className="flex items-end gap-2 mt-4 z-10">
                <span className={cn("text-5xl font-bold", getTextColor(aqi))}>
                    {aqi > 0 ? aqi * 15 + 10 : '--'}
                </span>
                <span className={cn("text-xs mb-2 font-medium opacity-70", getTextColor(aqi))}>
                    AQI US
                </span>
            </div>

            <div className="mt-4 z-10">
                <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-xs font-bold shadow-sm">
                        PM2.5: {pm25}
                    </div>
                    <div className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-xs font-bold shadow-sm">
                        {aqi <= 1 ? "Udara Segar" : aqi <= 3 ? "Cukup Bersih" : "Polusi Tinggi"}
                    </div>
                </div>
            </div>

            {/* Decor */}
            <Wind className={cn("absolute -bottom-6 -right-6 w-32 h-32 opacity-10", getTextColor(aqi))} />
        </Card>
    );
};

// --- 3. PROFILE MINI CARD ---
export const ProfileMiniCard = ({ profile, name, email, onEdit, isPremium, onUpgrade }) => {
    const { blood_type, height, weight } = profile || {};
    const isComplete = blood_type && height && weight;

    return (
        <Card className="h-full p-6 flex flex-col bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Profil Singkat</h3>
                        {isPremium ? (
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                PRO
                            </span>
                        ) : (
                            <span className="bg-slate-100 text-slate-500 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                FREE
                            </span>
                        )}
                    </div>
                    <p className="font-bold text-slate-800 text-lg truncate max-w-[180px]">{name || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{email || '-'}</p>
                </div>
                <div className="flex items-center gap-1">
                    {!isPremium && onUpgrade && (
                        <button
                            onClick={onUpgrade}
                            className="bg-teal-50 hover:bg-teal-100 text-teal-600 font-semibold text-[10px] px-2 py-1 rounded-lg transition-colors border border-teal-200/50"
                        >
                            Upgrade
                        </button>
                    )}
                    <button onClick={onEdit} className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-slate-50 rounded-lg">
                        <Edit size={16} />
                    </button>
                </div>
            </div>

            {isComplete ? (
                <div className="grid grid-cols-3 gap-3 flex-1 items-center">
                    {/* Blood */}
                    <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-2xl border border-red-100">
                        <Droplet size={20} className="text-red-500 mb-2" />
                        <span className="text-lg font-bold text-slate-800">{blood_type}</span>
                        <span className="text-[10px] text-slate-500 uppercase">Darah</span>
                    </div>
                    {/* Height */}
                    <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <Ruler size={20} className="text-blue-500 mb-2" />
                        <span className="text-lg font-bold text-slate-800">{height}</span>
                        <span className="text-[10px] text-slate-500 uppercase">cm</span>
                    </div>
                    {/* Weight */}
                    <div className="flex flex-col items-center justify-center p-3 bg-teal-50 rounded-2xl border border-teal-100">
                        <Weight size={20} className="text-teal-500 mb-2" />
                        <span className="text-lg font-bold text-slate-800">{weight}</span>
                        <span className="text-[10px] text-slate-500 uppercase">kg</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <User size={24} />
                    </div>
                    <p className="text-xs text-slate-500">Data fisik belum lengkap.</p>
                    <Button onClick={onEdit} variant="secondary" className="text-xs h-8">
                        Lengkapi Data
                    </Button>
                </div>
            )}
        </Card>
    );
};

// --- 4. BREATHING CARD (Animation & Game) ---
export const BreathingCard = () => {
    // Breathing State
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('Mulai'); // Mulai, Tarik, Tahan, Hembus
    const [technique, setTechnique] = useState('relax'); // relax (4-7-8), focus (4-4-4)
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionCount, setSessionCount] = useState(0);

    // Game State
    const [gameActive, setGameActive] = useState(false);
    const [gameTime, setGameTime] = useState(0);
    const [gameResult, setGameResult] = useState(null); // { time: 12.5, rating: 'Good' }

    // Techniques configuration
    const techniques = {
        relax: { name: 'Relax', cycles: [4, 7, 8], labels: ['Tarik', 'Tahan', 'Hembus'] },
        focus: { name: 'Fokus', cycles: [4, 4, 4], labels: ['Tarik', 'Tahan', 'Hembus'] }
    };

    // --- BREATHING TIMER LOGIC ---
    useEffect(() => {
        let interval = null;
        let phaseIndex = 0;
        let elapsedPhaseTime = 0;

        if (isActive) {
            const currentTech = techniques[technique];

            // Initial Set
            setPhase(currentTech.labels[0]);
            setTimeLeft(currentTech.cycles[0]);

            interval = setInterval(() => {
                elapsedPhaseTime++;
                const currentDuration = currentTech.cycles[phaseIndex];
                const remaining = currentDuration - elapsedPhaseTime;

                if (remaining >= 0) {
                    setTimeLeft(remaining);
                } else {
                    // Phase Change
                    phaseIndex = (phaseIndex + 1) % 3;
                    elapsedPhaseTime = 0;
                    setPhase(currentTech.labels[phaseIndex]);
                    setTimeLeft(currentTech.cycles[phaseIndex]);

                    // Cycle Complete
                    if (phaseIndex === 0) {
                        setSessionCount(c => c + 1);
                    }
                }
            }, 1000);
        } else {
            setPhase('Mulai');
            setTimeLeft(0);
            setSessionCount(0);
        }

        return () => clearInterval(interval);
    }, [isActive, technique]);

    // --- GAME TIMER LOGIC ---
    useEffect(() => {
        let interval;
        if (gameActive) {
            const startTime = Date.now();
            interval = setInterval(() => {
                setGameTime((Date.now() - startTime) / 1000);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [gameActive]);

    const handleGameToggle = () => {
        if (gameActive) {
            // Stop Game
            setGameActive(false);
            let rating = "Cukup";
            if (gameTime > 60) rating = "Paru-paru Besi!";
            else if (gameTime > 40) rating = "Luar Biasa";
            else if (gameTime > 20) rating = "Bagus";

            setGameResult({ time: gameTime.toFixed(1), rating });
        } else {
            // Start Game
            setGameActive(true);
            setGameTime(0);
            setGameResult(null);
            setIsActive(false); // Stop breathing exercise if running
        }
    };

    return (
        <Card className="h-full min-h-[400px] bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-none shadow-xl shadow-cyan-500/20 flex flex-col relative overflow-hidden">
            {/* Header & Selector */}
            <div className="flex justify-between items-start p-6 z-10">
                <div>
                    <h3 className="text-lg font-bold">Latihan Pernapasan</h3>
                    <p className="text-cyan-100 text-xs">Relaksasi paru-paru Anda</p>
                </div>
                <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                    <button
                        onClick={() => { !isActive && setTechnique('relax'); setGameResult(null); }}
                        className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", technique === 'relax' ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/10")}
                    >
                        Relax
                    </button>
                    <button
                        onClick={() => { !isActive && setTechnique('focus'); setGameResult(null); }}
                        className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", technique === 'focus' ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/10")}
                    >
                        Fokus
                    </button>
                </div>
            </div>

            {/* Main Animation Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-8">
                {/* Breathing Circle */}
                <div className="relative flex items-center justify-center mb-6">
                    {/* Outer Rings - Dynamic based on phase */}
                    <motion.div
                        animate={isActive ? {
                            scale: phase === 'Tarik' ? [1, 1.5] : phase === 'Hembus' ? [1.5, 1] : 1.5,
                            opacity: [0.3, 0.1]
                        } : { scale: 1, opacity: 0.1 }}
                        transition={{ duration: isActive ? (phase === 'Tarik' || phase === 'Hembus' ? techniques[technique].cycles[phase === 'Tarik' ? 0 : 2] : 0.5) : 2 }}
                        className="absolute w-56 h-56 rounded-full border-2 border-white/30"
                    />
                    <motion.div
                        animate={isActive ? {
                            scale: phase === 'Tarik' ? [1, 1.3] : phase === 'Hembus' ? [1.3, 1] : 1.3,
                            opacity: [0.4, 0.2]
                        } : { scale: 1, opacity: 0.2 }}
                        transition={{ duration: isActive ? (phase === 'Tarik' || phase === 'Hembus' ? techniques[technique].cycles[phase === 'Tarik' ? 0 : 2] : 0.5) : 2 }}
                        className="absolute w-40 h-40 rounded-full border border-white/50"
                    />

                    {/* Main Circle Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={isActive ? { scale: phase === 'Tarik' ? [1, 1.2] : phase === 'Hembus' ? [1.2, 1] : 1.2 } : { scale: 1 }}
                        transition={{ duration: isActive ? (phase === 'Tarik' || phase === 'Hembus' ? techniques[technique].cycles[phase === 'Tarik' ? 0 : 2] : 0.5) : 0.5 }}
                        className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-full flex flex-col items-center justify-center shadow-inner border border-white/40 z-20 relative overflow-hidden group"
                        onClick={() => { setIsActive(!isActive); setGameResult(null); }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {isActive ? (
                            <>
                                <span className="text-3xl font-bold">{timeLeft}</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-80">{phase}</span>
                            </>
                        ) : (
                            <span className="font-bold text-sm tracking-widest uppercase">MULAI</span>
                        )}
                    </motion.button>
                </div>

                {/* Session Stats */}
                <div className="flex items-center gap-2 text-cyan-100 text-xs font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm mb-4">
                    <span>Sesi ini: {sessionCount} siklus</span>
                </div>

                {/* --- MINI GAME SECTION --- */}
                <div className="w-full px-6 mt-2">
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">Tantangan Tahan Napas</span>
                            {gameResult && <span className="text-xs font-bold text-yellow-300">{gameResult.rating}</span>}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGameToggle}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm",
                                    gameActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white hover:bg-cyan-50 text-cyan-900"
                                )}
                            >
                                {gameActive ? "STOP" : gameResult ? "COBA LAGI" : "MULAI TANTANGAN"}
                            </button>
                            <div className="w-20 text-right font-mono text-xl font-bold">
                                {gameActive ? gameTime.toFixed(1) : gameResult ? gameResult.time : "0.0"}s
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-white rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-300 rounded-full blur-[80px]"></div>
            </div>
        </Card>
    );
};
