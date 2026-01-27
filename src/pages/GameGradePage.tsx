import React, { FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '@store/gameStore'
import { Level } from '@types'

export const GameGradePage: FC = () => {
  const navigate = useNavigate()
  const { grade } = useParams<{ grade: string }>()
  const getLevelsByGrade = useGameStore((state) => state.getLevelsByGrade)

  if (!grade) {
    return <div>Класс не найден. <button onClick={() => navigate(-1)}>Назад</button></div>
  }

  const levels = getLevelsByGrade(grade)

  const handleLevelClick = (level: Level) => {
    // TODO: В будущем здесь будет переход на страницу с вопросами
    console.log('Переход на уровень:', level.id)
    alert(`Вы выбрали уровень: ${level.title}`)
    // navigate(`/game/level/${level.id}`)
  }

  return (
    <div className="game-grade-container">
      <header className="game-grade-header">
        <button className="btn-back" onClick={() => navigate('/student')}>
          &larr; Назад к классам
        </button>
        <h1>Уровни для {grade} класса</h1>
      </header>

      <main className="levels-grid">
        {levels.length > 0 ? (
          levels.map((level) => (
            <div key={level.id} className="level-card" onClick={() => handleLevelClick(level)}>
              <h3>{level.title}</h3>
              <p>{level.description}</p>
            </div>
          ))
        ) : (
          <p>Для этого класса пока нет уровней. Проверьте правильность загрузки.</p>
        )}
      </main>
    </div>
  )
}