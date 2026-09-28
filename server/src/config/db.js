import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('memory')) {
      console.log('Starting In-Memory MongoDB Server for frictionless instant launch...');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`In-Memory MongoDB started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Falling back to local MongoMemoryServer...');
    try {
      mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`Fallback In-Memory MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error(`Fallback Mongo error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
