import { create } from 'zustand'
import type { Level } from '../types/index'
import { grade1Levels } from './levels/grade1'
import { grade2Levels } from './levels/grade2'
import { grade3Levels } from './levels/grade3'
import { grade4Levels } from './levels/grade4'
import { grade5Levels } from './levels/grade5'
import { grade6Levels } from './levels/grade6'
import { grade7Levels } from './levels/grade7'
import { grade8Levels } from './levels/grade8'
import { grade9Levels } from './levels/grade9'
import { grade10Levels } from './levels/grade10'
import { grade11Levels } from './levels/grade11'

interface GameState {
  levels: Level[]
  currentGrade: number | null
  currentLevel: Level | null
  setLevels: (levels: Level[]) => void
  setCurrentGrade: (grade: number) => void
  setCurrentLevel: (level: Level) => void
  getLevelsByGrade: (grade: number | string) => Level[]
}

// Объединяем все уровни из файлов
const allLevels: Level[] = [
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
  levels: allLevels,
  currentGrade: null,
  currentLevel: null,
  setLevels: (levels) => set({ levels }),
  setCurrentGrade: (grade) => set({ currentGrade: grade }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  getLevelsByGrade: (grade) => {
    const gradeNum = Number(grade)
    const { levels } = get()
    return levels.filter((level) => level.grade === gradeNum)
  },
}))
