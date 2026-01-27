import React, { FC, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGameStore } from '@store/gameStore'
import { useAuthStore } from '@store/authStore'
import * as api from '@api/endpoints'
import { Question, Level } from '@types'

export const GameLevelPage: FC = () => {
  const navigate = useNavigate()
  const { levelId } = useParams<{ levelId: string }>()

  // Получаем нужные функции и данные из хранилищ
  const { levels, setCurrentLevel, currentLevel } = useGameStore((state) => ({
    levels: state.levels,
    currentLevel: state.currentLevel,
    setCurrentLevel: state.setCurrentLevel,
  }))
  const user = useAuthStore((state) => state.user)

  // Локальное состояние для логики квиза
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)
  const [startTime] = useState(Date.now())

  // Эффект для поиска и установки текущего уровня, если он не установлен (например, при перезагрузке страницы)
  useEffect(() => {
    if (!currentLevel || currentLevel.id !== levelId) {
      const foundLevel = levels.find((l) => l.id === levelId)
      if (foundLevel) {
        setCurrentLevel(foundLevel)
      }
    }
  }, [levelId, levels, currentLevel, setCurrentLevel])

  if (!currentLevel) {
    return (
      <div className="game-level-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Уровень загружается...</h2>
        <p>Если ничего не происходит, вернитесь и выберите уровень снова.</p>
        <button className="btn-back" onClick={() => navigate(-1)}>Назад</button>
      </div>
    )
  }

  const question: Question = currentLevel.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === currentLevel.questions.length - 1

  const handleAnswer = (choiceIndex: number) => {
    if (isAnswered) return
    setSelectedChoice(choiceIndex)
    setIsAnswered(true)

    if (choiceIndex === question.correctIndex) {
      setScore(score + 1)
      setCoins(coins + (currentLevel.reward.coinsPerCorrect || 10))
    }
  }

  const handleNext = async () => {
    if (isLastQuestion) {
      // Конец игры, сохраняем результат
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      // Состояние score уже обновлено после ответа на последний вопрос
      const finalScore = score;

      try {
        await api.saveResult({
          studentName: user?.name || 'Аноним',
          levelId: currentLevel.id,
          grade: currentLevel.grade,
          correctAnswers: finalScore,
          totalQuestions: currentLevel.questions.length,
          timeTaken: timeTaken,
        });
        alert(`Тест завершен! Правильных ответов: ${finalScore} из ${currentLevel.questions.length}`);
        navigate(`/game/grade/${currentLevel.grade}`);
      } catch (err: any) {
        console.error("Ошибка сохранения результатов:", err);
        let errorMessage = "Не удалось сохранить результаты.";
        if (err.response?.status === 404) {
          errorMessage += " (Ошибка 404: API не найдено. Проверьте, что бэкенд запущен и доступен.)";
        }
        alert(errorMessage);
        navigate(`/game/grade/${currentLevel.grade}`);
      }
    } else {
      // Следующий вопрос
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedChoice(null)
      setIsAnswered(false)
    }
  }

  return (
    <div className="game-level-container">
      <header className="game-level-header">
        <h1>{currentLevel.title}</h1>
        <div className="progress-bar">
          <div
            className="progress-bar-inner"
            style={{ width: `${((currentQuestionIndex + 1) / currentLevel.questions.length) * 100}%` }}
          ></div>
        </div>
      </header>

      <main className="question-container">
        <h2>Вопрос {currentQuestionIndex + 1}/{currentLevel.questions.length}</h2>
        <p className="question-text">{question.text}</p>

        <div className="choices-grid">
          {question.choices.map((choice, index) => {
            let buttonClass = 'choice-btn'
            if (isAnswered) {
              if (index === question.correctIndex) buttonClass += ' correct'
              else if (index === selectedChoice) buttonClass += ' incorrect'
            }
            return (
              <button key={index} className={buttonClass} onClick={() => handleAnswer(index)} disabled={isAnswered}>
                {choice}
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <div className="explanation-box">
            <p>{question.explanation}</p>
            <button onClick={handleNext} className="btn-next">
              {isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}