const cron = require('node-cron');
const {
  scheduleConsultationReminders,
  checkAQIAndAlert,
  sendDailyHealthTips
} = require('./NotificationWorker');

class CronJobScheduler {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  /**
   * Start all cron jobs
   */
  start() {
    if (this.isRunning) {
      console.log('[CronJobScheduler] Jobs already running');
      return;
    }

    console.log('[CronJobScheduler] Starting cron jobs...');

    // Check for consultation reminders every 6 hours
    const consultationJob = cron.schedule('0 */6 * * *', async () => {
      console.log('[CronJob] Running consultation reminder check...');
      try {
        await scheduleConsultationReminders();
      } catch (error) {
        console.error('[CronJob] Consultation reminder error:', error);
      }
    });

    // Check AQI every 2 hours
    const aqiJob = cron.schedule('0 */2 * * *', async () => {
      console.log('[CronJob] Running AQI check...');
      try {
        await checkAQIAndAlert();
      } catch (error) {
        console.error('[CronJob] AQI check error:', error);
      }
    });

    // Send daily health tips at 7 AM
    const healthTipsJob = cron.schedule('0 7 * * *', async () => {
      console.log('[CronJob] Running daily health tips...');
      try {
        await sendDailyHealthTips();
      } catch (error) {
        console.error('[CronJob] Health tips error:', error);
      }
    });

    this.jobs = [consultationJob, aqiJob, healthTipsJob];
    this.isRunning = true;

    console.log('✅ [CronJobScheduler] All cron jobs started:');
    console.log('   📅 Consultation reminder check: Every 6 hours');
    console.log('   🌫️  AQI check: Every 2 hours');
    console.log('   📖 Daily health tips: 7:00 AM daily');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    console.log('[CronJobScheduler] Stopping all cron jobs...');
    this.jobs.forEach(job => job.stop());
    this.isRunning = false;
    console.log('✅ [CronJobScheduler] All cron jobs stopped');
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalJobs: this.jobs.length,
      jobs: [
        { name: 'Consultation Reminders', schedule: 'Every 6 hours' },
        { name: 'AQI Check', schedule: 'Every 2 hours' },
        { name: 'Daily Health Tips', schedule: '7:00 AM daily' }
      ]
    };
  }
}

// Export singleton instance
module.exports = new CronJobScheduler();
