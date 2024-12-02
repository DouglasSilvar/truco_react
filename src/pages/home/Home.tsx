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
  game: string | null;
}

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRoomPopup, setShowCreateRoomPopup] = useState<boolean>(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [playerUuid, setPlayerUuid] = useState<string | null>(null);
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [usePassword, setUsePassword] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [incorrectPasswordPopup, setIncorrectPasswordPopup] = useState<boolean>(false);
  const [showRoomNameWarning, setShowRoomNameWarning] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const updatePlayerUuid = (uuid: string) => {
    setPlayerUuid(uuid);
  };

  useEffect(() => {
    const getRooms = async () => {
      try {
        const data = await fetchRooms(currentPage);
        setRooms(data.rooms);
        setTotalPages(data.meta.total_pages);
      } catch (error) {
        setError('Erro ao carregar as salas.');
      } finally {
        setLoading(false);
      }
    };

    getRooms();
  }, [currentPage]);


  useEffect(() => {
    const storedPlayerUuid = localStorage.getItem('user_uuid');
    if (storedPlayerUuid && !playerUuid) {
      setPlayerUuid(storedPlayerUuid);
    }
  }, [playerUuid]);

  const handleCreateRoomClick = () => {
    const userName = localStorage.getItem('user_name');
    const userUuid = localStorage.getItem('user_uuid');

    if (!userName || !userUuid) {
      alert("É necessário criar um usuário antes de criar uma sala.");
    } else {
      setShowCreateRoomPopup(true);
    }
  };

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

  const handleJoinRoom = async (room: Room) => {
    if (playerUuid) {
      if (room.protected) {
        setSelectedRoom(room);
        setShowPasswordPopup(true);
      } else {
        try {
          const result = await joinRoom(room.uuid, playerUuid);
          if (result.status === 403) {
            setIncorrectPasswordPopup(true);
          } 
          else {
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
    setUsePassword(false);
    setPassword('');
    setShowRoomNameWarning(false);
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
        <button className="create-room-button" onClick={handleCreateRoomClick}>
          Criar Sala
        </button>
        <div className="rooms-container">
          {rooms.map((room) => {
            const isGameActive = !!room.game;
            const isRoomFull = room.players_count === 4 && !room.game;
            return (
              <div key={room.uuid} className="room-card">
                <h3>
                  {room.name} {room.protected && <FontAwesomeIcon icon={faLock} className="lock-icon" />}
                </h3>
                <p>
                  <strong>Dono:</strong> {room.owner.name}
                </p>
                <p>
                  <strong>Jogadores:</strong> {room.players_count}
                </p>
                {isGameActive ? (
                  <button
                    className="enter-room-button"
                    onClick={() => navigate(`/game/${room.game}`)}
                  >
                    Ver partida
                  </button>
                ) : isRoomFull ? (
                  <button className="enter-room-button" disabled>
                    Sala cheia
                  </button>
                ) : (
                  <button
                    className="enter-room-button"
                    onClick={() => handleJoinRoom(room)}
                  >
                    Entrar
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="pagination">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Próxima
          </button>
        </div>
      </div>

      {showCreateRoomPopup && (
        <div className="popup">
          <button className="close-button" onClick={handleCloseCreateRoomPopup}>X</button>
          <p>Digite o nome da sala:</p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowRoomNameWarning(e.target.value.length === 20);
            }}
            maxLength={20}
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

      {showRoomNameWarning && <p className="warning-text-home">O nome da sala está limitado a 20 caracteres.</p>}
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
