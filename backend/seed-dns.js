/**
 * Seed with Google DNS
 * ────────────────────
 * Workaround for ISPs (like Reliance/Jio) that block
 * MongoDB Atlas SRV DNS lookups. Forces Node.js to use
 * Google's public DNS (8.8.8.8) for resolution.
 *
 * Run with: node seed-dns.js
 */

import dns from 'node:dns';

// Force Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Now run the actual seeder
await import('./seed.js');
