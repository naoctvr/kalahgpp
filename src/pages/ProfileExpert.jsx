import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building, FileBadge, GraduationCap, Loader2, CheckCircle, AlertCircle, Stethoscope } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ProfileExpert = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        institution: '',
        title_degree: '',
        sip_number: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (user?.id) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/user/profile/${user.id}`);
            const data = await res.json();
            if (data.success) {
                setFormData({
                    name: data.data.name || '',
                    email: data.data.email || '',
                    institution: data.data.institution || '',
                    title_degree: data.data.title_degree || '',
                    sip_number: data.data.sip_number || ''
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch(`${API_BASE}/expert/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    institution: formData.institution,
                    title_degree: formData.title_degree,
                    sip_number: formData.sip_number
                })
            });
            const data = await res.json();
            setMessage(data.success
                ? { type: 'success', text: 'Profil pakar berhasil diperbarui.' }
                : { type: 'error', text: 'Gagal menyimpan perubahan.' }
            );
        } catch (err) {
            setMessage({ type: 'error', text: 'Terjadi kesalahan server.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    const inputClass = "w-full pl-10 pr-4 py-2.5 min-h-[44px] border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white";
    const disabledClass = "w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed";

    const displayName = formData.title_degree
        ? `${formData.name}, ${formData.title_degree}`
        : formData.name;

    return (
        <div className="max-w-2xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Stethoscope className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{displayName || 'Profil Pakar'}</h1>
                    <p className="text-sm text-slate-400">{formData.institution || 'Dokter Spesialis'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Informasi Akun */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Akun</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input type="text" value={formData.name} disabled className={disabledClass} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input type="email" value={formData.email} disabled className={disabledClass} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Profesional */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Data Profesional</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Gelar Akademis & Profesi</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input
                                    type="text"
                                    name="title_degree"
                                    value={formData.title_degree}
                                    onChange={handleChange}
                                    placeholder="Contoh: Sp.P, Sp.PD-KP"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Instansi / Rumah Sakit</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input
                                    type="text"
                                    name="institution"
                                    value={formData.institution}
                                    onChange={handleChange}
                                    placeholder="Nama Rumah Sakit / Klinik Praktik"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Nomor SIP (Surat Izin Praktik)</label>
                            <div className="relative">
                                <FileBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input
                                    type="text"
                                    name="sip_number"
                                    value={formData.sip_number}
                                    onChange={handleChange}
                                    placeholder="Nomor SIP yang berlaku"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success'
                            ? <CheckCircle className="w-4 h-4 shrink-0" />
                            : <AlertCircle className="w-4 h-4 shrink-0" />
                        }
                        {message.text}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 min-h-[44px] rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : 'Simpan Perubahan'}
                </button>

            </form>
        </div>
    );
};

export default ProfileExpert;
