import React, { useEffect, useState, FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import * as api from '@api/endpoints'

export const TeacherDashboard: FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state: any) => state.user)
  const logout = useAuthStore((state: any) => state.logout)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'students' | 'results' | 'groups'>('students')

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login')
      return
    }
    loadStudents()
  }, [user, navigate])

  const loadStudents = async () => {
    try {
      setLoading(true)
      // const data = await api.getStudents()
      // setStudents(data)
      setStudents([]) // Пока пусто, будет заполнено из API
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
        {activeTab === 'students' && (
          <section className="students-section">
            <div className="section-header">
              <h2>Управление учениками</h2>
              <button className="btn btn-primary">+ Добавить ученика</button>
            </div>

            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <p>Нет учеников. Начните добавлять учеников для отслеживания их результатов.</p>
              </div>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Класс</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.grade}</td>
                      <td>
                        <span className="badge badge-success">Активен</span>
                      </td>
                      <td>
                        <button className="btn-small">Результаты</button>
                        <button className="btn-small btn-danger">Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'results' && (
          <section className="results-section">
            <h2>Результаты тестирования</h2>
            <div className="empty-state">
              <p>Результаты появятся здесь, когда ученики пройдут тесты.</p>
            </div>
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
      </main>
    </div>
  )
}
