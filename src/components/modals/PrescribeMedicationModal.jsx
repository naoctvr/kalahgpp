import React, { useState, useEffect } from 'react';
import { X, Check, Activity, Plus, Clock, Trash2 } from 'lucide-react';
import { Button } from '../ui/Widgets';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const PrescribeMedicationModal = ({ isOpen, onClose, patientId, patientName, appointmentId, onCompleteSuccess }) => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [medForm, setMedForm] = useState({
        medicine_name: '',
        dosage: '',
        frequency: '3x Sehari',
        times: '07:00,13:00,19:00'
    });
    const [medMessage, setMedMessage] = useState({ type: '', text: '' });

    const fetchMedications = async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/medications/${patientId}`);
            const json = await res.json();
            if (json.success) {
                setMedications(json.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && patientId) {
            fetchMedications();
            setMedMessage({ type: '', text: '' });
        }
    }, [isOpen, patientId]);

    const handleCompleteConsultation = async () => {
        if (!appointmentId) return;
        setCompleting(true);
        setMedMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${API_BASE}/expert/appointments/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    patientId
                })
            });
            const json = await res.json();
            if (json.success) {
                if (onCompleteSuccess) onCompleteSuccess();
                onClose();
            } else {
                setMedMessage({ type: 'error', text: json.message || 'Gagal menyelesaikan sesi.' });
            }
        } catch (err) {
            setMedMessage({ type: 'error', text: err.message });
        } finally {
            setCompleting(false);
        }
    };

    const handleAddMedication = async (e) => {
        e.preventDefault();
        setMedMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${API_BASE}/medications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: patientId,
                    ...medForm
                })
            });
            const json = await res.json();
            if (json.success) {
                setMedMessage({ type: 'success', text: 'Resep obat berhasil ditambahkan!' });
                setMedForm({
                    medicine_name: '',
                    dosage: '',
                    frequency: '3x Sehari',
                    times: '07:00,13:00,19:00'
                });
                fetchMedications();
            } else {
                setMedMessage({ type: 'error', text: json.message || 'Gagal meresepkan obat.' });
            }
        } catch (err) {
            setMedMessage({ type: 'error', text: err.message });
        }
    };

    const handleDeleteMedication = async (id) => {
        if (!window.confirm('Batalkan resep obat ini?')) return;
        try {
            const res = await fetch(`${API_BASE}/medications/${id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                fetchMedications();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-600 shrink-0" />
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-900">
                                Kelola Resep & Jadwal Obat
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Pasien: <strong className="text-slate-800">{patientName}</strong></p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Form Tambah Resep */}
                    <form onSubmit={handleAddMedication} className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-150">
                        <h4 className="font-bold text-slate-900 text-sm mb-2">Resepkan Obat Baru</h4>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Nama Obat</label>
                            <input
                                type="text"
                                required
                                value={medForm.medicine_name}
                                onChange={(e) => setMedForm({ ...medForm, medicine_name: e.target.value })}
                                placeholder="Contoh: Symbicort Inhaler"
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Dosis Penggunaan</label>
                            <input
                                type="text"
                                required
                                value={medForm.dosage}
                                onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                                placeholder="Contoh: 2 Isapan (Puff)"
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Frekuensi</label>
                                <select
                                    value={medForm.frequency}
                                    onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                >
                                    <option value="1x Sehari">1x Sehari</option>
                                    <option value="2x Sehari">2x Sehari</option>
                                    <option value="3x Sehari">3x Sehari</option>
                                    <option value="4x Sehari">4x Sehari</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Jam Jadwal</label>
                                <input
                                    type="text"
                                    required
                                    value={medForm.times}
                                    onChange={(e) => setMedForm({ ...medForm, times: e.target.value })}
                                    placeholder="07:00,13:00,19:00"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                        </div>

                        {medMessage.text && (
                            <div className={`p-3 rounded-lg text-xs font-medium ${medMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'}`}>
                                {medMessage.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Simpan Resep
                        </Button>
                    </form>

                    {/* Right: List Resep Aktif */}
                    <div className="lg:col-span-7 space-y-4">
                        <h4 className="font-bold text-slate-900 text-sm">Resep Aktif Saat Ini</h4>
                        
                        {loading ? (
                            <div className="text-center py-8 text-slate-400 text-sm">Memuat resep...</div>
                        ) : medications.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                                Pasien ini belum memiliki resep obat aktif.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                {medications.map((med) => (
                                    <div key={med.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                                        <div>
                                            <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-teal-650 shrink-0" /> {med.medicine_name}
                                            </h5>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Dosis: <strong className="text-slate-800">{med.dosage}</strong> • Frekuensi: <strong className="text-slate-800">{med.frequency}</strong>
                                            </p>
                                            <p className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full w-fit mt-1.5 flex items-center gap-1 border border-teal-100">
                                                <Clock className="w-3 h-3 text-teal-600" /> Jam: {med.times}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMedication(med.id)}
                                            className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-150 text-xs font-bold px-3 py-1.5 rounded-xl active:scale-95 transition flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div>
                        {appointmentId && (
                            <span className="text-xs text-slate-500 italic">
                                * Menyelesaikan sesi akan mengirimkan ringkasan resep obat ini ke Telegram pasien.
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={onClose} 
                            className="bg-slate-200 hover:bg-slate-250 text-slate-700 border-none font-bold px-6 py-2.5 rounded-xl text-sm"
                            disabled={completing}
                        >
                            Tutup
                        </Button>
                        {appointmentId && (
                            <Button 
                                onClick={handleCompleteConsultation} 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-extrabold px-6 py-2.5 rounded-xl shadow-md text-sm flex items-center gap-2 active:scale-95"
                                disabled={completing}
                            >
                                {completing ? 'Memproses...' : (
                                    <>
                                        <Check className="w-4 h-4" /> Selesaikan & Kirim Resep
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PrescribeMedicationModal;