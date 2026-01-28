import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { register, login, studentLogin } from './authController';
import dbConnect from './db';
import { User } from './User';

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

// Middleware для проверки токена
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
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

// Профиль и результаты
router.get('/students/profile', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

router.post('/results', authenticateToken, async (req: any, res: any) => {
  try {
    const { levelId, coinsEarned } = req.body;
    const user = await User.findById(req.user.id);
    
    if (user) {
      user.coins = (user.coins || 0) + coinsEarned;
      // Добавляем уровень в пройденные, если его там нет
      if (!user.completedLevels.includes(levelId)) {
        user.completedLevels.push(levelId);
      }
      await user.save();
      res.json({ success: true, user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving results' });
  }
});

// ================= АДМИН МАРШРУТЫ (Добавлено) =================

// 1. Создание студента админом
router.post('/admin/students/add', authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }
    const { name, grade } = req.body;
    if (!name || !grade) {
      return res.status(400).json({ message: 'Необходимо указать ФИО и класс' });
    }

    const parsedGrade = parseInt(grade);
    if (isNaN(parsedGrade)) {
      return res.status(400).json({ message: 'Некорректный класс' });
    }

    // Проверка на дубликат
    const existing = await User.findOne({ name, grade: parsedGrade, role: 'student' });
    if (existing) {
      return res.status(409).json({ message: 'Ученик уже существует' });
    }

    // Генерируем технические данные
    const uniqueId = 'STU_' + Date.now() + Math.floor(Math.random() * 1000);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(uniqueId, salt);

    const user = await User.create({
      name,
      username: uniqueId,
      password: hashedPassword,
      role: 'student',
      grade: parsedGrade,
      coins: 0
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка создания ученика', error: error.message });
  }
});

// 2. Получение списка учеников (для учителя и админа)
router.get('/teachers/students', authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }
    
    // Возвращаем всех студентов
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
    
    // Форматируем данные для фронтенда
    const formattedStudents = students.map(s => ({
      _id: s._id,
      name: s.name,
      grade: s.grade,
      coins: s.coins,
      totalTestsCompleted: s.completedLevels?.length || 0,
      totalCorrectAnswers: 0 // В этой версии бэкенда детальная статистика упрощена
    }));

    res.json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения списка учеников' });
  }
});

// 3. Удаление пользователя
router.delete('/admin/users/:userId', authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления пользователя' });
  }
});

// 4. Статистика для админа
router.get('/admin/stats', authenticateToken, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    
    res.json({
      totalStudents,
      totalTeachers,
      totalTests: 0,
      averageScore: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения статистики' });
  }
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