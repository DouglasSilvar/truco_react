import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home/Home';
import Room from './pages/room/Room';
import Game from './pages/game/Game';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:uuid" element={<Room />} />
        <Route path="/game/:uuid" element={<Game />} />
      </Routes>
    </Router>
  );
};

export default App;
