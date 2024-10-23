import React, { useEffect, useState } from 'react';
import Bar from '../../components/bar/Bar';
import './Home.css';
import { fetchRooms, createRoom, joinRoom } from '../../services/roomService';
import { useNavigate } from 'react-router-dom';

interface Room {
  uuid: string;
  name: string;
  players_count: number;
  owner: {
    name: string;
  };
}

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [playerUuid, setPlayerUuid] = useState<string | null>(null);
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

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

    // Recupera o player_uuid do localStorage
    const storedPlayerUuid = localStorage.getItem('user_uuid');
    setPlayerUuid(storedPlayerUuid);
  }, []);

  const handleCreateRoom = async () => {
    if (inputValue.trim() && inputValue.length <= 36 && playerUuid) {
      try {
        const data = await createRoom(inputValue, playerUuid);
        setShowPopup(false);
        setInputValue('');
        navigate(`/room/${data.uuid}`); // Use navigate to redirect
      } catch (error) {
        console.error('Erro ao criar a sala:', error);
      }
    }
  };

  const handleJoinRoom = async (roomUuid: string) => {
    if (playerUuid) {
      try {
        await joinRoom(roomUuid, playerUuid);
        navigate(`/room/${roomUuid}`);
      } catch (error) {
        console.error('Erro ao entrar na sala:', error);
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (loading) {
    return <div className="home">Carregando...</div>;
  }

  if (error) {
    return <div className="home">{error}</div>;
  }

  return (
    <div className="home">
      <Bar />
      <div className="content">
        <button className="create-room-button" onClick={() => setShowPopup(true)}>
          Criar Sala
        </button>
        <div className="rooms-container">
          {rooms.map((room) => (
            <div key={room.uuid} className="room-card">
              <h3>{room.name}</h3>
              <p>Dono: {room.owner.name}</p>
              <p>Jogadores: {room.players_count}</p>
              {/* Botão Entrar */}
              <button
                className="enter-room-button"
                onClick={() => handleJoinRoom(room.uuid)}
              >
                Entrar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popup de criação de sala */}
      {showPopup && (
        <div className="popup">
          <button className="close-button" onClick={handleClosePopup}>X</button>
          <p>Digite o nome da sala:</p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={36}
            placeholder="Nome da sala"
          />
          <button onClick={handleCreateRoom}>Criar Sala</button>
        </div>
      )}
    </div>
  );
};

export default Home;
