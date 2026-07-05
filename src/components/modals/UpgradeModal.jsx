import React, { useState } from 'react';
import { X, AlertCircle, Check, Loader, Crown, MessageSquare, Calendar, Bell, Sparkles, Zap, Shield, Send } from 'lucide-react';
import { Card, Button, Badge } from '../ui/Widgets';
import { useAuth } from '../../context/AuthContext';

const UpgradeModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    paymentMethod: 'credit_card'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  // Polling status verifikasi Telegram
  React.useEffect(() => {
    let intervalId = null;
    if (isOpen && verificationSent) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch('/api/telegram/status', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'x-user-id': user?.id
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.status && data.status.is_verified) {
              setSuccess('Notifikasi Telegram berhasil ditautkan!');
              clearInterval(intervalId);
              // Lanjutkan otomatis setelah delay singkat
              setTimeout(() => {
                completeUpgrade();
              }, 1500);
            }
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, verificationSent]);

  // Otomatis men-generate token verifikasi saat melangkah ke Step 3
  React.useEffect(() => {
    const obtainToken = async () => {
      if (currentStep === 3 && isOpen) {
        try {
          setLoading(true);
          setError('');
          const response = await fetch('/api/telegram/generate-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'x-user-id': user?.id
            }
          });
          if (!response.ok) {
            throw new Error('Gagal mendapatkan token verifikasi.');
          }
          const data = await response.json();
          if (data.token) {
            setVerificationToken(data.token);
            setVerificationSent(true);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    obtainToken();
  }, [currentStep, isOpen]);

  const proFeatures = [
    { icon: MessageSquare, text: 'Chat unlimited dengan semua dokter spesialis', highlight: true },
    { icon: Calendar, text: 'Booking konsultasi tanpa batas', highlight: true },
    { icon: Bell, text: 'Notifikasi & laporan harian via Telegram' },
    { icon: Sparkles, text: 'Riwayat diagnosa tanpa batas waktu' },
    { icon: Zap, text: 'Prioritas antrean konsultasi' },
    { icon: Shield, text: 'Analisa tren kesehatan bertenaga AI' },
  ];

  const handleContinue = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!verificationSent) {
        setError('Kirimkan verifikasi Telegram terlebih dahulu');
        return;
      }
      completeUpgrade();
    }
  };

  const completeUpgrade = async () => {
    try {
      setLoading(true);
      setError('');

      // Integrasikan update status premium user ke backend
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan: 'pro' })
      });

      if (!response.ok) {
        console.warn('Upgrade API returned status:', response.status);
      }

      // Update state user secara lokal
      updateUser({ is_premium: true });

      setSuccess('Upgrade ke Pro berhasil! Semua fitur premium telah aktif.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-3xl p-5 sm:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-100">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Upgrade ke Pro</h2>
            </div>
            <p className="text-slate-500 text-sm">Nikmati akses unlimited telemedicine & fitur premium</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all ${
                step <= currentStep
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step Indicator Text */}
        <div className="text-sm font-semibold text-teal-650 mb-6">
          Langkah {currentStep} dari 3 — {currentStep === 1 ? 'Review Fitur' : currentStep === 2 ? 'Pembayaran' : 'Hubungkan Telegram'}
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-200/50 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50/80 border border-green-200/50 rounded-xl flex gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* STEP 1: Review Fitur Pro */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">Pro Plan</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">Rp 49.000</span>
                    <span className="text-sm text-slate-400">/bulan</span>
                  </div>
                </div>
                <div className="bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <p className="text-xs font-bold text-teal-400">All-Inclusive</p>
                  <p className="text-[10px] text-teal-300/70">Tanpa biaya tambahan</p>
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-755 uppercase tracking-wider">Fitur yang Anda dapatkan</h3>
              {proFeatures.map((feature, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  feature.highlight ? 'bg-teal-50/50 border border-teal-100' : 'bg-slate-50 border border-slate-100'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    feature.highlight ? 'bg-teal-100' : 'bg-slate-100'
                  }`}>
                    <feature.icon className={`w-4 h-4 ${feature.highlight ? 'text-teal-600' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-sm font-medium ${feature.highlight ? 'text-teal-800' : 'text-slate-700'}`}>
                    {feature.text}
                  </span>
                  {feature.highlight && (
                    <span className="ml-auto text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full shrink-0">BARU</span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
              <p className="text-sm text-teal-800">
                <strong>💡 Bebas chat dokter manapun!</strong> Biaya Rp 49.000/bulan sudah termasuk unlimited chat dan booking konsultasi dengan seluruh dokter spesialis yang tersedia.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Data Pembayaran */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Metode Pembayaran</h3>

            <div className="space-y-3">
              {['credit_card', 'bank_transfer', 'e_wallet'].map(method => (
                <label key={method} className="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-teal-300 transition-all">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={formData.paymentMethod === method}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-4 h-4 accent-teal-600"
                  />
                  <span className="ml-3 font-semibold text-slate-900">
                    {method === 'credit_card' && 'Kartu Kredit'}
                    {method === 'bank_transfer' && 'Transfer Bank'}
                    {method === 'e_wallet' && 'E-Wallet (GoPay, OVO, Dana)'}
                  </span>
                </label>
              ))}
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>ℹ️ Catatan:</strong> Pembayaran akan diproses melalui gateway terenkripsi. Data kartu Anda dijaga dengan aman.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Telegram */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Aktifkan Notifikasi Telegram</h3>

            <p className="text-slate-655 text-sm">
              Dapatkan notifikasi real-time langsung di Telegram untuk:
            </p>

            <ul className="grid grid-cols-2 gap-3">
              {['Pengingat konsultasi', 'Hasil skrining', 'Pesan dokter', 'Resep tersedia', 'Alert polusi', 'Tips kesehatan'].map((feature, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600" />
                  {feature}
                </li>
              ))}
            </ul>

            {loading && !verificationToken ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader className="w-8 h-8 text-teal-500 animate-spin" />
                <p className="text-slate-500 text-sm">Menyiapkan token verifikasi aman...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                  <p className="text-teal-800 text-sm leading-relaxed">
                    Sistem kami telah menghasilkan token verifikasi aman untuk akun Anda. Klik tombol di bawah ini untuk menghubungkan bot Telegram secara otomatis.
                  </p>
                </div>

                <a
                  href={`https://t.me/healthycrm_bot?start=${verificationToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-center text-base shadow-md"
                >
                  <Send className="w-5 h-5 text-white" /> HUBUNGKAN TELEGRAM INSTAN
                </a>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-3">
                  <Loader className="w-5 h-5 text-teal-500 animate-spin" />
                  <p className="text-slate-600 text-sm font-medium">
                    Menunggu Anda menekan tombol "Start" di Telegram...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="mt-8 flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              ← Kembali
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleContinue}
              disabled={currentStep === 2 && !formData.paymentMethod}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              Lanjutkan →
            </button>
          ) : (
            <button
              onClick={handleContinue}
              disabled={loading || !verificationSent}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" /> Selesaikan Upgrade
                </>
              )}
            </button>
          )}

          {currentStep === 1 && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              Batal
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UpgradeModal;
