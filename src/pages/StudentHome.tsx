import React, { useEffect, useState, FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { useGameStore } from '@store/gameStore'
import * as api from '@api/endpoints'

export const StudentHome: FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state: any) => state.user)
  const logout = useAuthStore((state: any) => state.logout)
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login')
      return
    }
    loadGrades()
  }, [user, navigate])

  const loadGrades = async () => {
    try {
      setLoading(true)
      // Загружаем уровни для каждого класса (1-12)
      const gradeList = Array.from({ length: 12 }, (_, i) => i + 1)
      setGrades(gradeList)
    } catch (error) {
      console.error('Ошибка загрузки классов:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGradeClick = (grade: number) => {
    useGameStore.setState({ currentGrade: grade })
    navigate(`/game/grade/${grade}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="student-container">
      <header className="student-header">
        <div className="header-content">
          <h1>Финансовый Геймер</h1>
          <div className="user-info">
            <span>Привет, {user?.name}!</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Выход
            </button>
          </div>
        </div>
      </header>

      <main className="student-main">
        <section className="grades-section">
          <h2>Выберите класс</h2>
          <p className="description">
            Начните игру и проверьте свои знания в финансовой грамотности
          </p>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <div className="grades-grid">
              {grades.map((grade) => (
                <button
                  key={grade}
                  className="grade-card"
                  onClick={() => handleGradeClick(grade)}
                >
                  <div className="grade-number">{grade}</div>
                  <div className="grade-label">класс</div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="stats-section">
          <h3>Ваша статистика</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Завершено уровней</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Монет заработано</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Достижений</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
