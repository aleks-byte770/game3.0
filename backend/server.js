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

// Модель пользователя (ученика)
const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  grade: { type: Number, required: true, min: 1, max: 11 },
  school: String,
  score: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  achievements: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

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
  studentId: { type: String, required: true },
  levelId: { type: Number, required: true },
  grade: { type: Number, required: true },
  correctAnswers: Number,
  totalQuestions: Number,
  percentage: Number,
  coinsEarned: Number,
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

const Student = mongoose.model('Student', studentSchema);
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

// ====================== МАРШРУТЫ СТУДЕНТОВ ======================

// Регистрация студента
app.post('/api/students/register', async (req, res) => {
  try {
    const { name, email, password, grade, school } = req.body;
    
    if (!name || !email || !password || !grade) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }

    // Проверка уникальности email
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentId = 'STU_' + Date.now();
    const student = new Student({
      studentId,
      name,
      email,
      password: hashedPassword,
      grade: parseInt(grade),
      school: school || 'Unknown'
    });

    await student.save();

    // Логирование
    const log = new Log({
      type: 'user_registered',
      userId: studentId,
      userType: 'student',
      details: { name, email, grade }
    });
    await log.save();

    const token = generateToken({ studentId, email, userType: 'student' });
    res.json({ token, student: student.toObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Вход студента
app.post('/api/students/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ error: 'Неправильный email или пароль' });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Неправильный email или пароль' });
    }

    const token = generateToken({ studentId: student.studentId, email, userType: 'student' });
    // Не отправляем пароль обратно
    const { password: _, ...studentData } = student.toObject();
    res.json({ token, student: studentData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Получение профиля студента
app.get('/api/students/profile', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.user.studentId });
    if (!student) return res.status(404).json({ error: 'Студент не найден' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения профиля' });
  }
});

// Получение результатов студента
app.get('/api/students/results', authenticateToken, async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user.studentId });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения результатов' });
  }
});

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

// Получение студентов учителя
app.get('/api/teachers/students', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'teacher' && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const teacher = await Teacher.findById(req.user.teacherId).populate('students');
    res.json(teacher.students);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения студентов' });
  }
});

// ====================== МАРШРУТЫ РЕЗУЛЬТАТОВ ======================

// Сохранение результата теста
app.post('/api/results', authenticateToken, async (req, res) => {
  try {
    const { levelId, grade, correctAnswers, totalQuestions, coinsEarned } = req.body;

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result = new Result({
      studentId: req.user.studentId,
      levelId: parseInt(levelId),
      grade: parseInt(grade),
      correctAnswers,
      totalQuestions,
      percentage,
      coinsEarned
    });

    await result.save();

    // Обновление данных студента
    const student = await Student.findOne({ studentId: req.user.studentId });
    if (student) {
      student.coins += coinsEarned;
      student.score += correctAnswers * 10;
      student.updatedAt = new Date();
      await student.save();
    }

    const log = new Log({
      type: 'test_completed',
      userId: req.user.studentId,
      userType: 'student',
      details: { levelId, grade, percentage, coinsEarned }
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

    const totalStudents = await Student.countDocuments();
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
