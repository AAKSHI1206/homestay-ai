import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import connectDB from './config/db.js';
import configurePassport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
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

// ─── Passport ─────────────────────────────────────────────────
configurePassport();
app.use(passport.initialize());

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
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/reviews', reviewRoutes);

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
    console.log(`  → Database    : MongoDB Atlas`);

    // Week 7 — Gemini AI key check
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log(`  ⚠ Gemini AI   : NOT configured (set GEMINI_API_KEY in .env)`);
    } else {
      console.log(`  → Gemini AI   : Configured ✓`);
    }
    console.log();
  });
});