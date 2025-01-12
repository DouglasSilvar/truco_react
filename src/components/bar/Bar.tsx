import React, { useEffect, useState } from 'react';
import './Bar.css';
import { createPlayer, validatePlayer } from '../../services/playerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

interface BarProps {
  updatePlayerUuid: (uuid: string) => void;
}

const Bar: React.FC<BarProps> = ({ updatePlayerUuid }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showCharacterLimitWarning, setShowCharacterLimitWarning] = useState<boolean>(false);


  useEffect(() => {
    const storedUserName = localStorage.getItem('user_name');
    const storedUserUuid = localStorage.getItem('user_uuid');

    const validateStoredUser = async (name: string, uuid: string) => {
      try {
        const response = await validatePlayer(name, uuid);
        if (response.status !== 200) {
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_uuid');
          setShowPopup(true);
        }
      } catch (error) {
        console.error('Error validating user:', error);
        setShowPopup(true);
      }
    };

    if (storedUserName && storedUserUuid) {
      validateStoredUser(storedUserName, storedUserUuid);
      setUserName(storedUserName);
    } else {
      setShowPopup(true);
    }
  }, []);

  const handleCreateUser = async () => {
    if (inputValue.trim() && inputValue.length <= 10) {
      try {
        const response = await createPlayer(inputValue);
        if (response.status === 201) {
          const data = await response.json();
          localStorage.setItem('user_name', data.name);
          localStorage.setItem('user_uuid', data.player_id);
          setUserName(data.name);
          setShowPopup(false);
          updatePlayerUuid(data.uuid);
          window.location.reload();
        } else if (response.status === 422) {
          const errorData = await response.json();
          if (errorData.error.includes("Name has already been taken")) {
            setNameError("Nome já existe, escolha outro");
          }
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

  const handleLogout = () => {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_uuid');
    setUserName(null);
    updatePlayerUuid('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setNameError(null);
    setShowCharacterLimitWarning(value.length === 10); // Exibe o aviso de limite de caracteres
  };

  return (
    <div className="bar" translate="no">
      <h1 className="title">Truco</h1>
      {userName ? (
        <div className="user-info">
          <span className="user-name">Olá, {userName}</span>
          <FontAwesomeIcon
            icon={faSignOutAlt}
            size="lg"
            className="logout-icon"
            onClick={handleLogout}
          />
        </div>
      ) : (
        <div className="profile-icon" onClick={() => setShowPopup(true)}>
          <FontAwesomeIcon icon={faUserCircle} size="2x" />
        </div>
      )}
    {showPopup && (
      <div className="popup">
        <button className="close-button" onClick={handleClosePopup}>X</button>
        <p>Crie o nome do seu usuário.</p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          maxLength={10}
        />
        {showCharacterLimitWarning && <p className="warning-text">O nome de usuário está limitado a 10 caracteres.</p>}
        <button onClick={handleCreateUser}>Criar</button>
        {nameError && <p className="error-message">{nameError}</p>}
      </div>
      )}
    {showWarning && (
      <div className="warning-popup">
        <p>É necessário criar um usuário para entrar nas salas.</p>
        <button
          onClick={() => {
            setShowPopup(false);
            setShowWarning(false);
          }}
        >
          Ok
        </button>
      </div>
    )}
    </div>
  );
};

export default Bar;
