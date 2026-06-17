import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ChevronDown, ChevronRight, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const LogicManager = ({ initialTree }) => {
    const [tree, setTree] = useState(initialTree || []);
    const [levels, setLevels] = useState({});
    const [expandedLevels, setExpandedLevels] = useState({ 0: true });
    const [selectedNode, setSelectedNode] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [mobilePanel, setMobilePanel] = useState('sidebar'); // 'sidebar' | 'editor'

    // --- LEVEL CALCULATION ALGORITHM ---
    useEffect(() => {
        if (!tree || tree.length === 0) return;

        const newLevels = {};
        const queue = [{ id: 'start', level: 0 }];
        const visited = new Set(['start']);
        const nodeMap = new Map(tree.map(n => [n.id, n]));

        // Initialize level 0
        newLevels[0] = [nodeMap.get('start')];

        // BFS to determine levels
        let head = 0;
        while (head < queue.length) {
            const { id, level } = queue[head++];
            const node = nodeMap.get(id);

            if (!node) continue;

            // Add to level map (avoid duplicates if already added by another parent)
            if (!newLevels[level]) newLevels[level] = [];
            if (!newLevels[level].find(n => n.id === id)) {
                // It might have been added to a previous level, but we want the "deepest" or "shallowest"? 
                // BFS gives shallowest. Let's stick to that for simplicity.
                // Actually, we need to ensure it's in the map.
                // If it's already in a previous level, we leave it there.
            } else {
                // Already in this level
            }

            // Find children
            if (node.options) {
                node.options.forEach(opt => {
                    if (opt.next && !visited.has(opt.next)) {
                        visited.add(opt.next);
                        const nextNode = nodeMap.get(opt.next);
                        if (nextNode) {
                            const nextLevel = level + 1;
                            if (!newLevels[nextLevel]) newLevels[nextLevel] = [];
                            newLevels[nextLevel].push(nextNode);
                            queue.push({ id: opt.next, level: nextLevel });
                        }
                    }
                });
            }
        }

        // Catch any orphaned nodes (not reachable from start)
        const orphaned = tree.filter(n => !visited.has(n.id));
        if (orphaned.length > 0) {
            newLevels['orphaned'] = orphaned;
        }

        setLevels(newLevels);
    }, [tree]);

    // --- ACTIONS ---

    const handleToggleLevel = (level) => {
        setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
    };

    const handleNodeClick = (node) => {
        setSelectedNode(node);
        setMobilePanel('editor'); // auto-switch to editor on mobile
    };

    const handleUpdateNode = (updatedNode) => {
        setTree(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
        setSelectedNode(updatedNode);
        setIsDirty(true);
    };

    const handleDeleteNode = (nodeId) => {
        if (nodeId === 'start') {
            alert("Tidak bisa menghapus Root Node!");
            return;
        }
        if (window.confirm(`Yakin hapus node ${nodeId}? Link dari node lain akan putus.`)) {
            setTree(prev => prev.filter(n => n.id !== nodeId));
            setSelectedNode(null);
            setIsDirty(true);
        }
    };

    const handleAddNode = () => {
        const id = prompt("Masukkan ID Node baru (unik, tanpa spasi):");
        if (!id) return;
        if (tree.find(n => n.id === id)) {
            alert("ID sudah ada!");
            return;
        }

        const newNode = {
            id,
            question: "Pertanyaan Baru...",
            type: 'choice',
            options: []
        };

        setTree(prev => [...prev, newNode]);
        // Add to orphaned initially until linked
        setIsDirty(true);
        setSelectedNode(newNode);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/expert/save-tree`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ treeData: tree })
            });
            const data = await res.json();
            if (data.success) {
                alert("Berhasil disimpan!");
                setIsDirty(false);
            } else {
                alert("Gagal menyimpan: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error koneksi server.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            {/* MOBILE: Tab toggle between sidebar and editor */}
            <div className="md:hidden flex border-b border-slate-200 bg-white">
                <button
                    onClick={() => setMobilePanel('sidebar')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${mobilePanel === 'sidebar' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                    Struktur Logika
                </button>
                <button
                    onClick={() => setMobilePanel('editor')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${mobilePanel === 'editor' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                    {selectedNode ? `Edit: ${selectedNode.id}` : 'Editor'}
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR: LEVELS & NODES */}
                <div className={`${mobilePanel === 'sidebar' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 border-r border-slate-200 bg-white overflow-y-auto flex-col`}>
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                        <h2 className="font-bold text-slate-800 text-sm md:text-base">Struktur Logika</h2>
                        <button onClick={handleAddNode} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                        {Object.keys(levels).map(level => (
                            <div key={level} className="border border-slate-100 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => handleToggleLevel(level)}
                                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
                                        {level === 'orphaned' ? 'Unlinked' : `Level ${level}`}
                                    </span>
                                    {expandedLevels[level] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>

                                {expandedLevels[level] && (
                                    <div className="bg-white p-2 space-y-1">
                                        {levels[level].map(node => (
                                            <button
                                                key={node.id}
                                                onClick={() => handleNodeClick(node)}
                                                className={`w-full text-left p-2.5 rounded-md text-sm flex items-center space-x-2 min-h-[44px] ${selectedNode?.id === node.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-slate-50 text-slate-600'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${node.type === 'result' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                                                <span className="truncate font-medium text-xs md:text-sm">{node.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL: EDITOR */}
                <div className={`${mobilePanel === 'editor' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-slate-50`}>
                    {/* TOOLBAR */}
                    <div className="bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 gap-3">
                        <div className="flex items-center min-w-0">
                            {isDirty && <span className="text-amber-600 text-xs font-medium flex items-center gap-1 truncate"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Belum disimpan</span>}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || saving}
                            className={`flex items-center px-3 py-2 min-h-[40px] rounded-lg font-medium text-sm transition-all shrink-0 ${isDirty ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            {saving ? 'Menyimpan...' : <><Save className="w-4 h-4 mr-1.5" /> Simpan</>}
                        </button>
                    </div>

                    {/* EDITOR FORM */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        {selectedNode ? (
                            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-8">
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1">Edit Node</h3>
                                        <p className="text-slate-500 font-mono text-xs md:text-sm">ID: {selectedNode.id}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNode(selectedNode.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                                        title="Hapus Node"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {/* TYPE SELECTOR */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tipe Node</label>
                                        <select
                                            value={selectedNode.type}
                                            onChange={(e) => handleUpdateNode({ ...selectedNode, type: e.target.value })}
                                            className="w-full p-3 min-h-[44px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        >
                                            <option value="choice">Pilihan (Choice)</option>
                                            <option value="multi_choice">Pilihan Ganda</option>
                                            <option value="image_selection">Pilihan Gambar</option>
                                            <option value="audio_selection">Pilihan Audio</option>
                                            <option value="danger_check">Cek Bahaya</option>
                                            <option value="result">Hasil Diagnosis</option>
                                        </select>
                                    </div>

                                    {/* QUESTION / DIAGNOSIS */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            {selectedNode.type === 'result' ? 'Nama Diagnosis' : 'Pertanyaan'}
                                        </label>
                                        <textarea
                                            value={selectedNode.type === 'result' ? selectedNode.diagnosis : selectedNode.question}
                                            onChange={(e) => handleUpdateNode({
                                                ...selectedNode,
                                                [selectedNode.type === 'result' ? 'diagnosis' : 'question']: e.target.value
                                            })}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] text-sm"
                                        />
                                    </div>

                                    {/* DESCRIPTION / RECOMMENDATION */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            {selectedNode.type === 'result' ? 'Rekomendasi Medis' : 'Deskripsi (Opsional)'}
                                        </label>
                                        <textarea
                                            value={selectedNode.type === 'result' ? selectedNode.recommendation : (selectedNode.description || '')}
                                            onChange={(e) => handleUpdateNode({
                                                ...selectedNode,
                                                [selectedNode.type === 'result' ? 'recommendation' : 'description']: e.target.value
                                            })}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-sm"
                                        />
                                    </div>

                                    {/* OPTIONS EDITOR */}
                                    {selectedNode.type !== 'result' && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-sm font-bold text-slate-700">Opsi Jawaban</label>
                                                <button
                                                    onClick={() => {
                                                        const newOpt = { label: "Opsi Baru", value: "new_val", next: "start" };
                                                        handleUpdateNode({ ...selectedNode, options: [...(selectedNode.options || []), newOpt] });
                                                    }}
                                                    className="text-xs bg-white border border-slate-300 px-3 py-1.5 min-h-[36px] rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    + Tambah
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {selectedNode.options?.map((opt, idx) => (
                                                    <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Label"
                                                                value={opt.label}
                                                                onChange={(e) => {
                                                                    const newOpts = [...selectedNode.options];
                                                                    newOpts[idx].label = e.target.value;
                                                                    handleUpdateNode({ ...selectedNode, options: newOpts });
                                                                }}
                                                                className="flex-1 p-2 min-h-[40px] border border-slate-300 rounded text-sm"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Value"
                                                                value={opt.value}
                                                                onChange={(e) => {
                                                                    const newOpts = [...selectedNode.options];
                                                                    newOpts[idx].value = e.target.value;
                                                                    handleUpdateNode({ ...selectedNode, options: newOpts });
                                                                }}
                                                                className="w-1/3 p-2 min-h-[40px] border border-slate-300 rounded text-sm font-mono text-slate-500"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-400 shrink-0">NEXT:</span>
                                                            <input
                                                                type="text"
                                                                placeholder="ID Node Selanjutnya"
                                                                value={opt.next}
                                                                onChange={(e) => {
                                                                    const newOpts = [...selectedNode.options];
                                                                    newOpts[idx].next = e.target.value;
                                                                    handleUpdateNode({ ...selectedNode, options: newOpts });
                                                                }}
                                                                className={`flex-1 p-2 min-h-[40px] border rounded text-sm font-mono ${tree.find(n => n.id === opt.next) ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'}`}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newOpts = selectedNode.options.filter((_, i) => i !== idx);
                                                                    handleUpdateNode({ ...selectedNode, options: newOpts });
                                                                }}
                                                                className="p-2 min-w-[40px] min-h-[40px] text-red-400 hover:text-red-600 flex items-center justify-center"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* RESULT SPECIFIC FIELDS */}
                                    {selectedNode.type === 'result' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Severity</label>
                                                <select
                                                    value={selectedNode.severity}
                                                    onChange={(e) => handleUpdateNode({ ...selectedNode, severity: e.target.value })}
                                                    className="w-full p-3 min-h-[44px] border border-slate-300 rounded-lg text-sm"
                                                >
                                                    <option value="low">Low (Ringan)</option>
                                                    <option value="moderate">Moderate (Sedang)</option>
                                                    <option value="high">High (Berat)</option>
                                                    <option value="critical">Critical (Gawat Darurat)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Confidence (%)</label>
                                                <input
                                                    type="number"
                                                    value={selectedNode.confidence}
                                                    onChange={(e) => handleUpdateNode({ ...selectedNode, confidence: parseInt(e.target.value) })}
                                                    className="w-full p-3 min-h-[44px] border border-slate-300 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                                <Edit2 className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-base font-medium text-center">Pilih Node untuk Mengedit</p>
                                <p className="text-sm text-center mt-1">Gunakan "+" untuk membuat node baru</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogicManager;
