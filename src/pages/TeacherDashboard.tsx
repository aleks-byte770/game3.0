import React, { useEffect, useState, FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import * as api from '@api/endpoints'

export const TeacherDashboard: FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state: any) => state.user)
  const logout = useAuthStore((state: any) => state.logout)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'students' | 'results' | 'groups'>('students')

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login')
      return
    }
    loadResults()
  }, [user, navigate])

  const loadResults = async () => {
    try {
      setLoading(true)
      const response = await api.getTeacherResults()
      setResults(response.data)
    } catch (error) {
      console.error('Ошибка загрузки учеников:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return 'N/A'
    return new Date(seconds * 1000).toISOString().slice(14, 19) // MM:SS
  }
  return (
    <div className="teacher-container">
      <header className="teacher-header">
        <div className="header-content">
          <h1>Панель учителя</h1>
          <div className="user-info">
            <span>Добро пожаловать, {user?.name}!</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Выход
            </button>
          </div>
        </div>
      </header>

      <nav className="teacher-nav">
        <button
          className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Ученики
        </button>
        <button
          className={`nav-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Результаты
        </button>
        <button
          className={`nav-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Группы
        </button>
      </nav>

      <main className="teacher-main">
        {activeTab === 'results' && (
          <section className="results-section">
            <div className="section-header">
              <h2>Результаты учеников</h2>
            </div>

            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <p>Пока нет результатов. Результаты появятся здесь, когда ученики пройдут тесты.</p>
              </div>
            ) : (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>ФИО ученика</th>
                    <th>Класс</th>
                    <th>Уровень</th>
                    <th>Результат</th>
                    <th>Время выполнения</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result._id}>
                      <td>{result.studentName}</td>
                      <td>{result.grade}</td>
                      <td>{result.levelId}</td>
                      <td>{`${result.correctAnswers} / ${result.totalQuestions} (${result.percentage}%)`}</td>
                      <td>{formatTime(result.timeTaken)}</td>
                      <td>{new Date(result.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'groups' && (
          <section className="groups-section">
            <h2>Управление группами</h2>
            <button className="btn btn-primary">+ Создать группу</button>
            <div className="empty-state">
              <p>Нет групп. Создавайте группы для организации учеников по классам.</p>
            </div>
          </section>
        )}

        {activeTab === 'students' && (
          <section>
             <div className="empty-state">
                <p>Раздел "Ученики" больше не используется.</p>
                <p>Все данные о прохождении тестов теперь находятся во вкладке "Результаты".</p>
              </div>
          </section>
        )}
      </main>
    </div>
  )
}
