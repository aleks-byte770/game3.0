export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  createdAt: string
}

export interface Student extends User {
  grade?: number
  score: number
  coins: number
  lastPlayed?: string
  achievements: string[]
}

export interface Teacher extends User {
  school: string
  students: string[]
  groups: string[]
}

export interface Level {
  id: string
  title: string
  description: string
  grade: number
  questions: Question[]
  reward: {
    coinsPerCorrect: number
    pointsPerCorrect: number
  }
}

export interface Question {
  id: string
  text: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export interface Result {
  id: string
  studentId: string
  levelId: string
  grade: number
  correctAnswers: number
  totalQuestions: number
  coinsEarned: number
  pointsEarned: number
  completedAt: string
}

export interface AuthResponse {
  token: string
  user: User
}
