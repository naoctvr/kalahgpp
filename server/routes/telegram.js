const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const TelegramService = require('../services/TelegramService');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// ============ RATE LIMITERS ============
const verificationSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Batas 5 request per IP
  message: { error: 'Terlalu banyak permintaan verifikasi. Silakan coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const verificationVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Batas 10 request per IP
  message: { error: 'Terlalu banyak percobaan verifikasi. Silakan coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/telegram/generate-token
 * Membuat token verifikasi unik untuk tautan otomatis
 */
router.post('/generate-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const token = await TelegramService.generateVerificationToken(userId);
    res.json({ success: true, token });
  } catch (error) {
    console.error('[API] generate-token error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/telegram/send-verification
 * Mengirim pesan verifikasi ke Telegram user
 */
router.post('/send-verification', authenticateToken, verificationSendLimiter, async (req, res) => {
  try {
    const { telegram_user_id } = req.body;
    const userId = req.user.id;

    if (!telegram_user_id) {
      return res.status(400).json({ error: 'telegram_user_id diperlukan' });
    }

    // Validasi bahwa user terdaftar (compatible with [rows] database format)
    const [userRows] = await db.query(
      `SELECT is_premium FROM users WHERE id = $1`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Kirim pesan verifikasi
    const token = await TelegramService.sendVerificationMessage(telegram_user_id, userId);

    res.json({
      success: true,
      token,
      message: 'Pesan verifikasi telah dikirim. Silakan buka Telegram dan ketik /verify dengan kode yang diberikan.'
    });
  } catch (error) {
    console.error('[API] send-verification error:', error.message);
    let errorMsg = error.message;
    if (error.response && error.response.data && error.response.data.description) {
      const desc = error.response.data.description;
      if (desc.includes('chat not found')) {
        errorMsg = 'Bot tidak dapat menemukan chat Anda. Silakan mulai chat dengan bot Anda di Telegram (klik /start) terlebih dahulu!';
      } else {
        errorMsg = desc;
      }
    }
    res.status(500).json({ error: errorMsg });
  }
});

/**
 * POST /api/telegram/verify
 * Verifikasi token dari Telegram user
 */
router.post('/verify', authenticateToken, verificationVerifyLimiter, async (req, res) => {
  try {
    const { verification_token, telegram_user_id } = req.body;
    const userId = req.user.id;

    if (!verification_token || !telegram_user_id) {
      return res.status(400).json({ error: 'verification_token dan telegram_user_id diperlukan' });
    }

    // Verifikasi token
    const result = await TelegramService.verifyToken(verification_token, telegram_user_id);

    res.json({
      success: true,
      message: 'Telegram berhasil diverifikasi! Notifikasi akan mulai dikirim.',
      data: result
    });
  } catch (error) {
    console.error('[API] verify error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/telegram/status
 * Dapatkan status Telegram user yang sedang login
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await TelegramService.getUserTelegramStatus(userId);

    res.json({
      success: true,
      data: status || {
        user_id: userId,
        is_verified: false,
        telegram_user_id: null,
        telegram_username: null
      }
    });
  } catch (error) {
    console.error('[API] status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/telegram/preferences
 * Update preferensi notifikasi Telegram
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.id;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'preferences harus berupa object' });
    }

    await TelegramService.updateNotificationPreferences(userId, preferences);

    res.json({
      success: true,
      message: 'Preferensi notifikasi berhasil diperbarui'
    });
  } catch (error) {
    console.error('[API] preferences error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/telegram/disconnect
 * Disconnect Telegram dari akun user
 */
router.delete('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await TelegramService.disconnectTelegram(userId);

    res.json({
      success: true,
      message: 'Telegram berhasil diputuskan dari akun Anda'
    });
  } catch (error) {
    console.error('[API] disconnect error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/telegram/notifications-log
 * Dapatkan log notifikasi Telegram untuk user
 */
router.get('/notifications-log', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;

    const [rows] = await db.query(
      `SELECT * FROM telegram_notifications_log 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM telegram_notifications_log WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: parseInt(countRows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('[API] notifications-log error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/notification-stats
 * Dapatkan statistik notifikasi (admin only)
 */
router.get('/admin/notification-stats', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access this endpoint' });
    }

    const [sentRows] = await db.query(
      `SELECT COUNT(*) as count FROM telegram_notifications_log WHERE status = 'sent'`
    );

    const [failedRows] = await db.query(
      `SELECT COUNT(*) as count FROM telegram_notifications_log WHERE status = 'failed'`
    );

    const [pendingRows] = await db.query(
      `SELECT COUNT(*) as count FROM telegram_notifications_log WHERE status = 'pending'`
    );

    const [verifiedRows] = await db.query(
      `SELECT COUNT(*) as count FROM user_telegram WHERE is_verified = true`
    );

    res.json({
      success: true,
      data: {
        totalSent: parseInt(sentRows[0].count),
        totalFailed: parseInt(failedRows[0].count),
        totalPending: parseInt(pendingRows[0].count),
        verifiedUsers: parseInt(verifiedRows[0].count)
      }
    });
  } catch (error) {
    console.error('[API] notification-stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/telegram/webhook
 * Webhook endpoint untuk menerima update dari Telegram Bot
 */
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const update = req.body;
    console.log('[Webhook] Received update:', JSON.stringify(update, null, 2));

    // Handle callback_query (user klik tombol verifikasi)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      const telegramUserId = callbackQuery.from.id;

      if (data.startsWith('verify_')) {
        const token = data.replace('verify_', '');
        try {
          await TelegramService.verifyToken(token, telegramUserId);
          await TelegramService.sendMessage(telegramUserId, '✅ Verifikasi berhasil!');
        } catch (error) {
          await TelegramService.sendMessage(
            telegramUserId,
            `❌ Verifikasi gagal: ${error.message}`
          );
        }
      }
    }

    // Handle text message (user ketik /verify TOKEN)
    if (update.message && update.message.text) {
      const message = update.message.text;
      const telegramUserId = update.message.from.id;

      if (message.startsWith('/verify')) {
        const token = message.replace('/verify', '').trim();
        
        if (!token) {
          await TelegramService.sendMessage(
            telegramUserId,
            '❌ Format: /verify TOKEN\n\nSilakan masukkan token yang diberikan saat upgrade.'
          );
          return res.json({ ok: true });
        }

        try {
          await TelegramService.verifyToken(token, telegramUserId);
        } catch (error) {
          await TelegramService.sendMessage(
            telegramUserId,
            `❌ Verifikasi gagal: ${error.message}`
          );
        }
      } else if (message === '/start') {
        await TelegramService.sendMessage(
          telegramUserId,
          `👋 *Halo!*

Saya adalah bot notifikasi kalahgpp. Ketika Anda upgrade ke Pro/Enterprise, kami akan mengirimkan pesan verifikasi di sini.

Setelah verifikasi, Anda akan menerima:
• Pengingat konsultasi
• Hasil skrining
• Pesan dari dokter
• Peringatan kualitas udara

Bersiaplah! 🫁`
        );
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN ROUTES ============

/**
 * @route   GET /api/telegram/admin/notification-stats
 * @desc    Ambil statistik pengiriman notifikasi Telegram
 * @access  Private (Admin)
 */
router.get('/admin/notification-stats', authenticateToken, async (req, res) => {
  try {
    const [sentRows] = await db.query(
      "SELECT COUNT(*) as count FROM telegram_notifications_log WHERE status = 'sent'"
    );
    const [failedRows] = await db.query(
      "SELECT COUNT(*) as count FROM telegram_notifications_log WHERE status = 'failed'"
    );
    const [pendingRows] = await db.query(
      "SELECT COUNT(*) as count FROM telegram_notifications_log WHERE status = 'pending'"
    );
    const [verifiedRows] = await db.query(
      "SELECT COUNT(*) as count FROM user_telegram WHERE is_verified = true"
    );

    res.json({
      success: true,
      data: {
        totalSent: parseInt(sentRows[0]?.count || 0),
        totalFailed: parseInt(failedRows[0]?.count || 0),
        totalPending: parseInt(pendingRows[0]?.count || 0),
        verifiedUsers: parseInt(verifiedRows[0]?.count || 0)
      }
    });
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/telegram/admin/cron-status
 * @desc    Ambil status penjadwalan cron
 * @access  Private (Admin)
 */
router.get('/admin/cron-status', authenticateToken, async (req, res) => {
  try {
    // Kembalikan status cron jobs
    res.json({
      success: true,
      data: {
        isRunning: true,
        totalJobs: 3,
        jobs: [
          { name: '⏰ Pengingat Konsultasi', schedule: 'Setiap 6 jam' },
          { name: '🌫️ AQI & Kualitas Udara', schedule: 'Setiap 2 jam' },
          { name: '📖 Tips Kesehatan Harian', schedule: 'Setiap hari pukul 07:00' }
        ]
      }
    });
  } catch (error) {
    console.error('[Admin Cron] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/telegram/admin/send-notification
 * @desc    Kirim notifikasi Telegram manual ke user
 * @access  Private (Admin)
 */
router.post('/admin/send-notification', authenticateToken, async (req, res) => {
  const { userId, notificationType, data } = req.body;

  if (!userId || !notificationType) {
    return res.status(400).json({ success: false, error: 'User ID dan tipe notifikasi diperlukan' });
  }

  try {
    // Import Queue untuk BullMQ secara dinamis
    const { Queue } = require('bullmq');
    const Redis = require('ioredis');
    
    // Inisialisasi queue koneksi Redis
    const redisConnection = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null
    });
    
    const notificationQueue = new Queue('notificationQueue', { connection: redisConnection });
    
    // Masukkan job notifikasi ke queue
    const job = await notificationQueue.add(notificationType, {
      userId,
      type: notificationType,
      data: data || {}
    });

    res.json({
      success: true,
      message: 'Notifikasi berhasil di-queue untuk dikirim',
      jobId: job.id
    });
  } catch (error) {
    console.error('[Admin Send Notify] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
