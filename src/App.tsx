import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { LoginForm } from '@components/LoginForm'
import { RegisterForm } from '@components/RegisterForm'
import { StudentHome } from '@pages/StudentHome'
import { TeacherDashboard } from '@pages/TeacherDashboard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentHome, GameGradePage } from './pages';


function App() {
  return (
    <Router>
      <Routes>
        {/* Ваши существующие маршруты */}
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/login" element={...} /> 
        
        {/* 👇 ДОБАВЬТЕ ЭТОТ МАРШРУТ 👇 */}
        <Route path="/game/grade/:grade" element={<GameGradePage />} />

        {/* Другие маршруты... */}
      </Routes>
    </Router>
  );
}

export default App;

import './styles/index.css'

function App() {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated)
  const user = useAuthStore((state: any) => state.user)

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Student routes */}
        <Route
          path="/student"
          element={isAuthenticated && user?.role === 'student' ? <StudentHome /> : <Navigate to="/login" />}
        />

        {/* Teacher routes */}
        <Route
          path="/teacher"
          element={
            isAuthenticated && user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? user?.role === 'student'
                ? <Navigate to="/student" />
                : <Navigate to="/teacher" />
              : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
