require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const leadsRouter = require('./routes/leads');

const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('Missing MONGO_URI. Copy leads-api/.env.example to leads-api/.env and set MONGO_URI.');
  process.exit(1);
}

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'leads-api' });
});

app.use('/leads', leadsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on :${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
