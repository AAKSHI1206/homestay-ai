import dns from 'node:dns';
import mongoose from 'mongoose';

// ─── DNS Fix ──────────────────────────────────────────────────
// Some ISPs (e.g. Reliance/Jio in India) block MongoDB Atlas
// SRV record lookups. Force Google's public DNS to resolve them.
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * connectDB
 * ─────────
 * Connects to MongoDB Atlas using the URI stored in the
 * MONGODB_URI environment variable.
 *
 * Returns the Mongoose connection so the caller can
 * conditionally start the server only after a successful
 * connection.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`  ✅ MongoDB connected: ${conn.connection.host}`);

    return conn;
  } catch (err) {
    console.error(`  ❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ────────────────────────────────────────
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n  🛑 MongoDB connection closed (app termination)');
  process.exit(0);
});

export default connectDB;
