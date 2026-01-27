// Backend сервер на Express.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Инициализация приложения
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_game';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB подключена'))
  .catch(err => console.error('❌ Ошибка MongoDB:', err));

// ====================== МОДЕЛИ ======================

// Модель учителя
const teacherSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  school: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  groups: [{ 
    groupId: String, 
    name: String, 
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
  }],
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Модель результатов тестов
const resultSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  levelId: { type: String, required: true },
  grade: { type: Number, required: true },
  correctAnswers: Number,
  totalQuestions: Number,
  percentage: Number,
  timeTaken: Number, // Время выполнения в секундах
  completedAt: { type: Date, default: Date.now }
});

// Модель логов (для админа)
const logSchema = new mongoose.Schema({
  type: String, // 'login', 'test_completed', 'user_registered', etc.
  userId: String,
  userType: String, // 'student', 'teacher', 'admin'
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

const Teacher = mongoose.model('Teacher', teacherSchema);
const Result = mongoose.model('Result', resultSchema);
const Log = mongoose.model('Log', logSchema);

// ====================== УТИЛИТЫ ======================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

function generateToken(data) {
  return jwt.sign(data, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).json({ error: 'Invalid token' });

  req.user = decoded;
  next();
};

// ====================== МАРШРУТЫ УЧИТЕЛЕЙ ======================

// Регистрация учителя
app.post('/api/teachers/register', async (req, res) => {
  try {
    const { email, password, name, school } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }

    // Проверка уникальности email
    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      email,
      password: hashedPassword,
      name,
      school: school || 'Unknown'
    });

    await teacher.save();

    const log = new Log({
      type: 'user_registered',
      userId: teacher._id,
      userType: 'teacher',
      details: { email, name }
    });
    await log.save();

    const token = generateToken({ teacherId: teacher._id, email, userType: 'teacher' });
    res.json({ token, teacher: { _id: teacher._id, email, name, school } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Вход учителя
app.post('/api/teachers/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ error: 'Неправильный email или пароль' });
    }

    const passwordMatch = await bcrypt.compare(password, teacher.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Неправильный email или пароль' });
    }

    const log = new Log({
      type: 'login',
      userId: teacher._id,
      userType: 'teacher',
      details: { email }
    });
    await log.save();

    const token = generateToken({ teacherId: teacher._id, email, userType: 'teacher' });
    res.json({ token, teacher: { _id: teacher._id, email, name: teacher.name, school: teacher.school } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Получение результатов всех учеников для панели учителя
app.get('/api/teachers/results', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'teacher' && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Просто возвращаем все результаты, учитель отфильтрует на фронте если надо
    const results = await Result.find().sort({ completedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения результатов учеников' });
  }
});

// ====================== МАРШРУТЫ РЕЗУЛЬТАТОВ ======================

// Сохранение результата теста
app.post('/api/results', async (req, res) => { // Больше не требует аутентификации
  try {
    const { studentName, levelId, grade, correctAnswers, totalQuestions, timeTaken } = req.body;

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result = new Result({
      studentName,
      levelId,
      grade,
      correctAnswers,
      totalQuestions,
      percentage,
      timeTaken
    });

    await result.save();

    const log = new Log({
      type: 'test_completed',
      userId: studentName, // Используем имя как идентификатор
      userType: 'student',
      details: { levelId, grade, percentage }
    });
    await log.save();

    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения результата' });
  }
});

// ====================== АДМИН МАРШРУТЫ ======================

// Получение логов (только для админов)
app.get('/api/admin/logs', authenticateToken, async (req, res) => {
  try {
    // Проверка прав администратора
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const logs = await Log.find().sort({ timestamp: -1 }).limit(1000);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения логов' });
  }
});

// Получение статистики (только для админов)
app.get('/api/admin/statistics', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const totalStudents = await Result.distinct('studentName').then(names => names.length);
    const totalTeachers = await Teacher.countDocuments();
    const totalTests = await Result.countDocuments();
    const averageScore = await Result.aggregate([
      { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);

    res.json({
      totalStudents,
      totalTeachers,
      totalTests,
      averageScore: averageScore[0]?.avg || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// ====================== ЗДОРОВЬЕ СЕРВЕРА ======================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ====================== ЗАПУСК СЕРВЕРА ======================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📊 API документация: http://localhost:${PORT}/api`);
});

module.exports = app;
