import React from 'react';
import { ClipboardList, Pill, Download, MapPin, Thermometer, Coffee, Wind } from 'lucide-react';

const ResultActionPlan = ({ severity }) => {
    return (
        <div className="space-y-6">
            {/* Card 1: Home Care */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-slate-900 font-bold flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    Rencana Perawatan
                </h3>
                <ul className="space-y-4">
                    <li className="flex items-start text-slate-600 text-sm">
                        <Coffee className="w-4 h-4 mr-3 mt-0.5 text-slate-400 flex-shrink-0" />
                        <span>Istirahat total minimal 2-3 hari untuk pemulihan.</span>
                    </li>
                    <li className="flex items-start text-slate-600 text-sm">
                        <Thermometer className="w-4 h-4 mr-3 mt-0.5 text-slate-400 flex-shrink-0" />
                        <span>Pantau suhu tubuh setiap 6 jam.</span>
                    </li>
                    <li className="flex items-start text-slate-600 text-sm">
                        <Wind className="w-4 h-4 mr-3 mt-0.5 text-slate-400 flex-shrink-0" />
                        <span>Perbanyak minum air hangat (2 liter/hari).</span>
                    </li>
                </ul>
            </div>

            {/* Card 2: OTC Meds */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-slate-900 font-bold flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Pill className="w-5 h-5 text-purple-600" />
                    </div>
                    Saran Pengobatan (OTC)
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Paracetamol</div>
                            <div className="text-xs text-slate-500">Jika demam {'>'} 38°C</div>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-white border rounded text-slate-600">Tablet</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Vitamin C + Zinc</div>
                            <div className="text-xs text-slate-500">Booster Imunitas</div>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-white border rounded text-slate-600">1x Sehari</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 italic text-center">
                    *Konsultasikan dengan apoteker sebelum membeli obat
                </p>
            </div>

            {/* Card 3: Download & Map */}
            <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                    <Download className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                    <span className="text-xs font-bold text-slate-600">Unduh PDF</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                    <MapPin className="w-6 h-6 text-slate-400 group-hover:text-red-600 mb-2 transition-colors" />
                    <span className="text-xs font-bold text-slate-600">Faskes Terdekat</span>
                </button>
            </div>
        </div>
    );
};

export default ResultActionPlan;
