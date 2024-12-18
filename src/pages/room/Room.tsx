import React, { useEffect, useState } from 'react';
import Bar from '../../components/bar/Bar';
import { useParams, useNavigate } from 'react-router-dom';
import './Room.css';
import { leaveRoom, fetchRoomDetails, changeChair, kickPlayer, joinRoom, setPlayerReady, startGame } from '../../services/roomService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faLock } from '@fortawesome/free-solid-svg-icons';
import Chat from '../../components/chat/Chat'; // Ajuste o caminho conforme necessário


interface ReadyPlayer {
  player: string;
}

interface RoomDetails {
  uuid: string;
  name: string;
  game: string;
  players_count: number;
  player_kick_status: boolean;
  protected: boolean;
  owner: {
    name: string;
  };
  chairs: {
    chair_a: string | null;
    chair_b: string | null;
    chair_c: string | null;
    chair_d: string | null;
  };
  ready: ReadyPlayer[]; // Corrigido para um array de objetos com o campo 'player'
  messages: {
    player_name: string;
    date_created: string;
    content: string;
  }[];
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
  const [isReady, setIsReady] = useState<boolean>(false);
  const playerName = localStorage.getItem('user_name');
  const isOwner = roomDetails && localStorage.getItem('user_name') === roomDetails.owner.name;
  const allPlayersReady = roomDetails && roomDetails.ready.length === 4;
  const [incorrectPassword, setIncorrectPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const updatePlayerUuid = (uuid: string) => {
    setPlayerUuid(uuid);
  };

  const loadRoomDetails = async () => {
    try {
      const data = await fetchRoomDetails(uuid!); // Pega os detalhes da sala via API
      setRoomDetails(data); // Atualiza o estado com os detalhes da sala

      // Verifica se o jogador atual está pronto
      const playerName = localStorage.getItem('user_name');
      if (playerName) {
        data.ready?.some((readyPlayer: ReadyPlayer) => readyPlayer.player === playerName);
      }
    } catch (error: any) {
      if (error.message === 'RoomNotFound') {
        navigate('/'); // Redireciona para a página principal se a sala não for encontrada
      } else {
        setError('Erro ao carregar a sala');
      }
    } finally {
      setLoading(false); // Desativa o estado de loading
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

  useEffect(() => {
    if (roomDetails?.game) {
      navigate(`/game/${roomDetails.game}`);
    }
  }, [roomDetails, navigate]);

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
          player_name: playerName, // Nome do jogador a ser mudado de cadeira
          chair_destination: chairDestination, // Cadeira de destino
        });

        await loadRoomDetails(); // Recarregar os detalhes da sala após a mudança
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
          if (result.status === 422) {
            console.log('Acesso negado.');
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
        if (result.status === 422) {
          console.error('Senha incorreta.');
          setJoining(false);
          setShowPasswordPopup(false);
          setPassword('');
          setIncorrectPassword(true); // Ativa o popup de senha incorreta
        } else {
          setShowPasswordPopup(false);
          setIsInRoom(true); // Marca o jogador como presente na sala
          await loadRoomDetails(); // Atualiza os detalhes da sala
        }
      } catch (error) {
        setJoining(false);
        console.error('Erro ao entrar na sala protegida:', error);
      }
    }
  };

  const handleClosePasswordPopup = () => {
    setShowPasswordPopup(false);
    setPassword('');
    setJoining(false);
  };

  const handleStartGame = async () => {
    try {
      const response = await startGame(uuid!);
      navigate(`/game/${response.game_id}`);
    } catch (error) {
      console.error('Erro ao iniciar o jogo:', error);
    }
  };

  const isChairAvailable = (chair: string | null) => {
    return chair === '' || chair === null; // Cadeira está vazia se for uma string vazia ou null
  };

  const isPlayerInChairs = () => {
    const playerName = localStorage.getItem('user_name');
    return roomDetails?.chairs.chair_a === playerName ||
      roomDetails?.chairs.chair_b === playerName ||
      roomDetails?.chairs.chair_c === playerName ||
      roomDetails?.chairs.chair_d === playerName;
  };

  const handleSetReady = async () => {
    try {
      await setPlayerReady(uuid!, !isReady); // Envia o valor oposto do estado atual
      setIsReady(!isReady); // Alterna o estado após a requisição
      await loadRoomDetails(); // Recarregar os detalhes da sala
    } catch (error) {
      console.error('Erro ao alternar o estado de pronto:', error);
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
      <Bar updatePlayerUuid={updatePlayerUuid} />
      <div className="content-room">
        {roomDetails && (
          <div className="room-card-room">
            <h2>{roomDetails.name} {roomDetails.protected && <FontAwesomeIcon icon={faLock} className="lock-icon" />}</h2>
            <p><strong>Dono:</strong> {roomDetails.owner.name}</p>
            <p><strong>Jogadores na sala:</strong> {roomDetails.players_count}</p>

            <div className="chairs-container-room">
              {/* Time NOS */}
              <div className="team-container">
                <h3 className="team-name us">Time NOS</h3>
                <div className="team-chairs-vertical">
                  {(['chair_a', 'chair_b'] as Array<keyof RoomDetails['chairs']>).map((chairKey) => {
                    const playerName = roomDetails.chairs[chairKey];
                    const isPlayerReady = roomDetails.ready.some((readyPlayer) => readyPlayer.player === playerName);
                    const teamClass = 'team-ab';

                    return (
                      <div
                        key={chairKey}
                        className={`chair-box ${isChairAvailable(playerName) ? `clickable ${teamClass}` : teamClass}`}
                        onClick={() => isChairAvailable(playerName) && handleChairClick(chairKey)}
                      >
                        {playerName && (
                          <div className="chair-content-room">
                            <span>{playerName}</span>
                            {isPlayerReady && (
                              <FontAwesomeIcon icon={faCheck} className="ready-check-icon" />
                            )}
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
              </div>

              {/* Time ELES */}
              <div className="team-container">
                <h3 className="team-name them">Time ELES</h3>
                <div className="team-chairs-vertical">
                  {(['chair_c', 'chair_d'] as Array<keyof RoomDetails['chairs']>).map((chairKey) => {
                    const playerName = roomDetails.chairs[chairKey];
                    const isPlayerReady = roomDetails.ready.some((readyPlayer) => readyPlayer.player === playerName);
                    const teamClass = 'team-cd';

                    return (
                      <div
                        key={chairKey}
                        className={`chair-box ${isChairAvailable(playerName) ? `clickable ${teamClass}` : teamClass}`}
                        onClick={() => isChairAvailable(playerName) && handleChairClick(chairKey)}
                      >
                        {playerName && (
                          <div className="chair-content-room">
                            <span>{playerName}</span>
                            {isPlayerReady && (
                              <FontAwesomeIcon icon={faCheck} className="ready-check-icon" />
                            )}
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
              </div>
            </div>

            {playerName && (
              <>
                {isOwner && allPlayersReady && (
                  <button className="start-game-button" onClick={handleStartGame}>
                    Iniciar Partida
                  </button>
                )}
                {isPlayerInChairs() && !isOwner && (
                  <button
                    className={`ready-button ${isReady ? 'waiting' : 'ready'}`}
                    onClick={handleSetReady}
                  >
                    {isReady ? 'Esperar' : 'Pronto'}
                  </button>
                )}
                {(isInRoom || isPlayerInChairs() || isOwner) && (
                  <button className="leave-room-button" onClick={handleLeaveRoom}>
                    Sair
                  </button>
                )}
                {!isPlayerInChairs() && (
                  <button className="enter-room-button" onClick={handleJoinRoom}>
                    Entrar
                  </button>
                )}
              </>
            )}

          </div>

        )}
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
        {incorrectPassword && (
          <div className="popup">
            <button className="close-button" onClick={() => setIncorrectPassword(false)}>X</button>
            <p>Senha incorreta. Tente novamente.</p>
          </div>
        )}
        {(roomDetails?.protected === false || isPlayerInChairs()) && (
          <div className="room-card-room">
            <Chat
              messages={roomDetails?.messages || []}
              roomUuid={roomDetails?.uuid || ''}
              game_chairs={{
                chair_a: roomDetails?.chairs?.chair_a ?? null,
                chair_b: roomDetails?.chairs?.chair_b ?? null,
                chair_c: roomDetails?.chairs?.chair_c ?? null,
                chair_d: roomDetails?.chairs?.chair_d ?? null,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;