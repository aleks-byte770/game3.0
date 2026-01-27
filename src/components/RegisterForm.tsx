import React, { useState, FC, ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import * as api from '@api/endpoints'

export const RegisterForm: FC = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть минимум 6 символов')
      return
    }

    setLoading(true)

    try {
      // Регистрация теперь только для учителей
      const response = await api.teacherRegister(formData.name, formData.email, formData.password)

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
        setError(err.response?.data?.message || 'Ошибка регистрации')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Финансовый Геймер</h1>
        <p className="subtitle">Регистрация для Учителя</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">ФИО</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Иван Петров"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Повторите пароль</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-link">
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>
    </div>
  )
}
