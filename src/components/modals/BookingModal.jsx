import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, FileText, Stethoscope, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, cn } from '../ui/Widgets';
import { api } from '../../services/api';
import { useIsMobile } from '../../hooks/useIsMobile';

const BookingModal = ({ isOpen, onClose, userId, history, onSuccess }) => {
    const isMobile = useIsMobile();
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        diagnosisId: '',
        doctorId: '',
        date: '',
        time: '',
        notes: ''
    });

    const [doctorSchedule, setDoctorSchedule] = useState([]);
    const [conflictError, setConflictError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchDoctors();
            // Pre-select latest diagnosis if available
            if (history && history.length > 0) {
                setFormData(prev => ({ ...prev, diagnosisId: history[0].id }));
            }
        }
    }, [isOpen, history]);

    // Fetch doctor's specific schedule when selected
    useEffect(() => {
        if (formData.doctorId) {
            const fetchSchedule = async () => {
                const res = await api.getExpertAppointments(formData.doctorId);
                if (res.success) {
                    setDoctorSchedule(res.data);
                    // Re-validate if date/time already selected
                    if (formData.date && formData.time) validateConflict(formData.date, formData.time, res.data);
                }
            };
            fetchSchedule();
        }
    }, [formData.doctorId]);

    const fetchDoctors = async () => {
        setLoading(true); // Reuse loading state or add a specific one
        const res = await api.getDoctors();
        if (res.success) setDoctors(res.data);
        setLoading(false);
    };

    const validateConflict = (date, time, schedule = doctorSchedule) => {
        if (!date || !time) return false;

        const selectedDateTime = new Date(`${date} ${time}`);
        const now = new Date();
        const bufferMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

        // 1. Past Check
        if (selectedDateTime < now) {
            setConflictError("Waktu sudah berlalu. Pilih jam yang akan datang.");
            return true;
        }

        // 2. Minimum Notice Check (2 Hours)
        if (selectedDateTime - now < bufferMs) {
            setConflictError("Reservasi minimal 2 jam sebelum jadwal konsultasi.");
            return true;
        }

        const conflict = schedule.find(appt => {
            // Only check active appointments (approved or pending)
            if (appt.status === 'rejected' || appt.status === 'cancelled') return false;

            const apptTime = new Date(appt.requested_date);
            const diff = Math.abs(selectedDateTime - apptTime);

            return diff < bufferMs;
        });

        if (conflict) {
            const conflictTime = new Date(conflict.requested_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setConflictError(`Jadwal bertabrakan dengan sesi jam ${conflictTime}. Beri jeda minimal 2 jam.`);
            return true;
        }

        setConflictError(null);
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateConflict(formData.date, formData.time)) return;

        setLoading(true);

        // Combine date and time (MySQL format: YYYY-MM-DD HH:mm:ss)
        const dateTime = `${formData.date} ${formData.time}:00`;

        const res = await api.bookConsultation({
            userId,
            diagnosisId: formData.diagnosisId,
            doctorId: formData.doctorId,
            date: dateTime,
            notes: formData.notes
        });

        setLoading(false);
        if (res.success) {
            onSuccess();
            onClose();
            setStep(1);
            setFormData({ diagnosisId: '', doctorId: '', date: '', time: '', notes: '' });
            setConflictError(null);
        } else {
            alert('Gagal membuat janji: ' + res.message);
        }
    };

    if (!isOpen) return null;

    // Form content shared between mobile and desktop
    const formContent = (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-8">

            {/* 1. Select Diagnosis */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-teal-500" />
                    Pilih Hasil Diagnosa
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    <div
                        onClick={() => setFormData({ ...formData, diagnosisId: '' })}
                        className={cn(
                            "p-3 rounded-xl border cursor-pointer transition-all text-sm",
                            !formData.diagnosisId
                                ? "bg-teal-50 border-teal-500 text-teal-700 font-medium"
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:border-teal-300"
                        )}
                    >
                        -- Pilih Riwayat Diagnosa --
                    </div>
                    {history.map(h => (
                        <div
                            key={h.id}
                            onClick={() => setFormData({ ...formData, diagnosisId: h.id })}
                            className={cn(
                                "p-3 rounded-xl border cursor-pointer transition-all",
                                formData.diagnosisId === h.id
                                    ? "bg-teal-50 border-teal-500 shadow-sm"
                                    : "bg-white border-slate-200 hover:border-teal-300"
                            )}
                        >
                            <p className="text-xs text-slate-400 mb-0.5">
                                {new Date(h.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-sm font-medium text-slate-800 leading-tight">{h.final_result}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{h.confidence_score}% keyakinan</p>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                            Belum ada riwayat diagnosa.
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Select Doctor */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Stethoscope size={16} className="text-teal-500" />
                    Pilih Dokter Spesialis
                </label>
                <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto pr-2">
                    {doctors.length === 0 && (
                        <div className="text-center p-4 text-slate-500 text-sm border border-dashed border-slate-200 rounded-xl">
                            Tidak ada dokter tersedia saat ini.
                        </div>
                    )}
                    {doctors.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => setFormData({ ...formData, doctorId: doc.id })}
                            className={cn(
                                "p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all",
                                formData.doctorId === doc.id
                                    ? "bg-teal-50 border-teal-500 shadow-sm"
                                    : "bg-white border-slate-200 hover:border-teal-300"
                            )}
                        >
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-800">{doc.name}</p>
                                <p className="text-xs text-slate-500">{doc.title_degree || 'Sp.P'} - {doc.institution || 'RS Umum'}</p>
                            </div>
                            {formData.doctorId === doc.id && (
                                <div className="ml-auto w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white">
                                    <CheckCircle size={12} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Date & Time */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Calendar size={16} className="text-teal-500" />
                            Tanggal
                        </label>
                        <input
                            type="date"
                            required
                            className="w-full p-3 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={formData.date}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                setFormData(prev => ({ ...prev, date: newVal }));
                                validateConflict(newVal, formData.time);
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Clock size={16} className="text-teal-500" />
                            Jam
                        </label>
                        <input
                            type="time"
                            required
                            className={cn(
                                "w-full p-3 min-h-[44px] bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all",
                                conflictError
                                    ? "border-red-300 focus:ring-red-200 bg-red-50 text-red-600"
                                    : "border-slate-200 focus:ring-teal-500 bg-slate-50"
                            )}
                            value={formData.time}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                setFormData(prev => ({ ...prev, time: newVal }));
                                validateConflict(formData.date, newVal);
                            }}
                        />
                    </div>
                </div>
                {conflictError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
                    >
                        <AlertCircle size={14} className="shrink-0" />
                        {conflictError}
                    </motion.div>
                )}
            </div>

            {/* 4. Notes */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Catatan Tambahan</label>
                <textarea
                    className="w-full p-3 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
                    placeholder="Keluhan saat ini..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <Button
                type="submit"
                disabled={loading || !formData.doctorId || !!conflictError}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl shadow-lg shadow-teal-500/30 font-bold text-lg"
            >
                {loading ? 'Mengirim...' : 'Konfirmasi Janji Temu'}
            </Button>

        </form>
    );

    return (
        <AnimatePresence>
            {isMobile ? (
                // Mobile: bottom sheet
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="booking-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    {/* Bottom sheet */}
                    <motion.div
                        key="booking-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[90vh] flex flex-col"
                    >
                        {/* Drag handle */}
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-2 shrink-0" />

                        {/* Header */}
                        <div className="bg-teal-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">Buat Janji Temu</h2>
                                <p className="text-teal-100 text-sm">Konsultasi dengan Dokter Spesialis</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
                            {formContent}
                        </div>
                    </motion.div>
                </>
            ) : (
                // Desktop: centered dialog
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        key="booking-dialog"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-teal-600 p-6 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">Buat Janji Temu</h2>
                                <p className="text-teal-100 text-sm">Konsultasi dengan Dokter Spesialis</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto">
                            {formContent}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;
