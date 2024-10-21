import React from 'react';
import Bar from '../../components/bar/Bar';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <Bar />
      <div className="content">
        <p>Bem-vindo ao Truco Front!</p>
      </div>
    </div>
  );
};

export default Home;