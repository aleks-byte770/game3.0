import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-gamebf:weJgrmk4djbfvZn6@gamebf.e3ndvpr.mongodb.net/?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Расширяем глобальный тип NodeJS, чтобы добавить наш кеш mongoose
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    // Используем кешированное соединение
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Отключаем буферизацию Mongoose
    };

    // Создаем новое соединение
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // В случае ошибки очищаем промис для повторной попытки
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;