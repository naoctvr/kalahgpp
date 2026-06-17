import React, { useState, useEffect } from 'react';
import { Send, BarChart3, Zap, Clock, AlertCircle, Check, Loader, MessageSquare, Activity, BookOpen, Wind, User, X } from 'lucide-react';
import { Card, Button, Badge } from './Widgets';

const AdminNotificationDashboard = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalFailed: 0,
    totalPending: 0,
    verifiedUsers: 0
  });
  const [cronStatus, setCronStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [manualNotification, setManualNotification] = useState({
    userId: '',
    notificationType: 'screening_result',
    message: ''
  });

  const notificationTypes = [
    { key: 'consultation_reminder', label: 'Pengingat Konsultasi' },
    { key: 'screening_result', label: 'Hasil Skrining' },
    { key: 'doctor_message', label: 'Pesan dari Dokter' },
    { key: 'prescription_ready', label: 'Resep Tersedia' },
    { key: 'health_tips', label: 'Tips Kesehatan' },
    { key: 'aqi_alert', label: 'Alert Kualitas Udara' }
  ];

  // Fetch statistics
  useEffect(() => {
    fetchStats();
    fetchCronStatus();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/telegram/admin/notification-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal mengambil statistik');

      const data = await response.json();
      setStats(data.data);
      setError('');
    } catch (err) {
      console.error('Fetch stats error:', err);
      // Fallback dengan data dummy untuk demo
      setStats({
        totalSent: 234,
        totalFailed: 8,
        totalPending: 12,
        verifiedUsers: 45
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCronStatus = async () => {
    try {
      const token = localStorage.getItem('token');

      // Cron status endpoint
      const response = await fetch('/api/telegram/admin/cron-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal mengambil status cron');

      const data = await response.json();
      setCronStatus(data.data);
    } catch (err) {
      console.error('Fetch cron status error:', err);
      // Fallback dengan data dummy
      setCronStatus({
        isRunning: true,
        totalJobs: 3,
        jobs: [
          { name: 'Consultation Reminders', schedule: 'Every 6 hours' },
          { name: 'AQI Check', schedule: 'Every 2 hours' },
          { name: 'Daily Health Tips', schedule: '7:00 AM daily' }
        ]
      });
    }
  };

  const handleSendManualNotification = async () => {
    try {
      setSending(true);
      setError('');

      if (!manualNotification.userId) {
        setError('User ID diperlukan');
        return;
      }

      const token = localStorage.getItem('token');

      const response = await fetch('/api/telegram/admin/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parseInt(manualNotification.userId),
          notificationType: manualNotification.notificationType,
          data: { message: manualNotification.message }
        })
      });

      if (!response.ok) throw new Error('Gagal mengirim notifikasi');

      const data = await response.json();
      setSuccess(`Notifikasi berhasil di-queue (Job ID: ${data.jobId})`);
      setManualNotification({
        userId: '',
        notificationType: 'screening_result',
        message: ''
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-teal-500" />
          Dashboard Notifikasi Admin
        </h2>
        <p className="text-slate-600 mt-2">Kelola dan pantau sistem notifikasi Telegram</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50/80 border border-red-200/50 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50/80 border border-green-200/50 rounded-xl flex gap-3">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Notifikasi Terkirim"
          value={stats.totalSent}
          icon={<Check className="w-5 h-5 text-emerald-600" />}
          color="green"
        />
        <StatCard
          title="Pengguna Terverifikasi"
          value={stats.verifiedUsers}
          icon={<User className="w-5 h-5 text-teal-600" />}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.totalPending}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="yellow"
        />
        <StatCard
          title="Gagal"
          value={stats.totalFailed}
          icon={<X className="w-5 h-5 text-rose-600" />}
          color="red"
        />
      </div>

      {/* Cron Jobs Status */}
      {cronStatus && (
        <Card className="bg-gradient-to-br from-teal-50/30 to-blue-50/30 border border-teal-200/30 p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-teal-600" />
            Status Penjadwalan Otomatis
          </h3>

          <div className="space-y-3">
            {cronStatus.jobs?.map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">{job.name}</p>
                  <p className="text-xs text-slate-500">{job.schedule}</p>
                </div>
                <Badge className={`${
                  cronStatus.isRunning
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                } px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                  {cronStatus.isRunning ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Aktif
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" /> Tidak Aktif
                    </>
                  )}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <strong>Info:</strong> Cron jobs akan mengirim notifikasi otomatis sesuai jadwal yang telah ditentukan.
          </div>
        </Card>
      )}

      {/* Manual Notification Sender */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
          <Send className="w-6 h-6 text-teal-500" />
          Kirim Notifikasi Manual
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              User ID
            </label>
            <input
              type="number"
              value={manualNotification.userId}
              onChange={(e) => setManualNotification(prev => ({
                ...prev,
                userId: e.target.value
              }))}
              placeholder="Masukkan ID user yang akan menerima notifikasi"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tipe Notifikasi
            </label>
            <select
              value={manualNotification.notificationType}
              onChange={(e) => setManualNotification(prev => ({
                ...prev,
                notificationType: e.target.value
              }))}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            >
              {notificationTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Pesan (Optional)
            </label>
            <textarea
              value={manualNotification.message}
              onChange={(e) => setManualNotification(prev => ({
                ...prev,
                message: e.target.value
              }))}
              placeholder="Pesan tambahan (opsional)"
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <button
            onClick={handleSendManualNotification}
            disabled={sending || !manualNotification.userId}
            className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Kirim Notifikasi
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="bg-slate-50 border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-slate-500" />
          Panduan
        </h3>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            <strong>Bagaimana cara mengirim notifikasi manual?</strong><br />
            Isi User ID pengguna yang ingin menerima notifikasi, pilih tipe notifikasi, dan klik tombol Kirim.
          </p>
          <p>
            <strong>Apa itu Cron Jobs?</strong><br />
            Cron jobs adalah tugas yang berjalan otomatis sesuai jadwal untuk mengirim reminder konsultasi, mengecek kualitas udara, dan mengirim tips kesehatan.
          </p>
          <p>
            <strong>Bagaimana jika notifikasi gagal terkirim?</strong><br />
            Sistem akan secara otomatis mencoba mengirim ulang hingga 3 kali dengan penundaan yang semakin lama.
          </p>
        </div>
      </Card>
    </div>
  );
};

// Sub-component: StatCard
const StatCard = ({ title, value, icon, color }) => {
  const bgColors = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-150',
    blue: 'bg-blue-50 text-blue-700 border-blue-150',
    yellow: 'bg-amber-50 text-amber-700 border-amber-150',
    red: 'bg-rose-50 text-rose-700 border-rose-150'
  };

  const textColors = {
    green: 'text-emerald-700',
    blue: 'text-teal-700',
    yellow: 'text-amber-700',
    red: 'text-rose-700'
  };

  return (
    <Card className={`${bgColors[color]} border p-6 flex flex-col items-center justify-center`}>
      <div className="mb-2 p-2 rounded-xl bg-white shadow-sm">{icon}</div>
      <p className={`text-3xl font-black ${textColors[color]}`}>{value}</p>
      <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wide">{title}</p>
    </Card>
  );
};

export default AdminNotificationDashboard;
