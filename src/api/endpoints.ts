import api from './client'

// Уровни
export const getAllLevels = () => api.get('/levels')
export const getLevelsByGrade = (grade: number) => api.get(`/levels/grade/${grade}`)

// Результаты тестов
export const saveResult = (data: {
  studentName: string
  levelId: string
  grade: number
  correctAnswers: number
  totalQuestions: number
  timeTaken: number
}) => api.post('/results', data)

// Учителя
export const teacherRegister = (name: string, email: string, password: string, school?: string) =>
  api.post('/teachers/register', { name, email, password, school })

export const teacherLogin = (email: string, password: string) =>
  api.post('/teachers/login', { email, password })

export const getTeacherProfile = () => api.get('/teachers/profile')
export const getTeacherResults = () => api.get('/teachers/results')
export const createGroup = (name: string) => api.post('/teachers/groups', { name })
export const getGroups = () => api.get('/teachers/groups')

// Админ
export const getLogs = () => api.get('/admin/logs')
export const getStats = () => api.get('/admin/stats')
export const deleteUser = (userId: string) => api.delete(`/admin/users/${userId}`)
