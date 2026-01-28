import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { register, login } from './authController.js';
import { User } from './User.js';
import { Level } from './Level.js';
import { Result } from './Result.js';
import { Group } from './Group.js';
import dbConnect from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware для аутентификации
const authenticate = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Нет токена' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};

// Хардкод уровней (временно, пока не добавим в БД)
const allLevels = [
  // Здесь нужно добавить все уровни из src/store/levels/*.ts
  // Для примера добавим один уровень
  {
    id: '1-1',
    title: 'Деньги и их назначение',
    description: 'Узнайте, для чего нужны деньги',
    grade: 1,
    questions: [
      { id: 'q1-1-1', text: 'Для чего нужны деньги?', choices: ['Для игр', 'Для покупки товаров', 'Для украшения', 'Для коллекции'], correctIndex: 1, explanation: 'Деньги нужны для обмена на товары и услуги.' },
      // ... остальные вопросы
    ],
    reward: { coinsPerCorrect: 10, pointsPerCorrect: 10 },
  },
  // Тестовый уровень для 12 класса с одним вопросом
  {
    id: '12-1',
    title: 'Тест сохранения результатов',
    description: 'Тестовый уровень для проверки сохранения в БД',
    grade: 12,
    questions: [
      { id: 'q12-1-1', text: 'Тестовый вопрос: 2 + 2 = ?', choices: ['3', '4', '5', '6'], correctIndex: 1, explanation: '2 + 2 = 4' },
    ],
    reward: { coinsPerCorrect: 10, pointsPerCorrect: 10 },
  },
  // Добавить остальные уровни
];

// Маршруты (Routes)
// Мы адаптируем их под то, как вызывает фронтенд:
// api.studentRegister -> /api/students/register
// api.teacherRegister -> /api/teachers/register

const router = express.Router();

// Студенты
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

// Уровни
router.get('/levels', (req, res) => {
  res.json(allLevels);
});

router.get('/levels/grade/:grade', (req, res) => {
  const grade = parseInt(req.params.grade);
  const levels = allLevels.filter(l => l.grade === grade);
  res.json(levels);
});

// Результаты
router.post('/results', async (req, res) => {
  console.log('Received save result request:', req.body);
  try {
    console.log('Connecting to DB...');
    await dbConnect();
    console.log('DB connected');
    const { studentName, levelId, grade, correctAnswers, totalQuestions, timeTaken } = req.body;
    console.log('Creating result...');
    const result = await Result.create({
      studentName,
      levelId,
      grade,
      correctAnswers,
      totalQuestions,
      timeTaken,
      coinsEarned: correctAnswers * 10, // пример
      pointsEarned: correctAnswers * 10,
    });
    console.log('Result created:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ message: 'Ошибка сохранения результата' });
  }
});

// Профиль учителя
router.get('/teachers/profile', authenticate, async (req, res) => {
  try {
    await dbConnect();
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'teacher') {
      return res.status(404).json({ message: 'Учитель не найден' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school || '',
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля' });
  }
});

// Результаты учителя
router.get('/teachers/results', authenticate, async (req, res) => {
  try {
    await dbConnect();
    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения результатов' });
  }
});

// Группы учителя
router.post('/teachers/groups', authenticate, async (req, res) => {
  try {
    await dbConnect();
    const { name } = req.body;
    const group = await Group.create({
      name,
      teacherId: req.user.id,
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка создания группы' });
  }
});

router.get('/teachers/groups', authenticate, async (req, res) => {
  try {
    await dbConnect();
    const groups = await Group.find({ teacherId: req.user.id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения групп' });
  }
});

// Админ (простая заглушка)
router.get('/admin/logs', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ запрещен' });
  res.json([]);
});

router.get('/admin/stats', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ запрещен' });
  res.json({ users: 0, results: 0 });
});

router.delete('/admin/users/:userId', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ запрещен' });
  res.json({ message: 'Пользователь удален' });
});

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