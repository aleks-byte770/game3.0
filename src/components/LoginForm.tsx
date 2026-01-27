import React, { useState, FC, ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import * as api from '@api/endpoints'
import { Student } from '@types'

export const LoginForm: FC = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  // Состояние для всех типов пользователей
  const [name, setName] = useState('') // ФИО для ученика
  const [grade, setGrade] = useState<number>(5) // Класс для ученика
  const [email, setEmail] = useState('') // Email для учителя
  const [password, setPassword] = useState('') // Пароль для учителя

  const [userType, setUserType] = useState<'student' | 'teacher'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (userType === 'student') {
        // Для ученика нет запроса к API, просто сохраняем данные в store
        if (!name.trim() || !grade) {
          setError('Пожалуйста, введите ФИО и выберите класс.')
          setLoading(false)
          return
        }
        const studentData: Student = {
          name: name.trim(),
          grade: grade,
          role: 'student',
          // Добавляем недостающие поля для соответствия типу Student
          id: `student-${Date.now()}`,
          email: '', // У анонимного ученика нет email
          score: 0,
          coins: 0,
          achievements: [],
          createdAt: new Date().toISOString(),
        }
        // Устанавливаем фиктивный токен, чтобы сессия считалась активной и не сбрасывалась
        setToken('student-session-token')
        setUser(studentData)
        navigate('/student')
        return
      }

      // Логика для учителя остается прежней
      const response = await api.teacherLogin(email, password)

      const { user, token } = (response as any).data
      setUser(user)
      setToken(token)

      navigate('/teacher')
    } catch (err: any) {
      if (err.response?.status === 404) {
        const apiUrl = import.meta.env.VITE_API_URL
        let errorMessage = 'Ошибка 404: Бэкенд не найден. Проверьте VITE_API_URL в настройках Vercel.'
        if (apiUrl && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
          errorMessage += ' Адрес "localhost" не работает на Vercel. Укажите публичный URL вашего сервера.'
        }
        setError(errorMessage)
      } else {
        setError(err.response?.data?.message || 'Ошибка входа')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Финансовый Геймер</h1>
        <p className="subtitle">Вход</p>

        <div className="user-type-toggle">
          <button
            type="button"
            className={`toggle-btn ${userType === 'student' ? 'active' : ''}`}
            onClick={() => setUserType('student')}
          >
            Ученик
          </button>
          <button
            type="button"
            className={`toggle-btn ${userType === 'teacher' ? 'active' : ''}`}
            onClick={() => setUserType('teacher')}
          >
            Учитель
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {userType === 'student' ? (
            <>
              <div className="form-group">
                <label htmlFor="name">Ваше ФИО</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например, Иван Петров"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="grade">Ваш класс</label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  disabled={loading}
                >
                  {[...Array(11)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} класс
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Пароль</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Загрузка...' : 'Начать игру'}
          </button>
        </form>

        <p className="auth-link">
          {userType === 'teacher' && (
            <>
              Нет аккаунта? <a href="/register">Регистрация для учителя</a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
