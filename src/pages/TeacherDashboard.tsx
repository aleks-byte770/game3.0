import React, { useEffect, useState, FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import * as api from '@api/endpoints'

const AdminTeacherRegistrationForm: FC = () => {
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.teacherRegister(formData.name, formData.username, formData.password);
      setMessage(`Учитель "${formData.name}" успешно зарегистрирован!`);
      setFormData({ name: '', username: '', password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container" style={{ marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
      <h3>Регистрация нового учителя</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="teacher-name">ФИО</label>
          <input id="teacher-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Иванова Мария Петровна" required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="teacher-username">Логин</label>
          <input id="teacher-username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="m_ivanova" required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="teacher-password">Пароль</label>
          <input id="teacher-password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Надежный пароль" required disabled={loading} />
        </div>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>{message}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрировать учителя'}
        </button>
      </form>
    </div>
  );
};

const AdminStudentRegistrationForm: FC = () => {
  const [formData, setFormData] = useState({ name: '', grade: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.adminAddStudent(formData.name, parseInt(formData.grade));
      setMessage(`Ученик "${formData.name}" успешно добавлен!`);
      setFormData({ name: '', grade: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка добавления ученика');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h3>Добавление нового ученика</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="student-name">ФИО</label>
          <input id="student-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Петров Иван" required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="student-grade">Класс</label>
          <input id="student-grade" type="number" name="grade" value={formData.grade} onChange={handleChange} placeholder="Например, 5" required min="1" max="11" disabled={loading} />
        </div>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>{message}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Добавление...' : 'Добавить ученика'}
        </button>
      </form>
    </div>
  );
};

export const TeacherDashboard: FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state: any) => state.user)
  const logout = useAuthStore((state: any) => state.logout)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'students' | 'results' | 'groups' | 'admin'>('students')

  useEffect(() => {
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      navigate('/login')
      return
    }
    if (user.role === 'admin') {
      setActiveTab('admin')
    }
    loadStudents()
  }, [user, navigate])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const response = await api.getStudents()
      setStudents(response.data)
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
          <h1>{user?.role === 'admin' ? 'Панель администратора' : 'Панель учителя'}</h1>
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
        {user?.role === 'admin' && (
          <button
            className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Администрирование
          </button>
        )}
      </nav>

      <main className="teacher-main">
        {activeTab === 'students' && (
          <section className="students-section">
            <div className="section-header">
              <h2>Управление учениками</h2>
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

        {activeTab === 'admin' && user?.role === 'admin' && (
          <section className="admin-section">
            <AdminTeacherRegistrationForm />
            <AdminStudentRegistrationForm />
          </section>
        )}
      </main>
    </div>
  )
}
