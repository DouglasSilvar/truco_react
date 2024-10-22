import React, { useEffect, useState } from 'react';
import './Bar.css';
import { createPlayer } from '../../services/playerService';

const Bar: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [showWarning, setShowWarning] = useState<boolean>(false);

  useEffect(() => {
    const storedUserName = localStorage.getItem('user_name');
    if (!storedUserName) {
      setShowPopup(true);
    } else {
      setUserName(storedUserName);
    }
  }, []);

  const handleCreateUser = async () => {
    if (inputValue.trim() && inputValue.length <= 36) {
      try {
        const response = await createPlayer(inputValue);
        if (response.status === 201) {
          const data = await response.json();
          localStorage.setItem('user_name', data.name);
          localStorage.setItem('user_uuid', data.uuid);
          setUserName(data.name);
          setShowPopup(false);
        } else {
          console.error('Failed to create user: Unexpected response status', response.status);
        }
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowWarning(true);
  };

  return (
    <div className="bar">
      <h1 className="title">Truco</h1>
      {userName && <span className="user-name">Olá, {userName}</span>}
      {showPopup && (
        <div className="popup">
          <button className="close-button" onClick={handleClosePopup}>X</button>
          <p>Crie o nome do seu usuário.</p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={36}
          />
          <button onClick={handleCreateUser}>Criar</button>
        </div>
      )}
      {showWarning && (
        <div className="warning-popup">
          <p>É necessário criar um usuário para entrar nas salas.</p>
          <button onClick={() => {
            setShowPopup(false);
            setShowWarning(false);
          }}>Ok</button>
        </div>
      )}
    </div>
  );
};

export default Bar;
