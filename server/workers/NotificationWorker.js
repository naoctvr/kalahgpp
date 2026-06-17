const { Worker, Queue } = require('bullmq');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');
const TelegramService = require('../services/TelegramService');
const db = require('../config/db');

// Redis connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
});

// Nodemailer Transporter Configuration (Email Fallback)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io', // fallback ke mailtrap/sandbox
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || ''
  }
});

// Queue definitions
const notificationQueue = new Queue('notifications', { connection: redisConnection });
const scheduledNotificationQueue = new Queue('scheduled-notifications', { connection: redisConnection });

/**
 * Fungsi pembantu untuk mengirim email fallback
 */
async function sendEmailFallback(userId, type, data) {
  try {
    // Ambil alamat email user dari database
    const [userRows] = await db.query(
      `SELECT email, name FROM users WHERE id = $1`,
      [userId]
    );

    if (userRows.length === 0 || !userRows[0].email) {
      console.log(`[EmailFallback] User ${userId} tidak memiliki alamat email valid.`);
      return false;
    }

    const { email, name } = userRows[0];
    const emailSubject = `[RESPIRA.ID] Notifikasi: ${type.replace('_', ' ').toUpperCase()}`;
    const emailBody = TelegramService.buildNotificationMessage(type, data)
      .replace(/\*/g, '') // Hapus markdown formatting bold
      .replace(/_/g, '');  // Hapus markdown formatting italic

    const mailOptions = {
      from: `"RESPIRA.ID" <${process.env.SMTP_FROM || 'no-reply@respira.id'}>`,
      to: email,
      subject: emailSubject,
      text: `Halo ${name},\n\nAnda menerima notifikasi penting berikut dari RESPIRA.ID:\n\n${emailBody}\n\nSalam,\nTim RESPIRA.ID`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailFallback] Email terkirim ke ${email} (MessageID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('[EmailFallback] Gagal mengirim email fallback:', error.message);
    return false;
  }
}

// Notification Worker
const notificationWorker = new Worker('notifications', async (job) => {
  const { userId, notificationType, data } = job.data;
  try {
    console.log(`[NotificationWorker] Processing job ${job.id}: ${notificationType} for user ${userId}`);

    // Send notification via TelegramService
    await TelegramService.sendNotification(userId, notificationType, data);

    console.log(`[NotificationWorker] Job ${job.id} completed successfully`);
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error(`[NotificationWorker] Job ${job.id} failed:`, error);
    
    // Retry up to 3 times with exponential backoff
    if (job.attemptsMade < 3) {
      throw error; // Will be retried automatically
    } else {
      // Log final failure & trigger Email Fallback
      console.error(`[NotificationWorker] Job ${job.id} failed after 3 attempts. Triggering email fallback...`);
      const emailSent = await sendEmailFallback(userId, notificationType, data);
      
      // Update status log di database ke 'failed' tetapi tandai email sent jika berhasil
      await db.query(
        `UPDATE telegram_notifications_log 
         SET status = 'failed', error_message = $1, retry_count = $2
         WHERE user_id = $3 AND notification_type = $4 AND status = 'pending'`,
        [`Failed Telegram. Email fallback: ${emailSent ? 'Sent' : 'Failed'}`, job.attemptsMade, userId, notificationType]
      );

      return { success: false, error: error.message, emailFallback: emailSent };
    }
  }
}, {
  connection: redisConnection,
  concurrency: 10,
  settings: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Scheduled Notification Worker (for cron-like tasks)
const scheduledWorker = new Worker('scheduled-notifications', async (job) => {
  try {
    const { userId, notificationType, data } = job.data;
    console.log(`[ScheduledWorker] Processing scheduled job ${job.id}: ${notificationType}`);

    await TelegramService.sendNotification(userId, notificationType, data);

    console.log(`[ScheduledWorker] Scheduled job ${job.id} completed`);
    return { success: true };
  } catch (error) {
    console.error(`[ScheduledWorker] Job ${job.id} error:`, error);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 5,
  settings: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 3000
    }
  }
});

// Event listeners
notificationWorker.on('completed', (job) => {
  console.log(`✅ [Notification] Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ [Notification] Job ${job.id} failed:`, err.message);
});

scheduledWorker.on('completed', (job) => {
  console.log(`✅ [Scheduled] Job ${job.id} completed`);
});

scheduledWorker.on('failed', (job, err) => {
  console.error(`❌ [Scheduled] Job ${job.id} failed:`, err.message);
});

// ============ HELPER FUNCTIONS ============

/**
 * Queue a notification immediately
 */
async function queueNotification(userId, notificationType, data) {
  try {
    const job = await notificationQueue.add(
      'send-notification',
      { userId, notificationType, data },
      {
        jobId: `notif-${userId}-${notificationType}-${Date.now()}`,
        priority: 10
      }
    );

    console.log(`[Queue] Notification queued: ${job.id}`);
    return job;
  } catch (error) {
    console.error('[Queue] Error queueing notification:', error);
    throw error;
  }
}

/**
 * Schedule a notification for later
 */
async function scheduleNotification(userId, notificationType, data, delayMs) {
  try {
    const job = await scheduledNotificationQueue.add(
      'send-scheduled',
      { userId, notificationType, data },
      {
        delay: delayMs,
        jobId: `scheduled-${userId}-${notificationType}-${Date.now()}`
      }
    );

    console.log(`[Schedule] Notification scheduled: ${job.id} (delay: ${delayMs}ms)`);
    return job;
  } catch (error) {
    console.error('[Schedule] Error scheduling notification:', error);
    throw error;
  }
}

/**
 * Schedule consultation reminder notifications
 */
async function scheduleConsultationReminders() {
  try {
    console.log('[CronJob] Checking for upcoming consultations...');

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const afterTomorrow = new Date(Date.now() + 25 * 60 * 60 * 1000);

    // SQL query compatible with [rows] database format
    const [consultations] = await db.query(
      `SELECT c.id, c.user_id, c.doctor_id, d.name as doctor_name, 
              c.requested_date, u.name as user_name
       FROM consultations c
       JOIN users d ON c.doctor_id = d.id
       JOIN users u ON c.user_id = u.id
       WHERE c.requested_date >= $1 AND c.requested_date <= $2
       AND c.status = 'approved'`,
      [tomorrow, afterTomorrow]
    );

    console.log(`[CronJob] Found ${consultations.length} upcoming consultations`);

    for (const consultation of consultations) {
      const scheduledTime = new Date(consultation.requested_date);
      
      // 1 day before
      const oneDayBefore = new Date(scheduledTime.getTime() - 24 * 60 * 60 * 1000);
      if (oneDayBefore > new Date()) {
        await scheduleNotification(
          consultation.user_id,
          'consultation_reminder',
          {
            doctorName: consultation.doctor_name,
            time: scheduledTime.toLocaleString('id-ID'),
            type: 'Konsultasi Medis'
          },
          oneDayBefore.getTime() - Date.now()
        );
      }

      // 1 hour before
      const oneHourBefore = new Date(scheduledTime.getTime() - 60 * 60 * 1000);
      if (oneHourBefore > new Date()) {
        await scheduleNotification(
          consultation.user_id,
          'consultation_reminder',
          {
            doctorName: consultation.doctor_name,
            time: scheduledTime.toLocaleString('id-ID'),
            type: 'Segera dimulai!'
          },
          oneHourBefore.getTime() - Date.now()
        );
      }
    }
  } catch (error) {
    console.error('[CronJob] Error scheduling consultations:', error);
  }
}

/**
 * Check AQI and send alerts for unhealthy air quality
 */
async function checkAQIAndAlert() {
  try {
    console.log('[CronJob] Checking AQI levels...');

    const [users] = await db.query(
      `SELECT u.id, u.emergency_contact, ut.telegram_user_id
       FROM user_telegram ut
       JOIN users u ON ut.user_id = u.id
       WHERE ut.is_verified = true
       AND ut.notification_preference->>'aqi_alert' = 'true'`
    );

    console.log(`[CronJob] Checking AQI for ${users.length} users`);

    for (const user of users) {
      try {
        const aqi = await fetchAQI();

        if (aqi.value > 150) {
          await queueNotification(
            user.id,
            'aqi_alert',
            {
              aqi: aqi.value,
              status: aqi.status,
              location: aqi.location
            }
          );

          console.log(`[CronJob] AQI alert queued for user ${user.id} (AQI: ${aqi.value})`);
        }
      } catch (error) {
        console.error(`[CronJob] Error checking AQI for user ${user.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[CronJob] Error in AQI check:', error);
  }
}

async function fetchAQI() {
  return {
    value: 155, // Unhealthy
    status: 'Tidak Sehat',
    location: 'Banyumas'
  };
}

/**
 * Send daily health tips
 */
async function sendDailyHealthTips() {
  try {
    console.log('[CronJob] Sending daily health tips...');

    const healthTips = [
      {
        title: 'Jaga Kelembaban Udara',
        content: 'Gunakan humidifier atau letakkan mangkuk air di kamar untuk menjaga kelembaban udara optimal (40-60%).'
      },
      {
        title: 'Olahraga Teratur',
        content: 'Lakukan olahraga ringan seperti jalan kaki 30 menit setiap hari untuk meningkatkan kapasitas paru.'
      },
      {
        title: 'Hindari Asap',
        content: 'Hindari paparan asap rokok dan polusi udara dengan menggunakan masker N95 saat diperlukan.'
      }
    ];

    const tip = healthTips[Math.floor(Math.random() * healthTips.length)];

    const [users] = await db.query(
      `SELECT u.id
       FROM user_telegram ut
       JOIN users u ON ut.user_id = u.id
       WHERE ut.is_verified = true
       AND ut.notification_preference->>'health_tips' = 'true'`
    );

    for (const user of users) {
      await queueNotification(
        user.id,
        'health_tips',
        tip
      );
    }

    console.log(`[CronJob] Health tips sent to ${users.length} users`);
  } catch (error) {
    console.error('[CronJob] Error sending health tips:', error);
  }
}

// ============ EXPORT ============
module.exports = {
  notificationWorker,
  scheduledWorker,
  notificationQueue,
  scheduledNotificationQueue,
  queueNotification,
  scheduleNotification,
  scheduleConsultationReminders,
  checkAQIAndAlert,
  sendDailyHealthTips
};
