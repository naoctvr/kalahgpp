import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, CheckCircle, X } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

const DailyTestModal = ({ isOpen, onClose, onComplete }) => {
    const isMobile = useIsMobile();
    const [step, setStep] = useState('intro'); // intro, testing, result
    const [isHolding, setIsHolding] = useState(false);
    const [timer, setTimer] = useState(0);
    const [score, setScore] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isOpen) setStep('intro');
    }, [isOpen]);

    const startTest = () => {
        setIsHolding(true);
        setTimer(0);
        intervalRef.current = setInterval(() => {
            setTimer(prev => prev + 0.1);
        }, 100);
    };

    const stopTest = () => {
        if (!isHolding) return;
        setIsHolding(false);
        clearInterval(intervalRef.current);

        // Calculate Score
        let calculatedScore = 0;
        if (timer < 10) calculatedScore = 40;
        else if (timer < 25) calculatedScore = 75;
        else calculatedScore = 95;

        setScore(calculatedScore);
        setStep('result');
    };

    const handleFinish = () => {
        onComplete(score);
        onClose();
    };

    if (!isOpen) return null;

    // Modal inner content shared between mobile and desktop
    const modalContent = (
        <div className="p-8 text-center">

            {step === 'intro' && (
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                        <Wind size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Tes Kesehatan Harian</h2>
                        <p className="text-slate-500 mt-2">
                            Mari periksa kapasitas paru-paru Anda hari ini. Tarik napas dalam-dalam, lalu tekan dan tahan tombol di bawah.
                        </p>
                    </div>
                    <button
                        onClick={() => setStep('testing')}
                        className="w-full py-4 min-h-[44px] bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-teal-500/30"
                    >
                        Mulai Tes
                    </button>
                </div>
            )}

            {step === 'testing' && (
                <div className="space-y-8 py-8">
                    <h3 className="text-xl font-semibold text-slate-700">Tahan Napas...</h3>

                    <div className="relative h-48 flex items-center justify-center">
                        <motion.button
                            onMouseDown={startTest}
                            onMouseUp={stopTest}
                            onMouseLeave={stopTest}
                            onTouchStart={startTest}
                            onTouchEnd={stopTest}
                            whileTap={{ scale: 0.95 }}
                            className={`
                      w-40 h-40 rounded-full border-8 flex items-center justify-center
                      transition-all duration-200 relative z-20
                      ${isHolding ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-300'}
                    `}
                        >
                            <span className="text-4xl font-mono font-bold text-slate-800">
                                {timer.toFixed(1)}s
                            </span>
                        </motion.button>

                        {isHolding && (
                            <motion.div
                                initial={{ width: '10rem', height: '10rem', opacity: 1 }}
                                animate={{ width: '20rem', height: '20rem', opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute rounded-full border-2 border-teal-500/30"
                            />
                        )}
                    </div>

                    <p className="text-sm text-slate-400 animate-pulse">
                        {isHolding ? "Tahan terus..." : "Tekan & Tahan tombol lingkaran"}
                    </p>
                </div>
            )}

            {step === 'result' && (
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Tes Selesai!</h2>
                        <div className="text-5xl font-bold text-teal-600 my-4">{score}</div>
                        <p className="text-slate-500">
                            {score >= 80 ? "Kapasitas paru-paru Anda sangat baik hari ini." :
                                score >= 50 ? "Kapasitas paru-paru Anda cukup baik." :
                                    "Kapasitas paru-paru Anda perlu perhatian."}
                        </p>
                    </div>
                    <button
                        onClick={handleFinish}
                        className="w-full py-4 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-colors"
                    >
                        Simpan & Lanjutkan ke Dashboard
                    </button>
                </div>
            )}

        </div>
    );

    return (
        <AnimatePresence>
            {isMobile ? (
                // Mobile: bottom sheet
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="dailytest-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md"
                        onClick={onClose}
                    />
                    {/* Bottom sheet */}
                    <motion.div
                        key="dailytest-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className="fixed inset-x-0 bottom-0 z-[100] bg-white rounded-t-3xl max-h-[90vh] flex flex-col"
                    >
                        {/* Drag handle */}
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-2 shrink-0" />

                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1">
                            {modalContent}
                        </div>
                    </motion.div>
                </>
            ) : (
                // Desktop: centered dialog
                <motion.div
                    key="dailytest-dialog"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative"
                    >
                        {modalContent}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DailyTestModal;
