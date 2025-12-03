import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/games')
      .then(res => setGames(res.data))
      .catch(err => console.log(err));
  }, []);

  const fetchAchievements = (gameId) => {
    axios.get(`http://localhost:5000/api/achievements/${gameId}`)
      .then(res => setAchievements(res.data))
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h1>Games</h1>
      {games.map(game => (
        <div key={game._id}>
          <h2 onClick={() => fetchAchievements(game._id)}>{game.name}</h2>
        </div>
      ))}
      <h3>Achievements</h3>
      {achievements.map(a => (
        <div key={a._id}>{a.title}: {a.description}</div>
      ))}
    </div>
  );
};

export default GameList;
