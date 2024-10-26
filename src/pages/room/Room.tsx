import React, { useEffect, useState } from 'react';
import Bar from '../../components/bar/Bar';
import { useParams, useNavigate } from 'react-router-dom';
import './Room.css';
import { leaveRoom, fetchRoomDetails, changeChair } from '../../services/roomService';

interface RoomDetails {
  uuid: string;
  name: string;
  players_count: number;
  owner: {
    name: string;
  };
  chairs: {
    chair_a: string;
    chair_b: string;
    chair_c: string;
    chair_d: string;
  };
}

const Room: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playerUuid, setPlayerUuid] = useState<string | null>(null);
  const navigate = useNavigate();

  const updatePlayerUuid = (uuid: string) => {
    setPlayerUuid(uuid);
  };

  useEffect(() => {
    const loadRoomDetails = async () => {
      try {
        const data = await fetchRoomDetails(uuid!);
        setRoomDetails(data);
      } catch (error) {
        setError('Erro ao carregar a sala');
      } finally {
        setLoading(false);
      }
    };

    loadRoomDetails();

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

  const handleChairClick = async (chairDestination: string) => {
    if (roomDetails) {
      try {
        const playerName = localStorage.getItem('user_name');

        if (!playerName) {
          throw new Error('Nome do jogador não encontrado no localStorage');
        }

        await changeChair(uuid!, {
          player_name: playerName, // Pega o nome do jogador do localStorage
          chair_destination: chairDestination,
        });

        // Atualiza os detalhes da sala após a mudança
        const updatedDetails = await fetchRoomDetails(uuid!);
        setRoomDetails(updatedDetails);
      } catch (error) {
        console.error('Erro ao trocar de cadeira:', error);
      }
    }
  };


  const isChairAvailable = (chair: string | null) => {
    return chair === '' || chair === null; // Cadeira está vazia se for uma string vazia ou null
  };


  if (loading) {
    return <div className="room">Carregando...</div>;
  }

  if (error) {
    return <div className="room">{error}</div>;
  }


  return (
    <div className="room">
      <Bar updatePlayerUuid={updatePlayerUuid} />
      <div className="content-room">
        {roomDetails && (
          <div className="room-card-room">
            <h2>{roomDetails.name}</h2>
            <p>Dono: {roomDetails.owner.name}</p>
            <p>Jogadores na sala: {roomDetails.players_count}</p>

            {/* Renderizando as cadeiras com a função de clique */}
            <div className="chairs-container">
              <div
                className={`chair-box ${isChairAvailable(roomDetails.chairs.chair_a) ? 'clickable team-ab' : 'team-ab'}`}
                onClick={() => isChairAvailable(roomDetails.chairs.chair_a) && handleChairClick('chair_a')}
              >
                {roomDetails.chairs.chair_a && roomDetails.chairs.chair_a}
              </div>
              <div
                className={`chair-box ${isChairAvailable(roomDetails.chairs.chair_b) ? 'clickable team-ab' : 'team-ab'}`}
                onClick={() => isChairAvailable(roomDetails.chairs.chair_b) && handleChairClick('chair_b')}
              >
                {roomDetails.chairs.chair_b && roomDetails.chairs.chair_b}
              </div>
              <div
                className={`chair-box ${isChairAvailable(roomDetails.chairs.chair_c) ? 'clickable team-cd' : 'team-cd'}`}
                onClick={() => isChairAvailable(roomDetails.chairs.chair_c) && handleChairClick('chair_c')}
              >
                {roomDetails.chairs.chair_c && roomDetails.chairs.chair_c}
              </div>
              <div
                className={`chair-box ${isChairAvailable(roomDetails.chairs.chair_d) ? 'clickable team-cd' : 'team-cd'}`}
                onClick={() => isChairAvailable(roomDetails.chairs.chair_d) && handleChairClick('chair_d')}
              >
                {roomDetails.chairs.chair_d && roomDetails.chairs.chair_d}
              </div>
            </div>
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
