/**
 * Database Seeder
 * ───────────────
 * Run with: node seed.js
 *
 * Populates the MongoDB listings collection with the same
 * seed data that was previously stored in data/listings.js.
 *
 * ⚠ This script clears ALL existing listings before inserting.
 */

import dotenv from 'dotenv';
import dns from 'node:dns';
import mongoose from 'mongoose';
import Listing from './models/Listing.js';

// Force Google DNS to bypass ISP SRV block
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { listings as seedData } from './data/listings.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Connected to MongoDB');

    // Clear existing data
    const deleted = await Listing.deleteMany({});
    console.log(`  🗑  Cleared ${deleted.deletedCount} existing listing(s)`);

    // Strip the old UUID `id` field — MongoDB will generate _id
    const cleaned = seedData.map(({ id, createdAt, ...rest }) => ({
      ...rest,
      createdAt: new Date(createdAt),
    }));

    // Insert seed data
    const inserted = await Listing.insertMany(cleaned);
    console.log(`  🌱 Seeded ${inserted.length} listing(s)`);

    // Show inserted documents
    inserted.forEach((doc) => {
      console.log(`     → ${doc.title} (${doc.id})`);
    });

    await mongoose.connection.close();
    console.log('\n  Done. Connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('  ❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
