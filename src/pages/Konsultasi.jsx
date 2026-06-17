import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MessageSquare, CheckCircle, AlertCircle, Plus, XCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import BookingModal from '../components/modals/BookingModal';
import PrescribeMedicationModal from '../components/modals/PrescribeMedicationModal';
import ProGateOverlay from '../components/ui/ProGateOverlay';
import { Card, Badge, Button, cn } from '../components/ui/Widgets';

const Konsultasi = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isPremium = user?.is_premium || user?.isPremium;
    const [appointments, setAppointments] = useState([]);
    const [diagnosisHistory, setDiagnosisHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    
    // State untuk resep obat saat penyelesaian sesi
    const [selectedMedAppointment, setSelectedMedAppointment] = useState(null);
    const [isMedModalOpen, setIsMedModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('upcoming');

    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let res;
            if (user.role === 'expert') {
                res = await api.getExpertAppointments(user.id);
            } else {
                res = await api.getPatientAppointments(user.id);
            }
            if (res.success) setAppointments(res.data);

            // Fetch diagnosis history for booking modal
            if (user.role === 'patient') {
                const histRes = await api.getHistory(user.id);
                if (histRes.success) setDiagnosisHistory(histRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const handleStatusUpdate = async (id, status) => {
        // Only for experts
        if (user.role !== 'expert') return;

        const responseText = status === 'approved' ? 'Jadwal dikonfirmasi.' : 'Mohon maaf, jadwal tidak tersedia.';
        const res = await api.respondAppointment(id, status, responseText);
        if (res.success) {
            fetchAppointments(); // Refresh list
        }
    };

    const handleCancelAppointment = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin membatalkan janji ini?')) {
            const res = await api.cancelAppointment(id);
            if (res.success) {
                fetchAppointments();
            }
        }
    };

    // Filter appointments
    const now = new Date();
    const upcomingAppointments = appointments.filter(a => new Date(a.requested_date) >= now && a.status !== 'rejected' && a.status !== 'cancelled');
    const historyAppointments = appointments.filter(a => new Date(a.requested_date) < now || a.status === 'rejected' || a.status === 'cancelled');

    const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : historyAppointments;

    const handleChat = (targetId) => {
        // Navigate to chat with the specific contact ID
        navigate('/chat', { state: { targetContactId: targetId } });
    };

    // --- FREE USER GATE for patients ---
    if (user?.role === 'patient' && !isPremium) {
        return (
            <div className="max-w-[1200px] mx-auto p-6 space-y-6 overflow-x-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Jadwal Konsultasi</h1>
                        <p className="text-slate-500">
                            Buat janji temu dengan dokter spesialis paru.
                        </p>
                    </div>
                    <Button
                        disabled
                        className="bg-slate-200 text-slate-400 cursor-not-allowed px-6 py-2.5 rounded-xl flex items-center gap-2"
                    >
                        <Lock size={18} />
                        Buat Janji Baru (Pro)
                    </Button>
                </div>

                <ProGateOverlay
                    feature="Konsultasi Dokter"
                    description="Buat janji temu dan konsultasi langsung dengan dokter spesialis paru. Biaya Rp 49.000/bulan sudah termasuk unlimited booking dan chat."
                    icon={Calendar}
                />
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto p-6 space-y-6 overflow-x-hidden">
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                userId={user?.id}
                history={diagnosisHistory} // Riwayat diagnosa user
                onSuccess={() => {
                    fetchAppointments();
                    setShowBookingModal(false);
                }}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Jadwal Konsultasi</h1>
                    <p className="text-slate-500">
                        {user?.role === 'expert'
                            ? 'Kelola jadwal praktek dan permintaan konsultasi masuk.'
                            : 'Lihat jadwal temu dengan dokter spesialis.'}
                    </p>
                </div>
                {user?.role === 'patient' && (
                    <Button
                        onClick={() => setShowBookingModal(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Buat Janji Baru
                    </Button>
                )}
            </div>

            {/* TAB CONTROLS */}
            <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-fit">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-medium transition-all w-full md:w-auto",
                        activeTab === 'upcoming' ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    Jadwal Aktif ({upcomingAppointments.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 w-full md:w-auto",
                        activeTab === 'history' ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Clock size={16} />
                    Riwayat ({historyAppointments.length})
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64 bg-white rounded-3xl border border-slate-100">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : displayedAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-3xl border border-slate-100">
                        <Calendar className="w-12 h-12 mb-4 opacity-20" />
                        <p>{activeTab === 'upcoming' ? 'Tidak ada jadwal aktif.' : 'Belum ada riwayat konsultasi.'}</p>
                    </div>
                ) : (
                    displayedAppointments.map((appt) => {
                        const dateObj = new Date(appt.requested_date);
                        const day = dateObj.getDate();
                        const month = dateObj.toLocaleDateString('id-ID', { month: 'short' });
                        const time = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                        const isExpert = user?.role === 'expert';

                        const statusConfig = {
                            approved: { label: 'Dikonfirmasi', cls: 'bg-emerald-100 text-emerald-700' },
                            rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
                            cancelled: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-500' },
                            pending: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700' },
                        };
                        const status = statusConfig[appt.status] || statusConfig.pending;

                        return (
                            <div key={appt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {/* Main row */}
                                <div className="flex items-center gap-3 p-4">
                                    {/* Date box */}
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100 text-blue-600 shrink-0">
                                        <span className="text-base font-bold leading-none">{day}</span>
                                        <span className="text-[10px] font-bold uppercase">{month}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-slate-800 text-sm truncate flex-1 min-w-0">
                                                {isExpert ? appt.patient_name : `dr. ${appt.doctor_name}${appt.doctor_title ? `, ${appt.doctor_title}` : ''}`}
                                            </h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${status.cls}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} />
                                                {time} WIB
                                            </span>
                                            {!isExpert && appt.doctor_title && (
                                                <span className="flex items-center gap-1">
                                                    <User size={11} />
                                                    {appt.doctor_title}
                                                </span>
                                            )}
                                        </div>
                                        {appt.notes && (
                                            <p className="text-xs text-slate-500 mt-1 truncate italic">"{appt.notes}"</p>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    <div className="shrink-0 flex items-center gap-2">
                                        {appt.status === 'approved' && (
                                            <>
                                                {isExpert && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMedAppointment(appt);
                                                            setIsMedModalOpen(true);
                                                        }}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1 active:scale-95"
                                                        title="Selesaikan Konsultasi & Resepkan Obat"
                                                    >
                                                        <CheckCircle size={18} />
                                                        <span className="text-xs font-bold px-1">Selesai</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleChat(isExpert ? appt.user_id : appt.doctor_id)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                                    title="Mulai Chat"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                            </>
                                        )}
                                        {!isExpert && appt.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelAppointment(appt.id)}
                                                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                        {isExpert && appt.status === 'pending' && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleStatusUpdate(appt.id, 'approved')}
                                                    className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(appt.id, 'rejected')}
                                                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expert diagnosis badge */}
                                {isExpert && appt.diagnosis_result && (
                                    <div className="px-4 pb-3">
                                        <span className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-1 rounded-lg">
                                            {appt.diagnosis_result} ({appt.confidence_score}%)
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal Resep Obat saat Menyelesaikan Konsultasi */}
            <PrescribeMedicationModal
                isOpen={isMedModalOpen}
                onClose={() => {
                    setIsMedModalOpen(false);
                    setSelectedMedAppointment(null);
                }}
                patientId={selectedMedAppointment?.user_id}
                patientName={selectedMedAppointment?.patient_name}
                appointmentId={selectedMedAppointment?.id}
                onCompleteSuccess={() => {
                    fetchAppointments();
                }}
            />
        </div>
    );
};

export default Konsultasi;
