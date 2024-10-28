import React, { useEffect, useState } from 'react';
import Bar from '../../components/bar/Bar';
import { useParams, useNavigate } from 'react-router-dom';
import './Room.css';
import { leaveRoom, fetchRoomDetails, changeChair, kickPlayer, joinRoom } from '../../services/roomService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

interface RoomDetails {
  uuid: string;
  name: string;
  players_count: number;
  player_kick_status: boolean;
  protected: boolean;
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
  const [showPasswordPopup, setShowPasswordPopup] = useState<boolean>(false);
  const [password, setPassword] = useState<string>(''); // Senha do popup
  const [isInRoom, setIsInRoom] = useState<boolean>(false); // Verifica se o jogador está na sala
  const [joining, setJoining] = useState<boolean>(false);
  const navigate = useNavigate();

  const updatePlayerUuid = (uuid: string) => {
    setPlayerUuid(uuid);
  };

  const loadRoomDetails = async () => {
    try {
      const data = await fetchRoomDetails(uuid!);
      setRoomDetails(data);

      // Verifica se o jogador está na sala
      const playerName = localStorage.getItem('user_name');
      if (playerName) {
        const isPlayerInRoom = Object.values(data.chairs).includes(playerName);
        setIsInRoom(isPlayerInRoom);
      }
    } catch (error: any) {
      if (error.message === 'RoomNotFound') {
        navigate('/'); // Redireciona para a página principal se a sala não for encontrada (404)
      } else {
        setError('Erro ao carregar a sala');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomDetails();
    const storedPlayerUuid = localStorage.getItem('user_uuid');
    setPlayerUuid(storedPlayerUuid);
  }, [uuid, navigate]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadRoomDetails();
    }, 1000); // Executa a cada 1 segundo

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [uuid, roomDetails, navigate]); 
  

  // Novo useEffect para redirecionar o jogador se ele for expulso
  useEffect(() => {
    if (roomDetails?.player_kick_status) {
      navigate('/'); // Redireciona para a página principal se o jogador for expulso
    }
  }, [roomDetails?.player_kick_status, navigate]);

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

  const handleJoinRoom = async () => {
    if (playerUuid && roomDetails) {
      if (joining) return; // Evita múltiplas tentativas de entrar
      setJoining(true);

      if (roomDetails.protected) {
        setShowPasswordPopup(true); // Exibir popup para senha
      } else {
        try {
          const result = await joinRoom(uuid!, playerUuid);
          if (result.status === 403) {
            setError('Acesso negado.');
          } else {
            setIsInRoom(true); // Marca o jogador como presente na sala
            // Chama a função para atualizar a lista de jogadores após o sucesso
            await loadRoomDetails();
          }
        } catch (error) {
          console.error('Erro ao entrar na sala:', error);
        } finally {
          setJoining(false);
        }
      }
    }
  };
  

  const handleSubmitPassword = async () => {
    if (playerUuid && roomDetails) {
      try {
        const result = await joinRoom(roomDetails.uuid, playerUuid, password);
        if (result.status === 403) {
          setError('Senha incorreta.');
        } else {
          setShowPasswordPopup(false);
          setIsInRoom(true); // Marca o jogador como presente na sala
          await loadRoomDetails(); // Atualiza os detalhes da sala
        }
      } catch (error) {
        console.error('Erro ao entrar na sala protegida:', error);
      }
    }
  };

  const handleClosePasswordPopup = () => {
    setShowPasswordPopup(false);
    setPassword('');
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
            <h2>{roomDetails.name} {roomDetails.protected && <FontAwesomeIcon icon={faLock} className="lock-icon" />}</h2>
            <p><strong>Dono:</strong> {roomDetails.owner.name}</p>
            <p><strong>Jogadores na sala:</strong> {roomDetails.players_count}</p>

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
            {isInRoom ? (
              <button className="leave-room-button" onClick={handleLeaveRoom}>
                Sair
              </button>
            ) : (
              <button className="enter-room-button" onClick={handleJoinRoom}>
                Entrar
              </button>
            )}
          </div>
        )}
              {/* Popup para inserir senha em salas protegidas */}
      {showPasswordPopup && (
        <div className="popup">
          <button className="close-button" onClick={handleClosePasswordPopup}>X</button>
          <p>Senha da sala:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
          />
          <button onClick={handleSubmitPassword}>Entrar</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Room;
