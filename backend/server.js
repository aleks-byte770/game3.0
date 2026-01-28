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
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-gamebf:weJgrmk4djbfvZn6@gamebf.e3ndvpr.mongodb.net/?retryWrites=true&w=majority';

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
  username: { type: String, unique: true, required: true },
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
  levelId: { type: String, required: true },
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

// Вход или создание студента по ФИО и классу
app.post('/api/students/login', async (req, res) => {
  try {
    const { name, grade } = req.body;
    if (!name || !grade) {
      return res.status(400).json({ error: 'Необходимо указать ФИО и класс' });
    }

    const parsedGrade = parseInt(grade);
    if (isNaN(parsedGrade) || parsedGrade < 1 || parsedGrade > 11) {
        return res.status(400).json({ error: 'Некорректный класс' });
    }

    let student = await Student.findOne({ name, grade: parsedGrade });

    if (!student) {
      const studentId = 'STU_' + Date.now();
      student = new Student({
        studentId, name, grade: parsedGrade,
        email: `${studentId}@school.local`, // Email обязателен, генерируем уникальный
      });
      await student.save();
    }

    const token = generateToken({ studentId: student.studentId, userType: 'student' });
    res.json({ token, student: { ...student.toObject(), role: 'student' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка регистрации' });
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

// Вход учителя
app.post('/api/teachers/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Специальный вход для администратора
    if (username === 'moris' && password === 'moris') {
      let adminUser = await Teacher.findOne({ username: 'moris' });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash('moris', 10);
        adminUser = new Teacher({
          username: 'moris',
          password: hashedPassword,
          name: 'Администратор',
          isAdmin: true,
        });
        await adminUser.save();
      }
      const token = generateToken({ teacherId: adminUser._id, email: adminUser.email, userType: 'admin' });
      return res.json({ token, teacher: { _id: adminUser._id, username: adminUser.username, name: adminUser.name, role: 'admin' } });
    }

    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    const teacher = await Teacher.findOne({ username });
    if (!teacher) {
      return res.status(401).json({ error: 'Неправильный логин или пароль' });
    }

    const passwordMatch = await bcrypt.compare(password, teacher.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Неправильный логин или пароль' });
    }

    const log = new Log({
      type: 'login',
      userId: teacher._id,
      userType: 'teacher',
      details: { username }
    });
    await log.save();

    const userType = teacher.isAdmin ? 'admin' : 'teacher';
    const token = generateToken({ teacherId: teacher._id, username, userType });
    res.json({ token, teacher: { _id: teacher._id, username, name: teacher.name, school: teacher.school, role: userType } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Регистрация учителя
app.post('/api/teachers/register', authenticateToken, async (req, res) => {
  try {
    // Только администратор может регистрировать учителей
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Только администратор может выполнять это действие.' });
    }

    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Имя, логин и пароль обязательны' });
    }

    const existingTeacher = await Teacher.findOne({ username });
    if (existingTeacher) {
      return res.status(409).json({ error: 'Учитель с таким логином уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new Teacher({
      name,
      username,
      password: hashedPassword,
    });

    await newTeacher.save();

    const log = new Log({
      type: 'register',
      userId: newTeacher._id,
      userType: 'teacher',
      details: { username }
    });
    await log.save();

    const userType = newTeacher.isAdmin ? 'admin' : 'teacher';
    const token = generateToken({ teacherId: newTeacher._id, username, userType });
    res.status(201).json({ token, teacher: { _id: newTeacher._id, username, name: newTeacher.name, school: newTeacher.school, role: userType } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка регистрации учителя' });
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
      levelId: levelId,
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
