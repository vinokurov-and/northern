import React from "react";

export const GameCard = ({ game }) => {
    return (
      <div className="game-card">
        <div className="game-date-time">
          {game.date}
        </div>
        <div className="game-tournament">{game.tournament}</div>
        <div className="game-teams">{game.home} {game.score} {game.guest}</div>
        {game.kflUrl && <a href={game.kflUrl} className="game-link">Перейти к анонсу</a>}
      </div>
    );
  };
  