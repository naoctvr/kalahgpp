import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Copy, Check, Loader, AlertCircle, Clock, Activity, MessageSquare, BookOpen, Wind, Send, X } from 'lucide-react';
import { Card, Button, Badge } from './Widgets';

const NotificationSettings = () => {
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const notificationTypes = [
    {
      key: 'consultation_reminder',
      label: 'Pengingat Konsultasi',
      description: 'Notifikasi 1 hari & 1 jam sebelum jadwal konsultasi',
      icon: Clock
    },
    {
      key: 'screening_result',
      label: 'Hasil Skrining',
      description: 'Hasil pemeriksaan kesehatan paru Anda tersedia',
      icon: Activity
    },
    {
      key: 'doctor_message',
      label: 'Pesan dari Dokter',
      description: 'Pesan atau resep dari dokter spesialis',
      icon: MessageSquare
    },
    {
      key: 'prescription_ready',
      label: 'Resep Obat Siap',
      description: 'Dapatkan pemberitahuan instan saat resep obat baru diterbitkan oleh pakar.',
      icon: Activity
    },
    {
      key: 'health_tips',
      label: 'Tips Kesehatan',
      description: 'Tips kesehatan paru mingguan',
      icon: BookOpen
    },
    {
      key: 'aqi_alert',
      label: 'Alert Kualitas Udara',
      description: 'Peringatan saat kualitas udara memburuk di lokasi Anda',
      icon: Wind
    }
  ];

  // Fetch Telegram status dan preferences
  useEffect(() => {
    fetchTelegramStatus();
  }, []);

  const fetchTelegramStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/telegram/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal mengambil status Telegram');

      const data = await response.json();
      setTelegramStatus(data.data);
      setPreferences(data.data?.notification_preference || {});
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/telegram/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences })
      });

      if (!response.ok) throw new Error('Gagal menyimpan preferensi');

      setSuccess('✅ Preferensi notifikasi berhasil diperbarui!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memutuskan Telegram dari akun Anda?')) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/telegram/disconnect', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal memutuskan Telegram');

      setSuccess('Telegram berhasil diputuskan');
      setTimeout(() => fetchTelegramStatus(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <Bell className="w-8 h-8 text-teal-500" />
          Pengaturan Notifikasi
        </h2>
        <p className="text-slate-600 mt-2">Kelola preferensi notifikasi Telegram Anda</p>
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

      {/* Telegram Status Card */}
      <Card className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 border border-blue-200/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-600" />
              Status Telegram
            </h3>
            {telegramStatus?.is_verified ? (
              <div className="mt-3 space-y-2">
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi
                </Badge>
                <p className="text-sm text-slate-600 mt-2">
                  {telegramStatus?.telegram_username && (
                    <>
                      <strong>Username:</strong> {telegramStatus.telegram_username}
                    </>
                  )}
                  {telegramStatus?.telegram_user_id && (
                    <>
                      <br />
                      <strong>User ID:</strong>{' '}
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {telegramStatus.telegram_user_id}
                        <button
                          onClick={() => copyToClipboard(telegramStatus.telegram_user_id)}
                          className="ml-2 text-teal-500 hover:text-teal-600"
                        >
                          {copied ? <Check className="w-4 h-4 inline" /> : <Copy className="w-4 h-4 inline" />}
                        </button>
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Terverifikasi pada {new Date(telegramStatus?.verified_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            ) : (
              <div className="mt-3">
                <Badge className="bg-slate-50 text-slate-600 border border-slate-200/60 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Belum Terhubung
                </Badge>
                <p className="text-sm text-slate-600 mt-2">
                  Telegram Anda belum terhubung. Silakan hubungkan akun Telegram Anda untuk mengaktifkan notifikasi.
                </p>
              </div>
            )}
          </div>

          {telegramStatus?.is_verified && (
            <button
              onClick={handleDisconnect}
              disabled={saving}
              className="p-3 hover:bg-red-100/50 rounded-xl text-red-500 transition"
              title="Putuskan Telegram"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}
        </div>
      </Card>

      {/* Notification Preferences */}
      {telegramStatus?.is_verified && (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Tipe Notifikasi</h3>

            <div className="space-y-4">
              {notificationTypes.map(notif => (
                <div key={notif.key} className="flex items-start gap-4 p-4 border border-slate-200/50 rounded-xl hover:bg-slate-50/50 transition">
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      id={notif.key}
                      checked={preferences[notif.key] ?? true}
                      onChange={() => handlePreferenceChange(notif.key)}
                      className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                    />
                  </div>

                  <label htmlFor={notif.key} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <notif.icon className="w-4 h-4 text-teal-600" />
                      <h4 className="font-semibold text-slate-900">{notif.label}</h4>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{notif.description}</p>
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Preferensi'
              )}
            </button>
          </Card>

          {/* Notification Log */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Riwayat Notifikasi</h3>
            <NotificationLog />
          </Card>
        </>
      )}

      {/* Help Section */}
      <Card className="bg-slate-50 border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-slate-500" />
          Bantuan
        </h3>
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            <strong>Bagaimana cara mencari Telegram User ID saya?</strong><br />
            Chat @userinfobot di Telegram, ketik /start, dan bot akan menampilkan ID unik Anda.
          </p>
          <p>
            <strong>Apakah notifikasi akan dikirim offline?</strong><br />
            Ya! Telegram akan menyimpan pesan dan mengirimnya saat Anda online kembali.
          </p>
          <p>
            <strong>Bagaimana cara menghentikan notifikasi?</strong><br />
            Anda bisa menonaktifkan tipe notifikasi di atas, atau putuskan Telegram sepenuhnya.
          </p>
        </div>
      </Card>
    </div>
  );
};

// Sub-component: Notification Log
const NotificationLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/telegram/notifications-log?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal mengambil log');

      const data = await response.json();
      setLogs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader className="w-5 h-5 animate-spin" />;
  }

  if (logs.length === 0) {
    return <p className="text-slate-500 text-sm">Belum ada riwayat notifikasi</p>;
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {logs.map(log => (
        <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg text-xs">
          <div className={`px-2 py-1 rounded font-semibold text-white flex items-center justify-center ${
            log.status === 'sent' ? 'bg-emerald-500' : 
            log.status === 'failed' ? 'bg-rose-500' : 
            'bg-slate-400'
          }`}>
            {log.status === 'sent' ? <Check className="w-3 h-3" /> : log.status === 'failed' ? <X className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{log.notification_type}</p>
            <p className="text-slate-600 line-clamp-1">{log.message_text}</p>
            <p className="text-slate-400 text-xs mt-1">
              {new Date(log.created_at).toLocaleDateString('id-ID', { 
                year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSettings;
