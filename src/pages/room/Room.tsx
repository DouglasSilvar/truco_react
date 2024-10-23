import React, { useEffect, useState } from 'react';
import Bar from '../../components/bar/Bar';
import { useParams, useNavigate } from 'react-router-dom';
import './Room.css';
import { leaveRoom } from '../../services/roomService';

interface RoomDetails {
  uuid: string;
  name: string;
  players_count: number;
  owner: {
    name: string;
  };
}

const Room: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playerUuid, setPlayerUuid] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/rooms/${uuid}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar os detalhes da sala');
        }
        const data = await response.json();
        setRoomDetails(data);
      } catch (error) {
        setError('Erro ao carregar a sala');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();

    // Recupera o player_uuid do localStorage
    const storedPlayerUuid = localStorage.getItem('user_uuid');
    setPlayerUuid(storedPlayerUuid);
  }, [uuid]);

  const handleLeaveRoom = async () => {
    if (playerUuid) {
      try {
        await leaveRoom(uuid!, playerUuid);
        navigate('/'); // Volta para a home após sair da sala
      } catch (error) {
        console.error('Erro ao sair da sala:', error);
      }
    }
  };

  if (loading) {
    return <div className="room">Carregando...</div>;
  }

  if (error) {
    return <div className="room">{error}</div>;
  }

  return (
    <div className="room">
      <Bar />
      <div className="content-room">
        {roomDetails && (
          <div className="room-card-room">
            <h2>{roomDetails.name}</h2>
            <p>Dono: {roomDetails.owner.name}</p>
            <p>Jogadores na sala: {roomDetails.players_count}</p>
            {/* Botão Sair */}
            <button className="leave-room-button" onClick={handleLeaveRoom}>
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
