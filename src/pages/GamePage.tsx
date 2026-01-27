import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '@store/gameStore'
import { useAuthStore } from '@store/authStore'
import * as api from '@api/endpoints'

export const GamePage = () => {
  const { grade } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state: any) => state.user)
  const { getLevelsByGrade, currentLevel, setCurrentLevel } = useGameStore()
  
  const [levels, setLevels] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (grade) {
      const gradeLevels = getLevelsByGrade(parseInt(grade))
      setLevels(gradeLevels)
    }
  }, [grade, getLevelsByGrade])

  const handleLevelClick = (level: any) => {
    setCurrentLevel(level)
    setCurrentQuestionIndex(0)
    setScore(0)
    setShowResult(false)
  }

  const handleAnswer = async (choiceIndex: number) => {
    if (!currentLevel) return

    const question = currentLevel.questions[currentQuestionIndex]
    if (choiceIndex === question.correctIndex) {
      setScore(score + 1)
    }

    if (currentQuestionIndex + 1 < currentLevel.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowResult(true)
      // Сохранение результата
      try {
        await api.saveResult({
          levelId: currentLevel.id, // Используем ID уровня как число или строку
          grade: parseInt(grade || '0'),
          correctAnswers: score + (choiceIndex === question.correctIndex ? 1 : 0),
          totalQuestions: currentLevel.questions.length,
          coinsEarned: (score + (choiceIndex === question.correctIndex ? 1 : 0)) * currentLevel.reward.coinsPerCorrect
        })
      } catch (e) {
        console.error('Ошибка сохранения результата', e)
      }
    }
  }

  if (!currentLevel) {
    return (
      <div className="game-container">
        <button className="btn-back" onClick={() => navigate('/student')}>← Назад</button>
        <h1>Уровни для {grade} класса</h1>
        <div className="levels-grid">
          {levels.length > 0 ? (
            levels.map((level) => (
              <div key={level.id} className="level-card" onClick={() => handleLevelClick(level)}>
                <h3>{level.title}</h3>
                <p>{level.description}</p>
                <div className="level-reward">
                  💰 {level.reward.coinsPerCorrect} монет за ответ
                </div>
              </div>
            ))
          ) : (
            <p>Для этого класса пока нет доступных уровней.</p>
          )}
        </div>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="game-container result-screen">
        <h2>Уровень пройден!</h2>
        <p>Ваш результат: {score} из {currentLevel.questions.length}</p>
        <button className="btn btn-primary" onClick={() => setCurrentLevel(null)}>
          К списку уровней
        </button>
      </div>
    )
  }

  const question = currentLevel.questions[currentQuestionIndex]

  return (
    <div className="game-container">
      <div className="game-header">
        <button onClick={() => setCurrentLevel(null)}>Выход</button>
        <span>Вопрос {currentQuestionIndex + 1} / {currentLevel.questions.length}</span>
      </div>
      
      <div className="question-card">
        <h2>{question.text}</h2>
        <div className="choices-grid">
          {question.choices.map((choice: string, index: number) => (
            <button 
              key={index} 
              className="choice-btn"
              onClick={() => handleAnswer(index)}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}