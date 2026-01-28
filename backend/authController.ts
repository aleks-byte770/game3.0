import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './User.js';
import dbConnect from './db.js';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { name, email, password, role, grade } = req.body;

    // Проверка существования пользователя
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // 'student' или 'teacher'
      grade: role === 'student' ? grade : undefined,
    });

    if (user) {
      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          grade: user.grade,
          coins: user.coins
        },
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(400).json({ message: 'Неверные данные пользователя' });
    }
  } catch (error: any) {
    console.error('REGISTRATION_ERROR_DETAILS:', error); // Более детальный лог для Vercel

    // Если это ошибка валидации Mongoose (например, не заполнено обязательное поле)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Ошибка валидации. Проверьте введенные данные.', details: error.errors });
    }
    // Если это ошибка дубликата (уже есть такой email), но findOne ее пропустил
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Этот email уже зарегистрирован.' });
    }
    res.status(500).json({ message: 'Внутренняя ошибка сервера.', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    await dbConnect();
    const { email, password, role } = req.body;

    // Поиск пользователя по email или по имени (ФИО)
    // ПРЕДУПРЕЖДЕНИЕ: Вход по ФИО не является безопасным, если ФИО не уникальны.
    const user = await User.findOne({
      $or: [{ email: email }, { name: email }],
    });

    // Проверка пароля и роли (чтобы ученик не вошел как учитель)
    if (user && (await bcrypt.compare(password, user.password))) {
      if (role && user.role !== role) {
        return res.status(403).json({ message: `Этот аккаунт не является аккаунтом ${role === 'student' ? 'ученика' : 'учителя'}` });
      }

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          grade: user.grade,
          coins: user.coins
        },
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(401).json({ message: 'Неверный email или пароль' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
};