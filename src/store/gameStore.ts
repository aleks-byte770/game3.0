import { create } from 'zustand'
import type { Level } from '../types/index'

interface GameState {
  levels: Level[]
  currentGrade: number | null
  currentLevel: Level | null
  setLevels: (levels: Level[]) => void
  setCurrentGrade: (grade: number) => void
  setCurrentLevel: (level: Level) => void
  getLevelsByGrade: (grade: number) => Level[]
}

// Дефолтные уровни для каждого класса
const defaultLevels: Level[] = [
  {
    id: '1-1',
    title: 'Деньги и их назначение',
    description: 'Узнайте, для чего нужны деньги',
    grade: 1,
    questions: [
      {
        id: 'q1',
        text: 'Для чего нужны деньги?',
        choices: ['Для игр', 'Для покупки товаров', 'Для украшения', 'Для коллекции'],
        correctIndex: 1,
        explanation: 'Деньги нужны для обмена на товары и услуги.',
      },
    ],
    reward: { coinsPerCorrect: 10, pointsPerCorrect: 10 },
  },
  // ... остальные уровни будут добавлены после загрузки с API
]

export const useGameStore = create<GameState>((set, get) => ({
  levels: defaultLevels,
  currentGrade: null,
  currentLevel: null,
  setLevels: (levels) => set({ levels }),
  setCurrentGrade: (grade) => set({ currentGrade: grade }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  getLevelsByGrade: (grade) => {
    const { levels } = get()
    return levels.filter((level) => level.grade === grade)
  },
}))
