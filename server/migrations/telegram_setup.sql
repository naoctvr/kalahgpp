-- Tabel user_telegram: menyimpan mapping user dengan Telegram
CREATE TABLE IF NOT EXISTS user_telegram (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    telegram_user_id BIGINT UNIQUE,
    telegram_username VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    notification_preference JSONB DEFAULT '{
        "consultation_reminder": true,
        "screening_result": true,
        "doctor_message": true,
        "prescription_ready": true,
        "health_tips": true,
        "aqi_alert": true
    }',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel telegram_verify_tokens: token untuk verifikasi one-time
CREATE TABLE IF NOT EXISTS telegram_verify_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_token VARCHAR(255) NOT NULL UNIQUE,
    telegram_user_id BIGINT,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel telegram_notifications_log: log semua notifikasi yang dikirim
CREATE TABLE IF NOT EXISTS telegram_notifications_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    message_text TEXT,
    telegram_message_id BIGINT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, read
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_user_telegram_user_id ON user_telegram(user_id);
CREATE INDEX IF NOT EXISTS idx_user_telegram_verified ON user_telegram(is_verified);
CREATE INDEX IF NOT EXISTS idx_telegram_verify_user_id ON telegram_verify_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_user_id ON telegram_notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_status ON telegram_notifications_log(status);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_scheduled ON telegram_notifications_log(scheduled_at);

-- Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION update_user_telegram_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_telegram_timestamp ON user_telegram;
CREATE TRIGGER trigger_update_user_telegram_timestamp
BEFORE UPDATE ON user_telegram
FOR EACH ROW
EXECUTE FUNCTION update_user_telegram_timestamp();
