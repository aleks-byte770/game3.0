import React, { useState, FC, ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import * as api from '@api/endpoints'

export const LoginForm: FC = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'student' | 'teacher'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response =
        userType === 'student'
          ? await api.studentLogin(email, password)
          : await api.teacherLogin(email, password)

      const { user, token } = (response as any).data
      setUser(user)
      setToken(token)

      navigate(userType === 'student' ? '/student' : '/teacher')
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>

        <p className="auth-link">
          Нет аккаунта?{' '}
          <a href="/register">
            {userType === 'student' ? 'Зарегистрироваться' : 'Регистрация учителя'}
          </a>
        </p>
      </div>
    </div>
  )
}
