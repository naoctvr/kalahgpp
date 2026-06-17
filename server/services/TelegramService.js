const axios = require('axios');
const crypto = require('crypto');
const db = require('../config/db');

class TelegramService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 detik
    this.isPollingActive = false;
  }

  get botToken() {
    return process.env.TELEGRAM_BOT_TOKEN;
  }

  get apiUrl() {
    return `https://api.telegram.org/bot${this.botToken}`;
  }

  get webhookSecret() {
    return process.env.TELEGRAM_WEBHOOK_SECRET;
  }

  /**
   * Kirim pesan ke Telegram user
   */
  async sendMessage(telegramUserId, message, options = {}) {
    try {
      const payload = {
        chat_id: telegramUserId,
        text: message,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      };

      const response = await axios.post(
        `${this.apiUrl}/sendMessage`,
        payload,
        { timeout: 10000 }
      );

      return response.data;
    } catch (error) {
      console.error('[TelegramService] sendMessage error:', error.message);
      throw error;
    }
  }

  /**
   * Buat token verifikasi untuk user
   */
  async generateVerificationToken(userId) {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

      await db.query(
        `INSERT INTO telegram_verify_tokens (user_id, verification_token, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, token, expiresAt]
      );

      return token;
    } catch (error) {
      console.error('[TelegramService] generateVerificationToken error:', error);
      throw error;
    }
  }

  /**
   * Kirim pesan verifikasi ke Telegram
   */
  async sendVerificationMessage(telegramUserId, userId) {
    try {
      const token = await this.generateVerificationToken(userId);

      const message = `🫁 *Selamat datang di kalahgpp!*

Kami telah mendeteksi Anda ingin mengaktifkan notifikasi untuk akun Pro/Enterprise.

Untuk memverifikasi dan mengaktifkan notifikasi Telegram, ketik perintah berikut:

\`/verify ${token}\`

Atau klik tombol di bawah:

Tautan verifikasi berlaku selama 15 menit.`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: '✅ Verifikasi Sekarang',
              callback_data: `verify_${token}`
            }
          ]
        ]
      };

      await this.sendMessage(telegramUserId, message, {
        reply_markup: inlineKeyboard
      });

      console.log(`[TelegramService] Verification message sent to ${telegramUserId}`);
      return token;
    } catch (error) {
      console.error('[TelegramService] sendVerificationMessage error:', error);
      throw error;
    }
  }

  /**
   * Verifikasi token dan aktifkan Telegram untuk user
   */
  async verifyToken(token, telegramUserId) {
    try {
      // Cari token di database (compatible with [rows] format)
      const [tokenRows] = await db.query(
        `SELECT * FROM telegram_verify_tokens 
         WHERE verification_token = $1 AND used_at IS NULL`,
        [token]
      );

      if (tokenRows.length === 0) {
        throw new Error('Token tidak valid atau sudah digunakan');
      }

      const tokenRecord = tokenRows[0];

      // Cek apakah token sudah expired
      if (new Date(tokenRecord.expires_at) < new Date()) {
        throw new Error('Token sudah kadaluarsa');
      }

      const userId = tokenRecord.user_id;

      // Update atau insert ke user_telegram
      const [existingUserRows] = await db.query(
        `SELECT * FROM user_telegram WHERE user_id = $1`,
        [userId]
      );

      if (existingUserRows.length > 0) {
        // Update existing
        await db.query(
          `UPDATE user_telegram 
           SET telegram_user_id = $1, is_verified = true, verified_at = NOW()
           WHERE user_id = $2`,
          [telegramUserId, userId]
        );
      } else {
        // Insert new
        const defaultPrefs = {
          consultation_reminder: true,
          screening_result: true,
          doctor_message: true,
          prescription_ready: true,
          health_tips: true,
          aqi_alert: true
        };
        await db.query(
          `INSERT INTO user_telegram (user_id, telegram_user_id, is_verified, notification_preference, verified_at)
           VALUES ($1, $2, true, $3, NOW())`,
          [userId, telegramUserId, JSON.stringify(defaultPrefs)]
        );
      }

      // Mark token sebagai used
      await db.query(
        `UPDATE telegram_verify_tokens SET used_at = NOW() WHERE id = $1`,
        [tokenRecord.id]
      );

      // Kirim pesan sukses ke Telegram
      const successMessage = `✅ *Verifikasi Berhasil!*

Notifikasi Telegram untuk kalahgpp telah aktif. Anda akan menerima:
• Pengingat konsultasi
• Hasil skrining & rekomendasi
• Pesan dari dokter
• Peringatan kualitas udara

Kelola preferensi notifikasi di aplikasi kalahgpp.`;

      await this.sendMessage(telegramUserId, successMessage);

      return { success: true, userId, telegramUserId };
    } catch (error) {
      console.error('[TelegramService] verifyToken error:', error);
      throw error;
    }
  }

  /**
   * Kirim notifikasi ke user berdasarkan tipe
   */
  async sendNotification(userId, notificationType, data) {
    try {
      // Cek apakah user sudah verified dan notifikasi tipe ini enabled
      const [userTelegramRows] = await db.query(
        `SELECT * FROM user_telegram 
         WHERE user_id = $1 AND is_verified = true`,
        [userId]
      );

      if (userTelegramRows.length === 0) {
        console.log(`[TelegramService] User ${userId} tidak memiliki Telegram verified`);
        return;
      }

      const userTelegram = userTelegramRows[0];
      const prefs = userTelegram.notification_preference || {};

      // Cek apakah tipe notifikasi ini diaktifkan user
      if (!prefs[notificationType]) {
        console.log(`[TelegramService] Notifikasi ${notificationType} disabled untuk user ${userId}`);
        return;
      }

      // Build pesan berdasarkan tipe
      const message = this.buildNotificationMessage(notificationType, data);

      // Log ke database sebelum pengiriman
      const [logRows] = await db.query(
        `INSERT INTO telegram_notifications_log 
         (user_id, notification_type, message_text, status, scheduled_at)
         VALUES ($1, $2, $3, 'pending', NOW())
         RETURNING id`,
        [userId, notificationType, message]
      );

      const logId = logRows[0].id;

      try {
        // Kirim pesan dengan retry logic
        const response = await this.sendMessageWithRetry(
          userTelegram.telegram_user_id,
          message,
          this.maxRetries
        );

        // Update log sebagai sent
        await db.query(
          `UPDATE telegram_notifications_log 
           SET status = 'sent', telegram_message_id = $1, sent_at = NOW()
           WHERE id = $2`,
          [response.result.message_id, logId]
        );

        console.log(`[TelegramService] Notification sent (logId: ${logId})`);
      } catch (error) {
        // Update log sebagai failed
        await db.query(
          `UPDATE telegram_notifications_log 
           SET status = 'failed', error_message = $1, retry_count = $2
           WHERE id = $3`,
          [error.message, this.maxRetries, logId]
        );

        throw error;
      }
    } catch (error) {
      console.error('[TelegramService] sendNotification error:', error);
      throw error;
    }
  }

  /**
   * Kirim pesan dengan retry logic
   */
  async sendMessageWithRetry(telegramUserId, message, retriesLeft = this.maxRetries) {
    try {
      return await this.sendMessage(telegramUserId, message);
    } catch (error) {
      if (retriesLeft > 0) {
        console.log(`[TelegramService] Retry ${this.maxRetries - retriesLeft + 1}/${this.maxRetries} untuk user ${telegramUserId}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.sendMessageWithRetry(telegramUserId, message, retriesLeft - 1);
      }
      throw error;
    }
  }

  /**
   * Build pesan notifikasi berdasarkan tipe
   */
  buildNotificationMessage(type, data) {
    switch (type) {
      case 'screening_result':
        return `🫁 *Hasil Skrining Tersedia*

Hasil skrining kesehatan paru Anda telah diproses.

*Diagnosis:* ${data.diagnosis || 'Menunggu analisis'}
*Rekomendasi:* ${data.recommendation || 'Konsultasikan dengan dokter'}
*Severity:* ${data.severity || 'Ringan'}

[Buka hasil lengkap di aplikasi]`;

      case 'consultation_reminder':
        return `⏰ *Pengingat Konsultasi*

Anda memiliki jadwal konsultasi:

*Dokter:* ${data.doctorName || 'Dr. Spesialis'}
*Waktu:* ${data.time || 'Segera'}
*Jenis:* ${data.type || 'Konsultasi Umum'}

Pastikan Anda online 10 menit sebelum jadwal.`;

      case 'doctor_message':
        return `💬 *Pesan dari Dokter*

${data.doctorName || 'Dokter'} mengirimkan pesan:

"${data.message || 'Pesan diterima'}"

[Balas di aplikasi]`;

      case 'prescription_ready':
        return `💊 *Resep Tersedia*

Resep Anda telah disiapkan oleh Dr. ${data.doctorName || 'Spesialis'}.

Silakan ambil di apotek atau gunakan sistem e-resep.

[Lihat detail resep]`;

      case 'aqi_alert':
        return `🌫️ *Peringatan Kualitas Udara*

Kualitas udara di lokasi Anda memburuk.

*AQI:* ${data.aqi || '–'}
*Status:* ${data.status || 'Tidak Sehat'}

Hindari aktivitas di luar ruangan dan gunakan masker N95 jika perlu keluar.

*Tips:* Tetap hydrated & gunakan AC/air purifier.`;

      case 'health_tips':
        return `📖 *Tips Kesehatan Minggu Ini*

${data.title || 'Jaga Kesehatan Paru-Paru Anda'}

${data.content || 'Tips kesehatan umum untuk gaya hidup sehat.'}

[Baca artikel lengkap]`;

      default:
        return `📬 *Notifikasi dari kalahgpp*\n\n${data.message || 'Anda memiliki notifikasi baru.'}`;
    }
  }

  /**
   * Update preferensi notifikasi user
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      await db.query(
        `UPDATE user_telegram 
         SET notification_preference = $1, updated_at = NOW()
         WHERE user_id = $2`,
        [JSON.stringify(preferences), userId]
      );

      console.log(`[TelegramService] Preferences updated for user ${userId}`);
    } catch (error) {
      console.error('[TelegramService] updateNotificationPreferences error:', error);
      throw error;
    }
  }

  /**
   * Dapatkan status Telegram user
   */
  async getUserTelegramStatus(userId) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM user_telegram WHERE user_id = $1`,
        [userId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('[TelegramService] getUserTelegramStatus error:', error);
      throw error;
    }
  }

  /**
   * Disconnect Telegram dari user
   */
  async disconnectTelegram(userId) {
    try {
      await db.query(
        `UPDATE user_telegram 
         SET is_verified = false, telegram_user_id = NULL, updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      console.log(`[TelegramService] Telegram disconnected for user ${userId}`);
    } catch (error) {
      console.error('[TelegramService] disconnectTelegram error:', error);
      throw error;
    }
  }

  /**
   * Proses Telegram update (baik dari Webhook maupun Long Polling)
   */
  async processUpdate(update) {
    try {
      if (update.callback_query) {
        const callbackQuery = update.callback_query;
        const data = callbackQuery.data;
        const telegramUserId = callbackQuery.from.id;

        if (data.startsWith('verify_')) {
          const token = data.replace('verify_', '');
          try {
            await this.verifyToken(token, telegramUserId);
            await this.sendMessage(telegramUserId, '✅ Verifikasi berhasil!');
          } catch (error) {
            await this.sendMessage(
              telegramUserId,
              `❌ Verifikasi gagal: ${error.message}`
            );
          }
        }
      }

      if (update.message && update.message.text) {
        const message = update.message.text;
        const telegramUserId = update.message.from.id;

        if (message.startsWith('/start ')) {
          const token = message.substring(7).trim();
          try {
            await this.verifyToken(token, telegramUserId);
          } catch (error) {
            await this.sendMessage(
              telegramUserId,
              `❌ Verifikasi gagal: ${error.message}`
            );
          }
        } else if (message.startsWith('/verify')) {
          const token = message.replace('/verify', '').trim();
          if (!token) {
            await this.sendMessage(
              telegramUserId,
              '❌ Format: /verify TOKEN\n\nSilakan masukkan token yang diberikan saat upgrade.'
            );
            return;
          }

          try {
            await this.verifyToken(token, telegramUserId);
          } catch (error) {
            await this.sendMessage(
              telegramUserId,
              `❌ Verifikasi gagal: ${error.message}`
            );
          }
        } else if (message === '/start') {
          await this.sendMessage(
            telegramUserId,
            `👋 *Halo!*\n\nSaya adalah bot notifikasi kalahgpp. Ketika Anda upgrade ke Pro/Enterprise, kami akan mengirimkan notifikasi di sini.\n\nBersiaplah! 🫁`
          );
        }
      }
    } catch (error) {
      console.error('[TelegramService] processUpdate error:', error);
    }
  }

  /**
   * Jalankan Long Polling untuk development lokal tanpa webhook
   */
  startPolling() {
    if (this.isPollingActive) return;
    this.isPollingActive = true;
    let lastUpdateId = 0;

    console.log('[TelegramService] Long Polling started...');

    const poll = async () => {
      try {
        const response = await axios.get(
          `${this.apiUrl}/getUpdates`,
          {
            params: {
              offset: lastUpdateId + 1,
              timeout: 10
            },
            timeout: 15000
          }
        );

        const updates = response.data.result || [];
        for (const update of updates) {
          lastUpdateId = update.update_id;
          await this.processUpdate(update);
        }
      } catch (error) {
        if (error.code !== 'ECONNABORTED' && !error.message.includes('timeout')) {
          console.error('[TelegramService] Polling error:', error.message);
        }
      }

      if (this.isPollingActive) {
        setTimeout(poll, 1000);
      }
    };

    poll();
  }

  /**
   * Verifikasi webhook signature dari Telegram
   */
  verifyWebhookSignature(body, signature) {
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');

    return hash === signature;
  }
}

module.exports = new TelegramService();
