import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { register, login } from './authController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
const connectDB = async (req: any, res: any, next: any) => {
  if (mongoose.connection.readyState >= 1) {
    return next();
  }
  // Поддержка обоих вариантов названия переменной
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('Database URI is missing');
    return res.status(500).json({ message: 'Database configuration error' });
  }
  
  await mongoose.connect(uri)
    .then(() => next())
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      res.status(500).json({ message: 'Database connection failed' });
    });
};

// Маршруты (Routes)
// Мы адаптируем их под то, как вызывает фронтенд:
// api.studentRegister -> /api/students/register
// api.teacherRegister -> /api/teachers/register

const router = express.Router();

// Студенты
router.use(connectDB); // Подключаем БД перед обработкой роутов

router.post('/students/register', (req, res, next) => {
  req.body.role = 'student';
  next();
}, register);

router.post('/students/login', (req, res, next) => {
  req.body.role = 'student';
  next();
}, login);

// Учителя
router.post('/teachers/register', (req, res, next) => {
  req.body.role = 'teacher';
  next();
}, register);

router.post('/teachers/login', (req, res, next) => {
  req.body.role = 'teacher';
  next();
}, login);

app.use('/api', router);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Local development
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;