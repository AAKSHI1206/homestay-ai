import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import listingRoutes from './routes/listingRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json()); // parse JSON request bodies

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/listings', listingRoutes);

// ─── Error Handling (must be LAST) ────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  🏡 HomestayAI API Server`);
    console.log(`  ───────────────────────────`);
    console.log(`  → Running at  : http://localhost:${PORT}`);
    console.log(`  → Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  → CORS origin : ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`  → Database    : MongoDB Atlas\n`);
  });
});