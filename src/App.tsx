import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home/Home';
import Room from './pages/room/Room';
import Game from './pages/game/Game';
import GameX2 from './pages/gamex2/GameX2';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:uuid" element={<Room />} />
        <Route path="/game/:uuid" element={<Game />} />
        <Route path="/gameX2/:uuid" element={<GameX2 />} />
      </Routes>
    </Router>
  );
};

export default App;
