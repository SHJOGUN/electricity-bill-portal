const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS consumption (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        consumption REAL NOT NULL
    )`);
});

app.post('/api/consumption', (req, res) => {
    const { date, consumption } = req.body;
    if (!date || !consumption) {
        return res.status(400).json({ error: 'Please provide both date and consumption' });
    }
    const stmt = db.prepare("INSERT INTO consumption (date, consumption) VALUES (?, ?)");
    stmt.run(date, consumption, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
    stmt.finalize();
});

app.get('/api/consumption', (req, res) => {
    db.all("SELECT * FROM consumption ORDER BY date", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/api/prediction', (req, res) => {
    const WINDOW_SIZE = 3;
    const TARIFF_PER_UNIT = 7.5;
    db.all("SELECT * FROM consumption ORDER BY date DESC LIMIT ?", [WINDOW_SIZE], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length < WINDOW_SIZE) {
            return res.json({ predictedBill: 'Not enough data to predict.' });
        }
        const totalConsumptionInWindow = rows.reduce((sum, d) => sum + d.consumption, 0);
        const averageConsumption = totalConsumptionInWindow / WINDOW_SIZE;
        const predictedBill = averageConsumption * TARIFF_PER_UNIT * 30;
        res.json({ predictedBill: `₹${predictedBill.toFixed(2)}` });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
