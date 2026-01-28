import { create } from 'zustand'
import type { Level, Result } from '../types/index'
import { endpoints } from '@api'
import { grade1Levels } from '../pages/grade1'
import { grade2Levels } from '../pages/grade2'
import { grade3Levels } from '../pages/grade3'
import { grade4Levels } from '../pages/grade4'
import { grade5Levels } from '../pages/grade5'
import { grade6Levels } from '../pages/grade6'
import { grade7Levels } from '../pages/grade7'
import { grade8Levels } from '../pages/grade8'
import { grade9Levels } from '../pages/grade9'
import { grade10Levels } from '../pages/grade10'
import { grade11Levels } from '../pages/grade11'

interface GameState {
  levels: Level[]
  currentGrade: number | null
  currentLevel: Level | null
  results: Result[]
  setLevels: (levels: Level[]) => void
  setCurrentGrade: (grade: number | string) => void
  setCurrentLevel: (level: Level) => void
  getLevelsByGrade: (grade: number | string) => Level[]
  fetchStudentResults: () => Promise<void>
}

// Дефолтные уровни для каждого класса
const defaultLevels: Level[] = [
  ...grade1Levels,
  ...grade2Levels,
  ...grade3Levels,
  ...grade4Levels,
  ...grade5Levels,
  ...grade6Levels,
  ...grade7Levels,
  ...grade8Levels,
  ...grade9Levels,
  ...grade10Levels,
  ...grade11Levels,
]

export const useGameStore = create<GameState>((set, get) => ({
  levels: defaultLevels,
  currentGrade: null,
  currentLevel: null,
  results: [],
  setLevels: (levels) => set({ levels }),
  setCurrentGrade: (grade) => set({ currentGrade: Number(grade) }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  getLevelsByGrade: (grade) => {
    const { levels } = get()
    const targetGrade = Number(grade)
    return levels.filter((level) => level.grade === targetGrade)
  },
  fetchStudentResults: async () => {
    try {
      const response = await endpoints.getStudentResults()
      set({ results: response.data })
    } catch (error) {
      console.error('Ошибка загрузки результатов студента:', error)
      set({ results: [] })
    }
  },
}))
