import React, { useEffect, useState } from 'react';
import Bar from '../../components/bar/Bar';
import './Home.css';
import { fetchRooms, createRoom, joinRoom } from '../../services/roomService';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

interface Room {
  uuid: string;
  name: string;
  players_count: number;
  owner: {
    name: string;
  };
  protected: boolean;
}

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRoomPopup, setShowCreateRoomPopup] = useState<boolean>(false); // Popup para criação de sala
  const [showPasswordPopup, setShowPasswordPopup] = useState<boolean>(false); // Popup para senha
  const [inputValue, setInputValue] = useState<string>('');
  const [playerUuid, setPlayerUuid] = useState<string | null>(null);
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>(''); // Senha do popup
  const [usePassword, setUsePassword] = useState<boolean>(false); // Checkbox para usar senha na criação
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null); // Sala protegida selecionada
  const [incorrectPasswordPopup, setIncorrectPasswordPopup] = useState<boolean>(false);

  const updatePlayerUuid = (uuid: string) => {
    setPlayerUuid(uuid);
  };

  useEffect(() => {
    const getRooms = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data.rooms);
      } catch (error) {
        setError('Erro ao carregar as salas.');
      } finally {
        setLoading(false);
      }
    };

    getRooms();

    const storedPlayerUuid = localStorage.getItem('user_uuid');
    setPlayerUuid(storedPlayerUuid);
  }, []);

  useEffect(() => {
    const storedPlayerUuid = localStorage.getItem('user_uuid');
    if (storedPlayerUuid && !playerUuid) {
      setPlayerUuid(storedPlayerUuid);
    }
  }, [playerUuid]);

  // Função para criar uma sala
  const handleCreateRoom = async () => {
    if (inputValue.trim() && inputValue.length <= 36 && playerUuid) {
      try {
        const data = await createRoom(inputValue, playerUuid, usePassword ? password : undefined);
        setShowCreateRoomPopup(false);
        setInputValue('');
        setPassword('');
        navigate(`/room/${data.uuid}`);
      } catch (error) {
        console.error('Erro ao criar a sala:', error);
      }
    }
  };

  // Função para lidar com a entrada na sala
  const handleJoinRoom = async (room: Room) => {
    if (playerUuid) {
      if (room.protected) {
        // Sala protegida, exibir popup para inserir senha
        setSelectedRoom(room);
        setShowPasswordPopup(true);
      } else {
        // Sala não protegida, entrar diretamente
        try {
          const result = await joinRoom(room.uuid, playerUuid);
          if (result.status === 403) {
            setIncorrectPasswordPopup(true);
          } else {
            navigate(`/room/${room.uuid}`);
          }
        } catch (error) {
          console.error('Erro ao entrar na sala:', error);
        }
      }
    }
  };
  
  const handleSubmitPassword = async () => {
    if (selectedRoom && playerUuid) {
      try {
        const result = await joinRoom(selectedRoom.uuid, playerUuid, password);
        if (result.status === 403) {
          setIncorrectPasswordPopup(true);
        } else {
          setShowPasswordPopup(false);
          setPassword('');
          navigate(`/room/${selectedRoom.uuid}`);
        }
      } catch (error) {
        console.error('Erro ao entrar na sala protegida:', error);
      }
    }
  };
  
  

  const handleCloseIncorrectPasswordPopup = () => {
    setIncorrectPasswordPopup(false);
  };

  const handleClosePasswordPopup = () => {
    setShowPasswordPopup(false);
    setSelectedRoom(null);
    setPassword('');
  };

  const handleCloseCreateRoomPopup = () => {
    setShowCreateRoomPopup(false);
    setInputValue('');
    setPassword('');
  };

  if (loading) {
    return <div className="home">Carregando...</div>;
  }

  if (error) {
    return <div className="home">{error}</div>;
  }

  return (
    <div className="home">
      <Bar updatePlayerUuid={updatePlayerUuid} />
      <div className="content">
        <button className="create-room-button" onClick={() => setShowCreateRoomPopup(true)}>
          Criar Sala
        </button>
        <div className="rooms-container">
          {rooms.map((room) => (
            <div key={room.uuid} className="room-card">
              <h3>{room.name} {room.protected && <FontAwesomeIcon icon={faLock} className="lock-icon" />}</h3>
              <p><strong>Dono:</strong> {room.owner.name}</p>
              <p><strong>Jogadores:</strong> {room.players_count}</p>
              {/* Botão Entrar */}
              <button
                className="enter-room-button"
                onClick={() => handleJoinRoom(room)}
              >
                Entrar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popup de criação de sala */}
      {showCreateRoomPopup && (
        <div className="popup">
          <button className="close-button" onClick={handleCloseCreateRoomPopup}>X</button>
          <p>Digite o nome da sala:</p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={36}
            placeholder="Nome da sala"
          />
          <div className="password-container">
            <label>
              <input
                type="checkbox"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
              />
              Usar senha
            </label>
            {usePassword && (
              <input
                type="number"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 4) {
                    setPassword(value);
                  }
                }}
                placeholder="Senha (4 dígitos)"
                min="0000"
                max="9999"
              />
            )}
          </div>
          <button onClick={handleCreateRoom}>Criar Sala</button>
        </div>
      )}

      {/* Popup para inserir senha em salas protegidas */}
      {showPasswordPopup && selectedRoom && (
        <div className="popup">
          <button className="close-button" onClick={handleClosePasswordPopup}>X</button>
          <p>Senha da sala <strong>{selectedRoom.name}</strong>:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
          />
          <button onClick={handleSubmitPassword}>Entrar</button>
        </div>
      )}
      {incorrectPasswordPopup && (
        <div className="popup">
          <button className="close-button" onClick={handleCloseIncorrectPasswordPopup}>X</button>
          <p>Senha incorreta, tente novamente.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
