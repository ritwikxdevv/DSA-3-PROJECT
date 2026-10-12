import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Node.js on Windows where local router DNS refuses SRV queries
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Fallback to default if restricted
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productmatch_dsa';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database name: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Connection Error] Failed to connect to MongoDB: ${error.message}`);
    console.error(`[MongoDB Tip] Ensure MongoDB service is running locally on port 27017 or provide a valid Atlas connection string in backend/.env`);
    return false;
  }
};
