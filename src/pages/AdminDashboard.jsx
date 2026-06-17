import React, { useState } from 'react';
import { Sparkles, Save, X, Check, Plus, FileText, Bell } from 'lucide-react';
import clsx from 'clsx';
import AdminNotificationDashboard from '../components/ui/AdminNotificationDashboard';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('logic');
    const [topic, setTopic] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedLogic, setGeneratedLogic] = useState(null);

    const handleAnalyze = () => {
        if (!topic) return;
        setIsAnalyzing(true);

        // Simulate API Call
        setTimeout(() => {
            setIsAnalyzing(false);
            setGeneratedLogic({
                id: 'new_node_' + Date.now(),
                question: `Apakah pasien mengalami gejala spesifik ${topic}?`,
                description: `Indikasi klinis untuk ${topic} seringkali meliputi demam tinggi dan batuk kering.`,
                options: [
                    { label: "Ya, Gejala Berat", value: 'severe' },
                    { label: "Ya, Gejala Ringan", value: 'mild' },
                    { label: "Tidak", value: 'no' }
                ]
            });
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Akses Pakar & Riset AI</h1>
                    <p className="text-blue-100 max-w-xl">
                        Gunakan Gemini AI untuk menganalisa tren penyakit baru dan mengupdate logika diagnosa secara real-time.
                    </p>
                </div>
                <Sparkles className="absolute right-8 top-8 w-32 h-32 text-white/10 rotate-12" />
            </div>

            {/* Tabs Switcher */}
            <div className="flex border-b border-slate-200 gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('logic')}
                    className={clsx(
                        "pb-3 px-4 font-semibold text-sm transition-all border-b-2",
                        activeTab === 'logic'
                            ? "border-blue-600 text-blue-600 font-bold"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                >
                    Logika Medis & Riset
                </button>
                <button
                    onClick={() => setActiveTab('crm')}
                    className={clsx(
                        "pb-3 px-4 font-semibold text-sm transition-all border-b-2",
                        activeTab === 'crm'
                            ? "border-blue-600 text-blue-600 font-bold"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    )}
                >
                    Monitoring CRM & Notifikasi
                </button>
            </div>

            {activeTab === 'logic' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                        Generator Logika Medis
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Topik Riset / Penyakit</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Contoh: Pneumonia Mycoplasma"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !topic}
                            className={clsx(
                                "w-full py-3 rounded-xl font-medium flex items-center justify-center transition-all",
                                isAnalyzing
                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                            )}
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                                    Menganalisa via Gemini...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Analisa & Buat Logika
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Result Preview */}
                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[300px]">
                    {generatedLogic ? (
                        <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in-up">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">New Logic Node</span>
                                <button onClick={() => setGeneratedLogic(null)} className="text-slate-400 hover:text-red-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h4 className="font-bold text-slate-900 text-lg mb-2">{generatedLogic.question}</h4>
                            <p className="text-sm text-slate-500 mb-4">{generatedLogic.description}</p>

                            <div className="space-y-2 mb-6">
                                {generatedLogic.options.map((opt, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 border border-slate-100">
                                        {opt.label}
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-3">
                                <button className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                                    Edit
                                </button>
                                <button className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center">
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve & Merge
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Hasil analisa akan muncul di sini</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Existing Logic List (Mock) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Database Logika Aktif</h3>
                    <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Manual
                    </button>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { id: 'L001', name: 'Triase Gawat Darurat', updated: '2 Jam yang lalu', status: 'Active' },
                        { id: 'L002', name: 'Algoritma Batuk Kronis', updated: '1 Hari yang lalu', status: 'Active' },
                        { id: 'L003', name: 'Deteksi Dini Pneumonia', updated: '3 Hari yang lalu', status: 'Review' },
                    ].map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs mr-4">
                                    {item.id}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">{item.name}</h4>
                                    <p className="text-xs text-slate-500">Updated: {item.updated}</p>
                                </div>
                            </div>
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                item.status === 'Active' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            )}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            </>
            ) : (
                <AdminNotificationDashboard />
            )}
        </div>
    );
};

export default AdminDashboard;
