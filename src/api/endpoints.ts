import api from './client'

// Студенты
export const studentLogin = (name: string, grade: number) =>
  api.post('/students/login', { name, grade })

export const getStudentProfile = () => api.get('/students/profile')
export const updateStudentProfile = (data: any) => api.put('/students/profile', data)

// Уровни
export const getAllLevels = () => api.get('/levels')
export const getLevelsByGrade = (grade: number) => api.get(`/levels/grade/${grade}`)

// Результаты тестов
export const saveResult = (data: any) => api.post('/results', data)
export const getStudentResults = () => api.get('/results/student')
export const getStudentResultsByGrade = (grade: number) =>
  api.get(`/results/student/grade/${grade}`)

// Учителя
export const teacherLogin = (email: string, password: string) =>
  api.post('/teachers/login', { email, password })

export const getTeacherProfile = () => api.get('/teachers/profile')
export const getStudents = () => api.get('/teachers/students')
export const getTeacherStudentResults = (studentId: string) =>
  api.get(`/teachers/students/${studentId}/results`)
export const createGroup = (name: string) => api.post('/teachers/groups', { name })
export const getGroups = () => api.get('/teachers/groups')

// Админ
export const getLogs = () => api.get('/admin/logs')
export const getStats = () => api.get('/admin/stats')
export const deleteUser = (userId: string) => api.delete(`/admin/users/${userId}`)
