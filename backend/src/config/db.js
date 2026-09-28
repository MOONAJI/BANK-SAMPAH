const mongoose = require('mongoose');

/**
 * Cache koneksi global agar instance serverless (Vercel) yang "hangat"
 * dapat menggunakan ulang koneksi sebelumnya, serta tetap kompatibel
 * dengan server konvensional (VPS / Docker).
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bank_sampah';

    cached.promise = mongoose.connect(mongoUri)
      .then((mongooseInstance) => {
        console.log(`[MongoDB Connected]: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error(`[MongoDB Connection Error]: ${error.message}`);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

module.exports = connectDB;
