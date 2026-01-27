import React, { FC } from 'react'
import { Navigate } from 'react-router-dom'

// Этот компонент устарел, так как мы используем RegisterForm для входа.
// Оставляем заглушку, чтобы не ломать старые импорты, если они где-то остались.
export const LoginForm: FC = () => {
  return <Navigate to="/login" />
}
