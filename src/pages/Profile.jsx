import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Phone, Calendar, Activity, Droplet, Ruler, Weight, Bell } from 'lucide-react';
import { Card, Button } from '../components/ui/Widgets';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NotificationSettings from '../components/ui/NotificationSettings';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'telegram'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        height: '',
        weight: '',
        blood_type: '',
        birth_date: '',
        emergency_contact: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const [medications, setMedications] = useState([]);
    const [medForm, setMedForm] = useState({
        medicine_name: '',
        dosage: '',
        frequency: '3x Sehari',
        times: '07:00,13:00,19:00'
    });
    const [medMessage, setMedMessage] = useState({ type: '', text: '' });

    // Fetch medications
    const fetchMedications = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_BASE}/medications/${user.id}`);
            const json = await res.json();
            if (json.success) {
                setMedications(json.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (activeTab === 'medication') {
            fetchMedications();
        }
    }, [activeTab]);

    const handleAddMedication = async (e) => {
        e.preventDefault();
        if (!user?.id) return;
        setMedMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${API_BASE}/medications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    ...medForm
                })
            });
            const json = await res.json();
            if (json.success) {
                setMedMessage({ type: 'success', text: 'Jadwal pengingat obat berhasil ditambahkan!' });
                setMedForm({
                    medicine_name: '',
                    dosage: '',
                    frequency: '3x Sehari',
                    times: '07:00,13:00,19:00'
                });
                fetchMedications();
            } else {
                setMedMessage({ type: 'error', text: json.message || 'Gagal menambahkan obat.' });
            }
        } catch (err) {
            setMedMessage({ type: 'error', text: err.message });
        }
    };

    const handleDeleteMedication = async (id) => {
        if (!window.confirm('Hapus jadwal pengingat obat ini?')) return;
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

    const handleTriggerMedNotification = async (id) => {
        try {
            setMedMessage({ type: 'success', text: 'Mengirimkan notifikasi tes ke Telegram Anda...' });
            const res = await fetch(`${API_BASE}/medications/${id}/trigger`, {
                method: 'POST'
            });
            const json = await res.json();
            if (json.success) {
                setMedMessage({ type: 'success', text: '✅ Notifikasi pengingat obat berhasil dikirim ke Telegram Anda!' });
            } else {
                setMedMessage({ type: 'error', text: json.message || 'Gagal mengirim notifikasi.' });
            }
        } catch (err) {
            setMedMessage({ type: 'error', text: err.message });
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (user?.id) {
                    const result = await api.getProfile(user.id);
                    if (result.success) {
                        // Format date for input
                        let dateStr = '';
                        try {
                            if (result.data.birth_date) {
                                const d = new Date(result.data.birth_date);
                                if (!isNaN(d.getTime())) {
                                    dateStr = d.toISOString().split('T')[0];
                                }
                            }
                        } catch (e) {
                            console.error("Date parsing error:", e);
                        }

                        setFormData({
                            ...result.data,
                            birth_date: dateStr
                        });
                    }
                }
            } catch (err) {
                console.error("Profile load error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        const result = await api.updateProfile(user.id, formData);
        if (result.success) {
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
        } else {
            setMessage({ type: 'error', text: 'Gagal memperbarui profil.' });
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            Pengaturan Profil
                            {user?.is_premium && (
                                <span className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-extrabold tracking-wider uppercase flex items-center gap-1">
                                    👑 PRO
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500">Kelola data pribadi dan informasi medis Anda untuk akurasi diagnosa.</p>
                    </div>
                </header>

                {/* Tabs Switcher */}
                <div className="flex border-b border-slate-200 mb-6 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
                            activeTab === 'profile'
                                ? 'border-teal-600 text-teal-600 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        👤 Profil & Data Biologis
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('telegram')}
                        className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
                            activeTab === 'telegram'
                                ? 'border-teal-600 text-teal-600 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        🔔 Notifikasi Telegram
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('medication')}
                        className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
                            activeTab === 'medication'
                                ? 'border-teal-600 text-teal-600 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        💊 Jadwal Obat (Pro)
                    </button>
                </div>

                <Card className="p-8 shadow-lg">
                    {activeTab === 'profile' ? (
                        <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Basic Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Informasi Akun</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Medical Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Data Biologis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tinggi Badan (cm)</label>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            name="height"
                                            value={formData.height || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                            placeholder="170"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Berat Badan (kg)</label>
                                    <div className="relative">
                                        <Weight className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                            placeholder="65"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Golongan Darah</label>
                                    <div className="relative">
                                        <Droplet className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                        <select
                                            name="blood_type"
                                            value={formData.blood_type || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none appearance-none bg-white transition-all"
                                        >
                                            <option value="">Pilih...</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="AB">AB</option>
                                            <option value="O">O</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Kontak Darurat</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={formData.birth_date || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon Darurat</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="emergency_contact"
                                            value={formData.emergency_contact || ''}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                            placeholder="0812..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        {message.text && (
                            <div className={`p-4 rounded-lg text-sm flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message.type === 'success' ? <Activity className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                                {message.text}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-teal-500/30">
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>

                    </form>
                    ) : activeTab === 'telegram' ? (
                        <NotificationSettings />
                    ) : (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-2 flex items-center justify-between">
                                    <span>💊 Jadwal Pengingat Obat Telegram</span>
                                    {!user?.is_premium && (
                                        <span className="text-xs bg-amber-500/10 text-amber-600 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                                            Pro Feature
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    Simpan jadwal konsumsi obat Anda secara berkala. Sistem akan otomatis mengirimkan push notification pengingat minum obat beserta dosis tepatnya langsung ke akun Telegram Anda!
                                </p>
                            </div>

                            {!user?.is_premium ? (
                                <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200/60 max-w-lg mx-auto">
                                    <span className="text-4xl block mb-3">🔒</span>
                                    <h4 className="font-bold text-slate-900 text-base mb-1">Fitur Terkunci</h4>
                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                        Pengingat obat Telegram otomatis merupakan fitur eksklusif member Pro. Lakukan aktivasi untuk mendapatkan notifikasi obat tepat dosis secara instan.
                                    </p>
                                    <Link 
                                        to="/pricing"
                                        className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md"
                                    >
                                        Upgrade ke Pro ⚡
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    {/* Form Tambah Obat (Hanya untuk Dokter/Admin) */}
                                    {(user?.role === 'expert' || user?.role === 'admin') && (
                                        <form onSubmit={handleAddMedication} className="lg:col-span-5 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-150">
                                            <h4 className="font-bold text-slate-900 text-sm mb-3">Tambah Jadwal Obat</h4>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Nama Obat</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={medForm.medicine_name}
                                                    onChange={(e) => setMedForm({ ...medForm, medicine_name: e.target.value })}
                                                    placeholder="Contoh: Symbicort Inhaler"
                                                    className="w-full px-4 py-2 bg-white border border-slate-250 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
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
                                                    className="w-full px-4 py-2 bg-white border border-slate-250 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Frekuensi</label>
                                                    <select
                                                        value={medForm.frequency}
                                                        onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
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
                                                        className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {medMessage.text && (
                                                <div className={`p-3 rounded-lg text-xs font-medium ${medMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'}`}>
                                                    {medMessage.text}
                                                </div>
                                            )}

                                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl shadow-md">
                                                ➕ Tambah Pengingat
                                            </Button>
                                        </form>
                                    )}

                                    {/* List Jadwal Obat Aktif */}
                                    <div className={`${(user?.role === 'expert' || user?.role === 'admin') ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-slate-900 text-sm">Daftar Obat Aktif</h4>
                                            {user?.role === 'patient' && (
                                                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
                                                    📌 Resep dari Dokter Spesialis
                                                </span>
                                            )}
                                        </div>

                                        {medications.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                                                Tidak ada jadwal obat aktif dari dokter Anda.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {medications.map((med) => (
                                                    <div key={med.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">💊</span>
                                                                <h5 className="font-bold text-slate-950 text-sm">{med.medicine_name}</h5>
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium">
                                                                Dosis: <strong className="text-slate-800">{med.dosage}</strong> • Frekuensi: <strong className="text-slate-800">{med.frequency}</strong>
                                                            </p>
                                                            <p className="text-[11px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full w-fit">
                                                                ⏰ Jadwal Jam: {med.times}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleTriggerMedNotification(med.id)}
                                                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 active:scale-95"
                                                                title="Tes kirim notifikasi sekarang juga ke Telegram Anda"
                                                            >
                                                                ⚡ Tes Kirim
                                                            </button>
                                                            {(user?.role === 'expert' || user?.role === 'admin') && (
                                                                <button
                                                                    onClick={() => handleDeleteMedication(med.id)}
                                                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-xl transition active:scale-95"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Profile;
