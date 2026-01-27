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
  // 10 класс - Основы предпринимательства
  {
    id: '10-1',
    title: 'Введение в предпринимательство',
    description: 'Сущность предпринимательства, виды и формы бизнеса (по учебнику Дүйсенханова Е.)',
    grade: 10,
    questions: [
      {
        id: 'q10-1',
        text: 'Что является основной целью предпринимательской деятельности?',
        choices: ['Благотворительность', 'Получение прибыли', 'Уплата налогов', 'Создание рабочих мест'],
        correctIndex: 1,
        explanation: 'Предпринимательство — это инициативная деятельность, направленная на получение чистого дохода.',
      },
      {
        id: 'q10-2',
        text: 'Кто такой предприниматель?',
        choices: ['Наемный работник', 'Инвестор', 'Человек, готовый идти на риск ради прибыли', 'Государственный служащий'],
        correctIndex: 2,
        explanation: 'Предприниматель — это новатор, который использует новые технологии и возможности, принимая на себя риски.',
      },
      {
        id: 'q10-3',
        text: 'Что такое стартап?',
        choices: ['Крупная корпорация', 'Временная структура для поиска масштабируемой бизнес-модели', 'Государственное предприятие', 'Благотворительный фонд'],
        correctIndex: 1,
        explanation: 'Стартап — это компания с короткой историей операционной деятельности, создающая инновационный продукт.',
      }
    ],
    reward: { coinsPerCorrect: 15, pointsPerCorrect: 20 },
  },
  {
    id: '10-2',
    title: 'Дизайн-мышление',
    description: 'Генерация бизнес-идей и понимание клиента',
    grade: 10,
    questions: [
      {
        id: 'q10-4',
        text: 'Какой первый этап в методологии дизайн-мышления?',
        choices: ['Прототипирование', 'Тестирование', 'Эмпатия', 'Идеация'],
        correctIndex: 2,
        explanation: 'Эмпатия — это этап погружения в опыт пользователя для понимания его истинных потребностей.',
      }
    ],
    reward: { coinsPerCorrect: 15, pointsPerCorrect: 20 },
  },
  // 11 класс - Бизнес-планирование и управление
  {
    id: '11-1',
    title: 'Бизнес-моделирование',
    description: 'Построение бизнес-модели Canvas',
    grade: 11,
    questions: [
      {
        id: 'q11-1',
        text: 'Сколько блоков включает в себя шаблон бизнес-модели Остервальдера (Canvas)?',
        choices: ['5', '7', '9', '10'],
        correctIndex: 2,
        explanation: 'Бизнес-модель Canvas состоит из 9 ключевых блоков, описывающих деятельность компании.',
      },
      {
        id: 'q11-2',
        text: 'Что такое ценностное предложение?',
        choices: ['Цена товара', 'Совокупность преимуществ, которые компания предлагает клиенту', 'Рекламная кампания', 'Бренд компании'],
        correctIndex: 1,
        explanation: 'Ценностное предложение объясняет, почему клиент должен выбрать именно ваш продукт.',
      }
    ],
    reward: { coinsPerCorrect: 20, pointsPerCorrect: 30 },
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
