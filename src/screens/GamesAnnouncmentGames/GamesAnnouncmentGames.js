// GamesAnnouncementScreen.jsx
import React, {useState} from 'react';
import './GamesAnnouncmentGames.css';

export const GamesAnnouncementScreen = () => {
    return (
      <div className="games-announcement-screen"> {/* Добавлен класс */}
        <h1>Анонсированные игры</h1>
        <GameSlider />
      </div>
    );
  };


export const GameSlider = () => {
  // Здесь можно добавить данные о играх
  const games = [
    {
        "date": "21 ОКТ.",
        "tournament": "Высшая лига",
        "teams": "ФК \"Гагарин\" vs ФК \"Северный\"",
        "link": "/game/1"
    },
    {
        "date": "28 ОКТ.",
        "tournament": "Высшая лига",
        "teams": "ФК \"Северный\" vs ФК \"Друзья\"",
        "link": "/game/2"
    },
    {
        "date": "05 НОЯБ.",
        "tournament": "Высшая лига",
        "teams": "ФК \"КВТ\" vs ФК \"Северный\"",
        "link": "/game/3"
    },
    {
        "date": "11 НОЯБ.",
        "tournament": "Высшая лига",
        "teams": "ФК \"Прогресс\" vs ФК \"Северный\"",
        "link": "/game/4"
    },
    {
        "date": "19 НОЯБ.",
        "tournament": "Высшая лига",
        "teams": "ФК \"Северный\" vs ФК \"Рессета\"",
        "link": "/game/5"
    },
    {
        "date": "25 НОЯБ.",
        "tournament": "Высшая лига",
        "teams": "ФК \"Гагарин\" vs ФК \"Северный\"",
        "link": "/game/6"
    },
    {
        "date": "17 ДЕК.",
        "tournament": "Высшая лига",
        "teams": "ФК \"ЧОП Элита\" vs ФК \"Северный\"",
        "link": "/game/7"
    },
    {
        "date": "24 ДЕК.",
        "tournament": "Высшая лига",
        "teams": "ФК \"Северный\" vs ФК\"Правый берег\"",
        "link": "/game/8"
    },
    {
        "date": "31 ДЕК.",
        "tournament": "Высшая лига",
        "teams": "ФК \"Автоэлектроника\" vs ФК \"Северный\"",
        "link": "/game/9"
    }
]

  const [startIndex, setStartIndex] = useState(0);
  const visibleCards = 3; // Количество видимых карточек
  const cardWidth = 250; // Предположим, что ширина карточки 250px
  const gap = 20; // Расстояние между карточками

  const handlePrev = () => {
    setStartIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const handleNext = () => {
    setStartIndex((prevIndex) => (prevIndex < games.length - visibleCards ? prevIndex + 1 : prevIndex));
  };

  const offset = -(startIndex * (cardWidth + gap));

  return (
    <div className="slider-container">
      <button onClick={handlePrev}>←</button>
      <div className="cards-wrapper">
        <div className="cards-container" style={{ transform: `translateX(${offset}px)` }}>
          {games.map((game, index) => (
            <GameCard key={index} game={game} />
          ))}
        </div>
      </div>
      <button onClick={handleNext}>→</button>
    </div>
  );
};


export const GameCard = ({ game }) => {
  return (
    <div className="game-card">
      <div className="game-date-time">
        {game.date} в {game.time}
      </div>
      <div className="game-tournament">{game.tournament}</div>
      <div className="game-teams">{game.teams}</div>
      <a href={game.link} className="game-link">Перейти к анонсу</a>
    </div>
  );
};
