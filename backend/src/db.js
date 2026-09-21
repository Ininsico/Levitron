import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy backend/.env.example to backend/.env and fill it in.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    dbName: process.env.MONGO_DB || undefined,
  });

  console.log(`MongoDB connected → ${mongoose.connection.name}`);

  return mongoose.connection;
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
