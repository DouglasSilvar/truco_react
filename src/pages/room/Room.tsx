import React, { useEffect, useState } from 'react';
import Bar from '../../components/bar/Bar';
import { useParams, useNavigate } from 'react-router-dom';
import './Room.css';
import { leaveRoom, fetchRoomDetails, changeChair, kickPlayer } from '../../services/roomService';

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

  const handleKickPlayer = async (playerName: string) => {
    try {
      await kickPlayer(uuid!, playerName);
      // Atualizar a sala após remover o jogador
      const updatedDetails = await fetchRoomDetails(uuid!);
      setRoomDetails(updatedDetails);
    } catch (error) {
      console.error('Erro ao remover o jogador:', error);
    }
  };

  const isChairAvailable = (chair: string | null) => {
    return chair === '' || chair === null; // Cadeira está vazia se for uma string vazia ou null
  };

  const isOwner = localStorage.getItem('user_name') === roomDetails?.owner.name;

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

            <div className="chairs-container">
              {Object.entries(roomDetails.chairs).map(([chairKey, playerName]) => {
                const teamClass = chairKey === 'chair_a' || chairKey === 'chair_b' ? 'team-ab' : 'team-cd';
                
                return (
                  <div
                    key={chairKey}
                    className={`chair-box ${isChairAvailable(playerName) ? `clickable ${teamClass}` : teamClass}`}
                    onClick={() => isChairAvailable(playerName) && handleChairClick(chairKey)}
                  >
                    {playerName && (
                      <div className="chair-content">
                        <span>{playerName}</span>
                        {isOwner && playerName !== roomDetails.owner.name && (
                          <button
                            className="kick-button"
                            onClick={() => handleKickPlayer(playerName)}
                          >
                            X
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
