/**
 * Database Seeder
 * ───────────────
 * Run with: node seed.js
 *
 * Populates the MongoDB listings collection with the same
 * seed data that was previously stored in data/listings.js.
 *
 * Creates a demo user and assigns all listings to that user.
 *
 * ⚠ This script clears ALL existing listings before inserting.
 */

import dotenv from 'dotenv';
import dns from 'node:dns';
import mongoose from 'mongoose';
import Listing from './models/Listing.js';
import User from './models/User.js';

// Force Google DNS to bypass ISP SRV block
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { listings as seedData } from './data/listings.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  ✅ Connected to MongoDB');

    // Find or create a demo user to own the seed listings
    let demoUser = await User.findOne({ email: 'demo@homestayai.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Host',
        email: 'demo@homestayai.com',
        password: 'demo123456',
      });
      console.log(`  👤 Created demo user: ${demoUser.email} (password: demo123456)`);
    } else {
      console.log(`  👤 Found existing demo user: ${demoUser.email}`);
    }

    // Clear existing listings
    const deleted = await Listing.deleteMany({});
    console.log(`  🗑  Cleared ${deleted.deletedCount} existing listing(s)`);

    // Strip the old UUID `id` field — MongoDB will generate _id
    // Assign owner to the demo user
    const cleaned = seedData.map(({ id, createdAt, ...rest }) => ({
      ...rest,
      owner: demoUser._id,
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
    console.log('  Login with: demo@homestayai.com / demo123456');
    process.exit(0);
  } catch (err) {
    console.error('  ❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
