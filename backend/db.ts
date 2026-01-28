import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-gamebd:dEkwngkd5OIVzOzX@gamebd.xpfy4av.mongodb.net/gamebd?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function dbConnect() {
  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });
  return mongoose;
}

export default dbConnect;