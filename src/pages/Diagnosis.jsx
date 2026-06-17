import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decisionTree } from '../data/decisionTree';
import { ImageGrid, AudioPlayer } from '../components/ui/MultimediaCards';
import { AlertTriangle, CheckCircle, ArrowRight, ChevronLeft, Pill, Clock, Activity } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DiagnosisHeaderCard from '../components/diagnosis/result/DiagnosisHeaderCard';
import ClinicalAnalysis from '../components/diagnosis/result/ClinicalAnalysis';
import BookingModal from '../components/modals/BookingModal';

const neuralLungImage = "https://placehold.co/800x400/0f172a/06b6d4?text=Neural+Lungs+Diagnostic+Imaging&font=roboto";

const Diagnosis = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState(['start']);
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [answers, setAnswers] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [savedDiagnosisId, setSavedDiagnosisId] = useState(null);
    const hasSavedRef = useRef(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const currentNode = decisionTree.find(n => n.id === currentNodeId);
    const totalSteps = 10; // approximate
    const progress = Math.min((history.length / totalSteps) * 100, 95);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSelectedOption(null);
    }, [currentNodeId]);

    useEffect(() => {
        const saveResult = async () => {
            if (currentNode?.type === 'result' && user?.id && !hasSavedRef.current) {
                hasSavedRef.current = true;
                const res = await api.saveDiagnosis({
                    userId: user.id,
                    result: currentNode.diagnosis,
                    score: currentNode.confidence || (currentNode.severity === 'critical' ? 90 : 75),
                    symptoms: answers
                });
                if (res.success) { setSaveStatus('saved'); setSavedDiagnosisId(res.id); }
                else { setSaveStatus('error'); hasSavedRef.current = false; }
            }
        };
        saveResult();
    }, [currentNode, user, answers]);

    const handleNext = () => {
        if (!selectedOption) return;
        setAnswers(prev => ({ ...prev, [currentNodeId]: selectedOption }));
        if (selectedOption.next) {
            setHistory(prev => [...prev, selectedOption.next]);
            setCurrentNodeId(selectedOption.next);
        }
    };

    const handleBack = () => {
        if (history.length <= 1) return;
        const newHistory = [...history];
        newHistory.pop();
        setHistory(newHistory);
        setCurrentNodeId(newHistory[newHistory.length - 1]);
        setSelectedOption(null);
        hasSavedRef.current = false;
        setSaveStatus('idle');
    };

    const handleRestart = () => {
        setHistory(['start']);
        setCurrentNodeId('start');
        setAnswers({});
        setSelectedOption(null);
        hasSavedRef.current = false;
        setSaveStatus('idle');
    };

    if (!currentNode) return <div className="p-8 text-center text-slate-500">Error: Node not found</div>;

    const isResult = currentNode.type === 'result';

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4">
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                userId={user?.id}
                history={savedDiagnosisId ? [{
                    id: savedDiagnosisId,
                    final_result: currentNode.diagnosis,
                    confidence_score: currentNode.confidence || (currentNode.severity === 'critical' ? 90 : 75),
                    created_at: new Date().toISOString()
                }] : []}
                onSuccess={() => setIsBookingOpen(false)}
            />

            {/* Progress Bar */}
            {!isResult && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analisa Medis</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Tahap {history.length}
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            )}

            {/* Result Header */}
            {isResult && (
                <div className="mb-6">
                    <DiagnosisHeaderCard
                        diagnosis={currentNode.diagnosis}
                        severity={currentNode.severity}
                        confidence={currentNode.confidence}
                    />
                </div>
            )}

            {/* Layout: 2 kolom di desktop, 1 kolom di mobile */}
            <div className={isResult ? 'block' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
                {/* Main content */}
                <div className={isResult ? '' : 'lg:col-span-2'}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentNodeId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                    {isResult ? (
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <ClinicalAnalysis
                                    diagnosis={currentNode.diagnosis}
                                    recommendation={currentNode.recommendation}
                                    saveStatus={saveStatus}
                                    onRestart={handleRestart}
                                />
                            </div>

                            {/* Action cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Konsultasi */}
                                <div className="bg-white rounded-2xl p-5 border-2 border-teal-100 shadow-sm">
                                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
                                        <Clock className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1">Lanjut Konsultasi?</h3>
                                    <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                                        Jadwalkan sesi dengan dokter spesialis untuk penanganan lebih lanjut.
                                    </p>
                                    <button
                                        onClick={() => setIsBookingOpen(true)}
                                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-teal-500/20"
                                    >
                                        Buat Janji Temu
                                    </button>
                                </div>

                                {/* OTC */}
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
                                        <Pill className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1">Rekomendasi OTC</h3>
                                    <p className="text-xs text-slate-400 mb-3">Obat bebas untuk meredakan gejala:</p>
                                    <ul className="space-y-1.5">
                                        {['Paracetamol 500mg', 'Ambroxol', 'Vitamin C 1000mg'].map(med => (
                                            <li key={med} className="flex items-center gap-2 text-xs text-slate-700">
                                                <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                                {med}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg p-2 mt-3 leading-tight">
                                        *Konsultasikan dengan apoteker sebelum membeli.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Visual Aid */}
                            {(currentNode.image || currentNodeId === 'start') && (
                                <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                    <img
                                        src={currentNode.image || neuralLungImage}
                                        alt="Visual Aid"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                    {currentNode.type === 'danger_check' && (
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <span className="text-white font-bold text-sm flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-yellow-400/30">
                                                <AlertTriangle className="w-4 h-4 text-yellow-400 animate-pulse shrink-0" />
                                                Periksa Tanda Klinis Ini
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-5 md:p-6">
                                {/* Question */}
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 leading-tight">
                                    {currentNode.question}
                                </h2>
                                {currentNode.description && (
                                    <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-5">
                                        {currentNode.description}
                                    </p>
                                )}

                                {/* Options */}
                                <div className="space-y-2.5">
                                    {currentNode.type === 'image_selection' ? (
                                        <ImageGrid
                                            options={currentNode.options}
                                            selectedValue={selectedOption?.value}
                                            onSelect={handleOptionSelect => setSelectedOption(handleOptionSelect)}
                                        />
                                    ) : currentNode.type === 'audio_selection' ? (
                                        <div className="space-y-3">
                                            {currentNode.options.map(opt => (
                                                <AudioPlayer
                                                    key={opt.value}
                                                    src={opt.audio}
                                                    label={opt.label}
                                                    isSelected={selectedOption?.value === opt.value}
                                                    onSelect={() => setSelectedOption(opt)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        currentNode.options.map((opt, idx) => {
                                            const isSelected = selectedOption?.value === opt.value;
                                            return (
                                                <motion.button
                                                    key={opt.value}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => setSelectedOption(opt)}
                                                    className={clsx(
                                                        "w-full text-left px-4 py-3.5 min-h-[52px] rounded-xl border-2 transition-all flex items-center justify-between gap-3",
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                                                            : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white active:scale-[0.99]"
                                                    )}
                                                >
                                                    <span className={clsx(
                                                        "font-medium text-sm md:text-base leading-snug",
                                                        isSelected ? "text-blue-700" : "text-slate-700"
                                                    )}>
                                                        {opt.label}
                                                    </span>
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-500"
                                                            : "border-slate-300"
                                                    )}>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-2 h-2 bg-white rounded-full"
                                                            />
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                                    <button
                                        onClick={handleBack}
                                        disabled={history.length <= 1}
                                        className="flex items-center gap-1.5 px-4 py-2.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 font-medium text-sm transition-colors hover:bg-slate-100 rounded-xl"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Kembali
                                    </button>

                                    <motion.button
                                        onClick={handleNext}
                                        disabled={!selectedOption}
                                        whileTap={selectedOption ? { scale: 0.97 } : {}}
                                        className={clsx(
                                            "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                                            selectedOption
                                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                                : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                        )}
                                    >
                                        Lanjut
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
                    </AnimatePresence>

                    {/* Info card — mobile only (di bawah konten) */}
                    {!isResult && (
                        <div className="mt-4 lg:hidden">
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Panduan</p>
                                <p className="text-xs text-slate-500 leading-relaxed">Jawab sesuai kondisi yang Anda rasakan saat ini.</p>
                                <div className="mt-2 text-xs text-blue-600 font-medium">💡 Pilih gejala yang paling dominan</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar — desktop only, hanya saat bukan result */}
                {!isResult && (
                    <div className="hidden lg:flex flex-col gap-4">
                        {/* Panduan */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Panduan Pasien</p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Jawab setiap pertanyaan sesuai dengan kondisi yang Anda rasakan saat ini.
                            </p>
                            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium">
                                💡 Jika ragu, pilih gejala yang paling dominan.
                            </div>
                        </div>

                        {/* Riwayat tahap */}
                        <div className="bg-slate-900 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Riwayat Tahap</p>
                            <div className="space-y-2">
                                {history.slice(1).map((_, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full shrink-0" />
                                        <span className="text-xs text-slate-400">Tahap {idx + 1} selesai</span>
                                    </div>
                                ))}
                                {history.length === 1 && (
                                    <p className="text-xs text-slate-500 italic">Belum ada tahap selesai</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Diagnosis;
