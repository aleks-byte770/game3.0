import api from './client'

export const studentLogin = (name: string, grade: number) =>
  api.post('/students/login', { name, grade })

export const teacherLogin = (username: string, password: string) =>
  api.post('/teachers/login', { username, password })

export const getStudentProfile = () =>
  api.get('/students/profile')

export const getTeacherStudents = () =>
  api.get('/teachers/students')

export const saveResult = (data: any) =>
  api.post('/results', data)