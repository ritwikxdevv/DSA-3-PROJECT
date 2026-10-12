import dotenv from 'dotenv';
import mongoose from 'dotenv';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import { initialProducts } from './data/mockProductsData.js';
import mongooseConn from 'mongoose';

dotenv.config();

const seedDatabase = async () => {
  console.log('[Seed] Connecting to MongoDB...');
  const connected = await connectDB();

  if (!connected) {
    console.error('[Seed Error] Cannot seed: MongoDB connection failed.');
    process.exit(1);
  }

  try {
    console.log('[Seed] Clearing existing product records...');
    await Product.deleteMany({});

    console.log(`[Seed] Inserting ${initialProducts.length} mock e-commerce products...`);
    const inserted = await Product.insertMany(initialProducts);

    console.log(`[Seed Success] Successfully seeded ${inserted.length} products into MongoDB!`);
    console.log('[Seed Breakdown by Brand]:');
    const brands = {};
    inserted.forEach(p => {
      brands[p.brand] = (brands[p.brand] || 0) + 1;
    });
    console.table(brands);

    await mongooseConn.disconnect();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error] Failed to seed database: ${err.message}`);
    process.exit(1);
  }
};

seedDatabase();
