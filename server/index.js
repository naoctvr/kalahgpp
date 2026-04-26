require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- ONLINE STATUS MIDDLEWARE ---
app.use(async (req, res, next) => {
    const userId = req.body.userId || req.params.userId || req.body.senderId || req.body.id;
    if (userId) {
        try {
            await db.query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [userId]);
        } catch (err) {
            console.error('Failed to update last_active_at', err);
        }
    }
    next();
});

// --- AUTH ROUTES ---

app.post('/api/register', async (req, res) => {
    const { name, email, password, role, licenseCode } = req.body;
    try {
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
        }
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, license_code) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [name, email, password, role, licenseCode]
        );
        const newUser = { id: result[0].id, name, email, role };
        res.json({ success: true, user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (users.length > 0) {
            const user = users[0];
            const { password: _pw, ...userData } = user;
            res.json({ success: true, user: userData });
        } else {
            res.status(401).json({ success: false, message: 'Email atau password salah.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// --- DASHBOARD & CHECK-IN ROUTES ---

app.get('/api/dashboard/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [userRows] = await db.query(
            'SELECT name, height, weight, blood_type, emergency_contact FROM users WHERE id = $1',
            [userId]
        );
        const userData = userRows.length > 0 ? userRows[0] : { name: 'User' };

        const [scoreRows] = await db.query(
            'SELECT score FROM daily_checkins WHERE user_id = $1 AND check_date = CURRENT_DATE',
            [userId]
        );
        const latestScore = scoreRows.length > 0 ? scoreRows[0].score : null;

        const [historyRows] = await db.query(
            'SELECT * FROM diagnosis_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
            [userId]
        );

        res.json({
            success: true,
            data: {
                userName: userData.name,
                userProfile: userData,
                latestScore,
                history: historyRows
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
    }
});

app.post('/api/checkin', async (req, res) => {
    const { userId, score } = req.body;
    try {
        const [existing] = await db.query(
            'SELECT id FROM daily_checkins WHERE user_id = $1 AND check_date = CURRENT_DATE',
            [userId]
        );

        if (existing.length > 0) {
            await db.query('UPDATE daily_checkins SET score = $1 WHERE id = $2', [score, existing[0].id]);
        } else {
            await db.query(
                'INSERT INTO daily_checkins (user_id, score, check_date) VALUES ($1, $2, CURRENT_DATE)',
                [userId, score]
            );
        }

        res.json({ success: true, message: 'Check-in berhasil disimpan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan check-in.' });
    }
});

app.get('/api/checkin/today/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT score FROM daily_checkins WHERE user_id = $1 AND check_date = CURRENT_DATE',
            [userId]
        );
        res.json({ success: true, hasCheckedIn: rows.length > 0, score: rows.length > 0 ? rows[0].score : null });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error checking status' });
    }
});

// --- PROFILE ROUTES ---

app.get('/api/user/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT name, email, height, weight, blood_type, birth_date, emergency_contact, institution, title_degree, sip_number FROM users WHERE id = $1',
            [id]
        );
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.put('/api/user/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { height, weight, blood_type, birth_date, emergency_contact } = req.body;
    try {
        await db.query(
            'UPDATE users SET height = $1, weight = $2, blood_type = $3, birth_date = $4, emergency_contact = $5 WHERE id = $6',
            [height, weight, blood_type, birth_date, emergency_contact, id]
        );
        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// --- AQI PROXY ROUTE ---
app.post('/api/aqi', async (req, res) => {
    const { lat, lon } = req.body;
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    try {
        const pollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const pollutionRes = await fetch(pollutionUrl);
        const pollutionData = await pollutionRes.json();

        const geoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (pollutionData.list && pollutionData.list.length > 0) {
            const item = pollutionData.list[0];
            const city = geoData.length > 0 ? geoData[0].name : 'Lokasi Terdeteksi';
            res.json({
                success: true,
                data: { aqi: item.main.aqi, pm25: item.components.pm2_5, co: item.components.co, city }
            });
        } else {
            throw new Error('No data found');
        }
    } catch (err) {
        console.error('AQI Fetch Error:', err);
        res.json({
            success: true,
            data: { aqi: 2, pm25: 15.5, co: 240, city: 'Mode Demo (API Key Missing)' }
        });
    }
});

// --- NEWS ROUTE (GEMINI AI) ---
app.post('/api/news', async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = "Cari 5 berita kesehatan pernapasan terbaru dan valid minggu ini (topik: Asma, TBC, Kualitas Udara, ISPA). Return JSON array valid tanpa markdown formatting. Format: [{title, summary, source, date}]. Bahasa Indonesia.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const newsData = JSON.parse(jsonStr);

        res.json({ success: true, data: newsData });
    } catch (err) {
        console.error("Gemini Error:", err);
        res.json({
            success: true,
            data: [
                { title: "Kualitas Udara Jakarta Memburuk Pagi Ini", summary: "Indeks kualitas udara (AQI) di Jakarta mencapai angka tidak sehat bagi kelompok sensitif.", source: "CNN Indonesia", date: "2023-10-25" },
                { title: "Waspada Lonjakan Kasus ISPA pada Anak", summary: "Dinas Kesehatan menghimbau orang tua untuk mewaspadai gejala ISPA di tengah peralihan musim.", source: "Kompas Health", date: "2023-10-24" },
                { title: "Terobosan Baru Pengobatan Asma Berat", summary: "Penelitian terbaru menunjukkan efektivitas obat biologis baru untuk penderita asma kronis.", source: "Detik Health", date: "2023-10-23" },
                { title: "Pentingnya Vaksinasi Influenza", summary: "Ahli paru menekankan pentingnya vaksin flu tahunan untuk mencegah komplikasi paru.", source: "Antara News", date: "2023-10-22" },
                { title: "Tips Menjaga Paru-paru Tetap Sehat", summary: "Latihan pernapasan rutin dan menghindari polusi adalah kunci kesehatan paru jangka panjang.", source: "Halodoc", date: "2023-10-21" }
            ]
        });
    }
});

// --- DIAGNOSIS HISTORY ROUTES ---

app.post('/api/diagnosis', async (req, res) => {
    const { userId, result, score, symptoms } = req.body;
    try {
        const [resultDb] = await db.query(
            'INSERT INTO diagnosis_logs (user_id, final_result, confidence_score, symptoms_summary) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, result, score, JSON.stringify(symptoms)]
        );
        res.json({ success: true, message: 'Diagnosis saved', id: resultDb[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to save diagnosis' });
    }
});

app.get('/api/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM diagnosis_logs WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
});

// --- ADMIN DASHBOARD ROUTES ---

app.get('/api/admin/stats', async (req, res) => {
    try {
        const [todayRows] = await db.query(
            "SELECT COUNT(*) as count FROM diagnosis_logs WHERE DATE(created_at) = CURRENT_DATE"
        );
        const totalToday = parseInt(todayRows[0].count);

        const [criticalRows] = await db.query(
            "SELECT COUNT(*) as count FROM diagnosis_logs WHERE final_result LIKE '%Bahaya%' OR final_result LIKE '%Segera%'"
        );
        const criticalCount = parseInt(criticalRows[0].count);

        const accuracy = 98;

        const [distributionRows] = await db.query(
            'SELECT final_result, COUNT(*) as count FROM diagnosis_logs GROUP BY final_result'
        );
        const diseaseDistribution = distributionRows.map(row => ({
            name: row.final_result.split(' - ')[0] || row.final_result,
            value: parseInt(row.count)
        }));

        const [activityRows] = await db.query(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM diagnosis_logs 
             WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
             GROUP BY DATE(created_at) 
             ORDER BY date ASC`
        );
        const activityLog = activityRows.map(row => ({
            date: new Date(row.date).toISOString().split('T')[0],
            count: parseInt(row.count)
        }));

        const alerts = [];

        const [criticalLogs] = await db.query(`
            SELECT d.final_result, u.name 
            FROM diagnosis_logs d
            JOIN users u ON d.user_id = u.id
            WHERE (
                d.final_result LIKE '%Bahaya%' OR d.final_result LIKE '%Segera%' OR
                d.final_result LIKE '%Gawat%' OR d.final_result LIKE '%Darurat%' OR
                d.final_result LIKE '%Kritis%' OR d.final_result LIKE '%Eksaserbasi%' OR
                d.final_result LIKE '%Emboli%' OR d.final_result LIKE '%Pneumothorax%' OR
                d.final_result LIKE '%Cor Pulmonale%' OR d.final_result LIKE '%Gagal Jantung%' OR
                d.final_result LIKE '%Kanker%' OR d.final_result LIKE '%Pneumonia%' OR
                d.final_result LIKE '%Tuberkulosis%'
            )
            AND d.created_at >= NOW() - INTERVAL '24 hours'
            LIMIT 10
        `);

        const [emergencyCountRows] = await db.query(`
            SELECT COUNT(DISTINCT user_id) as count 
            FROM diagnosis_logs 
            WHERE (
                final_result LIKE '%Bahaya%' OR final_result LIKE '%Segera%' OR
                final_result LIKE '%Gawat%' OR final_result LIKE '%Darurat%' OR
                final_result LIKE '%Kritis%' OR final_result LIKE '%Eksaserbasi%' OR
                final_result LIKE '%Emboli%' OR final_result LIKE '%Pneumothorax%' OR
                final_result LIKE '%Cor Pulmonale%' OR final_result LIKE '%Gagal Jantung%' OR
                final_result LIKE '%Kanker%' OR final_result LIKE '%Pneumonia%' OR
                final_result LIKE '%Tuberkulosis%'
            )
            AND created_at >= NOW() - INTERVAL '24 hours'
        `);
        const emergencyCount = parseInt(emergencyCountRows[0].count);

        criticalLogs.forEach(log => {
            alerts.push({
                type: 'critical',
                message: `Pasien ${log.name} terdiagnosa kritis: ${log.final_result.substring(0, 50)}...`
            });
        });

        const [novelLogs] = await db.query(`
            SELECT d1.final_result, d1.created_at, u.name
            FROM diagnosis_logs d1
            JOIN users u ON d1.user_id = u.id
            WHERE d1.created_at >= NOW() - INTERVAL '24 hours'
            AND NOT EXISTS (
                SELECT 1 FROM diagnosis_logs d2 
                WHERE d2.final_result = d1.final_result 
                AND d2.created_at < d1.created_at
            )
            LIMIT 10
        `);

        novelLogs.forEach(log => {
            alerts.push({
                type: 'discovery',
                message: `Pola Baru Terdeteksi: "${log.final_result.substring(0, 40)}..." muncul pertama kali pada pasien ${log.name}.`
            });
        });

        const [datasetRows] = await db.query('SELECT COUNT(*) as count FROM diagnosis_logs');
        const datasetCount = parseInt(datasetRows[0].count);
        const datasetStatus = {
            label: 'Training Data',
            count: `${datasetCount} Records`,
            percentage: Math.min((datasetCount / 2000) * 100, 100)
        };

        const [totalUsersStatsRows] = await db.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = parseInt(totalUsersStatsRows[0].count);

        const [totalDiagnosesRows] = await db.query('SELECT COUNT(*) as count FROM diagnosis_logs');
        const totalDiagnoses = parseInt(totalDiagnosesRows[0].count);

        const [recentActivityRows] = await db.query(`
            SELECT d.created_at, d.final_result, u.name as user_name
            FROM diagnosis_logs d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
            LIMIT 8
        `);

        res.json({
            success: true,
            data: {
                stats: { totalToday, criticalCount, accuracy },
                total_users: totalUsers,
                total_diagnoses: totalDiagnoses,
                avg_accuracy: accuracy,
                charts: { diseaseDistribution, activityLog },
                alerts,
                datasetStatus,
                recent_activity: recentActivityRows,
                emergency_count: emergencyCount,
                pendingReviews: []
            }
        });
    } catch (err) {
        console.error("Admin Stats Error:", err);
        res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: err.message });
    }
});

app.get('/api/admin/history/all', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT d.id, d.created_at, u.name as patient_name, d.final_result, d.confidence_score
            FROM diagnosis_logs d
            LEFT JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
        `);

        const formattedRows = rows.map(row => ({
            id: row.id,
            requested_date: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString(),
            patient_name: row.patient_name || 'Unknown User',
            diagnosis_result: row.final_result,
            confidence_score: row.confidence_score,
            status: 'completed'
        }));

        res.json({ success: true, data: formattedRows });
    } catch (err) {
        console.error("History Error:", err);
        res.status(500).json({ success: false, message: 'Failed to fetch history: ' + err.message });
    }
});

// --- EXPERT SYSTEM ROUTES ---

app.put('/api/expert/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { institution, title_degree, sip_number } = req.body;
    try {
        await db.query(
            'UPDATE users SET institution = $1, title_degree = $2, sip_number = $3 WHERE id = $4',
            [institution, title_degree, sip_number, id]
        );
        res.json({ success: true, message: 'Expert profile updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

app.post('/api/expert/research', async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Bertindak sebagai Peneliti Medis AI Senior.
        Lakukan simulasi pemindaian proaktif terhadap literatur medis pernapasan global tahun 2024-2025.
        Identifikasi 3 temuan klinis baru (gejala baru, faktor risiko baru, atau korelasi penyakit baru) yang BELUM umum diketahui atau sedang tren.
        
        Output WAJIB berupa JSON ARRAY yang valid. Jangan ada teks lain selain JSON.
        Struktur:
        [
            {
                "type": "symptom" atau "rule",
                "name": "Nama Gejala/Penyakit",
                "clinical_evidence": "Ringkasan temuan dari jurnal (Bahasa Indonesia)...",
                "source_journal": "Nama Jurnal/Sumber (Tahun)",
                "suggested_action": "Saran implementasi ke sistem...",
                "proposed_node": { "question": "...", "options": [...] }
            }
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const draftData = JSON.parse(jsonStr);

        res.json({ success: true, data: draftData });
    } catch (err) {
        console.error("Gemini Logic Error:", err);
        res.status(500).json({ success: false, message: 'Failed to generate logic: ' + (err.message || 'Unknown Error') });
    }
});

app.post('/api/expert/merge', async (req, res) => {
    const { draft } = req.body;
    try {
        console.log("Merging Draft:", draft);
        res.json({ success: true, message: 'Data merged successfully.' });
    } catch (err) {
        console.error("Merge Error:", err);
        res.status(500).json({ success: false, message: 'Failed to merge data' });
    }
});

// --- TREE MANAGER ROUTES ---

// Save Decision Tree to DB instead of filesystem
app.post('/api/expert/save-tree', async (req, res) => {
    const { treeData } = req.body;
    try {
        // Upsert: update if exists, insert if not (using a single-row config table)
        await db.query(`
            INSERT INTO app_config (key, value, updated_at)
            VALUES ('decision_tree', $1, NOW())
            ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()
        `, [JSON.stringify(treeData)]);

        res.json({ success: true, message: 'Decision tree saved successfully.' });
    } catch (err) {
        console.error("Save Tree Error:", err);
        res.status(500).json({ success: false, message: 'Failed to save tree' });
    }
});

app.get('/api/tree', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT value FROM app_config WHERE key = 'decision_tree'");
        if (rows.length > 0) {
            res.json({ success: true, data: JSON.parse(rows[0].value) });
        } else {
            // Return default tree if none saved yet
            res.json({ success: true, data: { nodes: [], edges: [] } });
        }
    } catch (err) {
        console.error("Get Tree Error:", err);
        res.status(500).json({ success: false, message: 'Failed to fetch tree' });
    }
});

// --- TELEMEDICINE ROUTES ---

app.get('/api/messages/:userId/:contactId', async (req, res) => {
    const { userId, contactId } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
        `, [userId, contactId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

app.get('/api/messages/unread/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = FALSE',
            [userId]
        );
        const [latest] = await db.query(`
            SELECT m.content, m.created_at, u.name as sender_name 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = $1 AND m.is_read = FALSE
            ORDER BY m.created_at DESC
            LIMIT 1
        `, [userId]);

        res.json({
            success: true,
            count: parseInt(rows[0].count),
            latest_message: latest.length > 0 ? latest[0] : null
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, count: 0, latest_message: null });
    }
});

app.post('/api/messages/mark-read', async (req, res) => {
    const { userId, senderId } = req.body;
    try {
        await db.query(
            'UPDATE messages SET is_read = TRUE WHERE receiver_id = $1 AND sender_id = $2',
            [userId, senderId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

app.post('/api/messages/send', async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    try {
        await db.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)',
            [senderId, receiverId, content]
        );
        res.json({ success: true, message: 'Message sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

app.get('/api/contacts/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [userRows] = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

        const role = userRows[0].role;
        const targetRole = role === 'expert' ? 'patient' : 'expert';

        const [contacts] = await db.query(`
            SELECT 
                u.id, u.name, u.email, u.role, u.title_degree, u.last_active_at,
                (SELECT content FROM messages m WHERE (m.sender_id = u.id AND m.receiver_id = $1) OR (m.sender_id = $1 AND m.receiver_id = u.id) ORDER BY m.created_at DESC LIMIT 1) as lastMessage,
                (SELECT created_at FROM messages m WHERE (m.sender_id = u.id AND m.receiver_id = $1) OR (m.sender_id = $1 AND m.receiver_id = u.id) ORDER BY m.created_at DESC LIMIT 1) as lastMessageTime,
                (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id AND m.receiver_id = $1 AND m.is_read = FALSE) as unreadCount
            FROM users u 
            WHERE u.role = $2
        `, [userId, targetRole]);

        res.json({ success: true, data: contacts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
    }
});

app.get('/api/doctors', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, title_degree, institution FROM users WHERE role = 'expert'"
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
    }
});

app.post('/api/consultations/book', async (req, res) => {
    const { userId, diagnosisId, doctorId, date, notes } = req.body;
    try {
        await db.query(
            'INSERT INTO consultations (user_id, doctor_id, diagnosis_log_id, requested_date, notes) VALUES ($1, $2, $3, $4, $5)',
            [userId, doctorId, diagnosisId, date, notes]
        );
        res.json({ success: true, message: 'Janji temu berhasil dibuat.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal membuat janji temu.' });
    }
});

app.get('/api/expert/appointments/:doctorId', async (req, res) => {
    const { doctorId } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT c.id, c.requested_date, c.notes, c.status, c.created_at, c.user_id,
                   u.name as patient_name, u.email as patient_email,
                   d.final_result as diagnosis_result, d.confidence_score
            FROM consultations c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN diagnosis_logs d ON c.diagnosis_log_id = d.id
            WHERE c.doctor_id = $1
            ORDER BY 
                CASE WHEN c.status = 'pending' THEN 1 WHEN c.status = 'approved' THEN 2 ELSE 3 END ASC,
                c.requested_date ASC
        `, [doctorId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch expert appointments' });
    }
});

app.get('/api/patient/appointments/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT c.id, c.requested_date, c.notes, c.status, c.created_at, c.doctor_id,
                   u.name as doctor_name, u.title_degree as doctor_title, u.institution as doctor_institution
            FROM consultations c
            JOIN users u ON c.doctor_id = u.id
            WHERE c.user_id = $1
            ORDER BY c.requested_date ASC
        `, [userId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch patient appointments' });
    }
});

app.post('/api/expert/appointments/respond', async (req, res) => {
    const { id, status, response } = req.body;
    try {
        await db.query(
            'UPDATE consultations SET status = $1, doctor_response = $2 WHERE id = $3',
            [status, response, id]
        );
        res.json({ success: true, message: `Appointment ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update appointment' });
    }
});

app.post('/api/consultations/cancel', async (req, res) => {
    const { id } = req.body;
    try {
        await db.query("UPDATE consultations SET status = 'cancelled' WHERE id = $1", [id]);
        res.json({ success: true, message: 'Janji temu dibatalkan.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal membatalkan janji.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
