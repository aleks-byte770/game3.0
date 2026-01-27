import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './User';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, password, role } = req.body;

    // Проверка существования пользователя
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя
    const user = await User.create({
      name,
      username,
      password: hashedPassword,
      role, // 'student' или 'teacher'
    });

    if (user) {
      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
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
    // Если это ошибка дубликата (уже есть такой username), но findOne ее пропустил
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Этот логин уже занят.' });
    }
    res.status(500).json({ message: 'Внутренняя ошибка сервера.', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    // Специальный вход для администратора (moris)
    if (username === 'moris' && password === 'moris') {
      let admin = await User.findOne({ username: 'moris' });
      if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('moris', salt);
        admin = await User.create({
          name: 'Администратор',
          username: 'moris',
          password: hashedPassword,
          role: 'admin',
        });
      }
      
      return res.json({
        user: {
          id: admin._id,
          name: admin.name,
          username: admin.username,
          role: 'admin',
        },
        token: generateToken(admin._id.toString(), 'admin'),
      });
    }

    // Поиск пользователя
    const user = await User.findOne({ username });

    // Проверка пароля и роли (чтобы ученик не вошел как учитель)
    if (user && (await bcrypt.compare(password, user.password))) {
      if (role && user.role !== role) {
        return res.status(403).json({ message: `Этот аккаунт не является аккаунтом ${role === 'student' ? 'ученика' : 'учителя'}` });
      }

      res.json({
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          grade: user.grade,
          coins: user.coins
        },
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(401).json({ message: 'Неверный логин или пароль' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
};