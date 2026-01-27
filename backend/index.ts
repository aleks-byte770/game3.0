import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, studentLogin } from './authController';
import dbConnect from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware для подключения к БД перед каждым запросом
const dbMiddleware = async (req: any, res: any, next: any) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
};

// Маршруты (Routes)
// Мы адаптируем их под то, как вызывает фронтенд:
// api.studentRegister -> /api/students/register
// api.teacherRegister -> /api/teachers/register

const router = express.Router();

// Студенты
router.use(dbMiddleware); // Используем новое middleware для подключения к БД

router.post('/students/register', (req, res, next) => {
  req.body.role = 'student';
  next();
}, register);

router.post('/students/login', studentLogin);

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