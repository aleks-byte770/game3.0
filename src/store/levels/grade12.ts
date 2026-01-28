import { Level } from '@types';

export const grade12Levels: Level[] = [
  // ================= 12 КЛАСС =================
  {
    id: '12-1',
    title: 'Тест сохранения результатов',
    description: 'Тестовый уровень для проверки сохранения в БД',
    grade: 12,
    questions: [
      { id: 'q12-1-1', text: 'Тестовый вопрос: 2 + 2 = ?', choices: ['3', '4', '5', '6'], correctIndex: 1, explanation: '2 + 2 = 4' },
    ],
    reward: { coinsPerCorrect: 10, pointsPerCorrect: 10 },
  },
];