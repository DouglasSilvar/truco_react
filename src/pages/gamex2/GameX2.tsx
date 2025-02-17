import React, { useEffect, useState } from 'react';
import './GameX2.css';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoomDetails, playMove, collectCards, trucarAccept, escapeGame } from '../../services/gameX2Service';
import Chat from '../../components/chat/Chat';

interface StepDetails {
    id: number;
    game_id: string;
    number: number;
    table_cards: string[];
    player_time: string;
    player_call_3: number | null;
    player_call_6: number | null;
    player_call_9: number | null;
    player_call_12: number | null;
    vira: string;
    created_at: string;
    updated_at: string;
    cards_chair_a: string[];
    cards_chair_b: string[];
    cards_chair_c: string[];
    cards_chair_d: string[];
    first: string | null;
    second: string | null;
    win: string | null;
    first_card_origin: string | null;
    second_card_origin: string | null;
    third_card_origin: string | null;
    fourth_card_origin: string | null;
    is_accept_first: string | null;
    is_accept_second: string | null;
}

interface GameDetails {
    uuid: string;
    room_id: string;
    score_us: number;
    score_them: number;
    created_at: string;
    updated_at: string;
    room_name: string;
    protected: boolean;
    is_two_players: boolean;
    end_game_win: number | null;
    chairs: {
        chair_a: string;
        chair_b: string;
        chair_c: string;
        chair_d: string;
    };
    step: StepDetails;
    owner: OWner;
    messages: {
        player_name: string;
        date_created: string;
        content: string;
    }[];
}

interface OWner {
    name: string;
}

const GameX2: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [isEncobrir, setIsEncobrir] = useState(false);
    const [showWinnerPopup, setShowWinnerPopup] = useState<boolean>(false);
    const [winnerMessage, setWinnerMessage] = useState<string>('');
    const [isPlayer, setIsPlayer] = useState<boolean>(false); // Estado para verificar se o usuário é jogador
    const name = localStorage.getItem('user_name');

    useEffect(() => {
        const loadGameDetails = async () => {
            try {
                const data = await fetchRoomDetails(uuid!);
                setGameDetails(data);
                if (data.is_two_players === false) {
                    navigate(`/game/${data.uuid}`);
                }
                const { chair_a, chair_b, chair_c, chair_d } = data.chairs || {};
                setIsPlayer([chair_a, chair_b, chair_c, chair_d].includes(name));
                // Exibe o popup para end_game_win com prioridade
                if (data.end_game_win) {
                    switch (data.end_game_win) {
                        case "NOS":
                            setShowWinnerPopup(false);
                            setWinnerMessage("O time NÓS ganhou o JOGO");
                            setShowWinnerPopup(true);
                            break;
                        case "ELES":
                            setShowWinnerPopup(false);
                            setWinnerMessage("O time ELES ganhou o JOGO");
                            setShowWinnerPopup(true);
                            break;
                        default:
                        // Não há ação para outros valores
                    }

                    // Verifica se o usuário está na cadeira e redireciona após 5 segundos
                    if ([chair_a, chair_b, chair_c, chair_d].includes(name)) {
                        setTimeout(() => {
                            navigate(`/room/${data.room_id}`);
                        }, 5000); // Redireciona após 5 segundos
                    }

                    return; // Impede que a lógica de step.win sobrescreva
                }

                // Exibe o popup para step.win se não houver end_game_win
                if (data.step.win) {
                    switch (data.step.win) {
                        case "NOS":
                            setWinnerMessage("O time NÓS ganhou a partida");
                            setShowWinnerPopup(true);
                            break;
                        case "ELES":
                            setWinnerMessage("O time ELES ganhou a partida");
                            setShowWinnerPopup(true);
                            break;
                        case "EMPT":
                            setWinnerMessage("EMPATE DA PARTIDA");
                            setShowWinnerPopup(true);
                            break;
                        default:
                        // Não há ação para outros valores
                    }
                } else {
                    setShowWinnerPopup(false); // Esconde o popup se não houver vencedor
                }
            } catch (error: any) {
                if (error.message === 'RoomNotFound') {
                    navigate('/'); // Redireciona para a página principal se o jogo não for encontrado
                } else {
                    setError('Erro ao carregar o jogo');
                }
            } finally {
                setLoading(false);
            }
        };

        // Inicia o polling a cada 1 segundo
        const intervalId = setInterval(() => {
            loadGameDetails();
        }, 1000);

        // Limpa o intervalo ao desmontar o componente
        return () => clearInterval(intervalId);
    }, [uuid, navigate]);

    // Função para formatar as cartas com os símbolos corretos e cores específicas para naipes
    const formatCard = (card: string) => {
        if (card === 'EC') {
            // Renderiza a imagem para cartas encobertas
            return (
                <div className="card">
                    <img src="/rails.png" alt="Encoberta" style={{ width: '100%', height: '100%' }} />
                </div>
            );
        }

        const rank = card.slice(0, -1); // Extrai o valor da carta
        const suit = card.slice(-1); // Extrai o naipe da carta

        const suitSymbol = suit === 'O' ? '♦' :
            suit === 'E' ? '♠' :
                suit === 'C' ? '♥' :
                    suit === 'Z' ? '♣' : '';

        const isRedSuit = suit === 'O' || suit === 'C'; // Define se o naipe é Ouro ou Copas

        const vira = gameDetails?.step.vira?.slice(0, -1); // Extrai o valor da vira
        const hierarchy = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

        // Ajusta o índice da Mania para comportamento circular
        const viraIndex = vira ? hierarchy.indexOf(vira) : -1;
        const maniaIndex = viraIndex !== -1 ? (viraIndex + 1) % hierarchy.length : -1;

        const isMania = rank === hierarchy[maniaIndex]; // Verifica se a carta é Mania

        return (
            <span className={`card ${isRedSuit ? 'red-suit' : ''} ${isMania ? 'mania-card' : ''}`}>
                {rank}
                <span className="card-suit">{suitSymbol}</span>
            </span>
        );
    };


    const formatSuitSymbol = (suit: string) => {
        return suit === 'O' ? '♦' :
            suit === 'E' ? '♠' :
                suit === 'C' ? '♥' :
                    suit === 'Z' ? '♣' : '';
    };

    // Determina quais cartas exibir no painel do jogador
    const playerCards = Array.isArray(gameDetails?.step.cards_chair_a) && gameDetails?.step.cards_chair_a.length
        ? gameDetails.step.cards_chair_a
        : Array.isArray(gameDetails?.step.cards_chair_b) && gameDetails?.step.cards_chair_b.length
            ? gameDetails.step.cards_chair_b
            : Array.isArray(gameDetails?.step.cards_chair_c) && gameDetails?.step.cards_chair_c.length
                ? gameDetails.step.cards_chair_c
                : Array.isArray(gameDetails?.step.cards_chair_d) && gameDetails?.step.cards_chair_d.length
                    ? gameDetails.step.cards_chair_d
                    : [];
    const { chair_a, chair_b, chair_c, chair_d } = gameDetails?.chairs || {};
    const getChairPositions = () => {
        if (name === chair_a) {
            return { bottom: chair_a, top: chair_c };
        }
        if (name === chair_c) {
            return { bottom: chair_c, top: chair_a };
        }
        return { bottom: chair_a, top: chair_c };
    };

    const chairPositions = getChairPositions();
    const isPlayerTurn = gameDetails?.step.player_time === name;

    const playTheCard = async (card: string, encoberta: boolean) => {
        console.log('Encobrir:', isEncobrir);
        if (!gameDetails) return;
        if (encoberta) toggleEncobrir();
        console.log('Encobrir:', isEncobrir);
        await playMove(gameDetails.uuid, card, encoberta)
            .then(response => {
                console.log('Jogada realizada com sucesso:', response);
            })
            .catch(error => {
                console.error('Erro ao realizar a jogada:', error);
            });
    };

    const toggleEncobrir = () => {
        setIsEncobrir(!isEncobrir);
    };

    const handleTrucar = () => {
        if (!gameDetails) return;

        const { player_call_3, player_call_6, player_call_9, player_call_12 } = gameDetails.step;
        let callValue: number | null = null;  // Define o tipo como number | null

        if (player_call_3 === null && player_call_6 === null && player_call_9 === null && player_call_12 === null) {
            callValue = 3;
        } else if (player_call_6 === null && player_call_9 === null && player_call_12 === null) {
            callValue = 6;
        } else if (player_call_9 === null && player_call_12 === null) {
            callValue = 9;
        } else if (player_call_12 === null) {
            callValue = 12;
        }

        if (callValue !== null) {
            trucarAccept(gameDetails.uuid, null, callValue)
                .then(response => {
                    console.log(`Trucada chamada com valor ${callValue}:`, response);
                })
                .catch(error => {
                    console.error(`Erro ao chamar trucada com valor ${callValue}:`, error);
                });
        }
    };

    const collectTableCards = async () => {
        if (!gameDetails) return;

        try {
            const response = await collectCards(gameDetails.uuid);
            console.log('Cartas recolhidas com sucesso:', response);
        } catch (error) {
            console.error('Erro ao recolher as cartas:', error);
        }
    };

    const handleTrucoRespose = async (accept: boolean) => {
        if (!gameDetails) return;
        try {
            await trucarAccept(gameDetails.uuid, accept, null);
            console.log(`${accept ? "Aceitar" : "Correr"} acionado com sucesso!`);
        } catch (error) {
            console.error(`Erro ao acionar o botão ${accept ? "Aceitar" : "Correr"}:`, error);
        }
    };

    const renderTableCards = () => {
        // Pega a posição atual do jogador na mesa
        if (!gameDetails) return null;

        // Define a ordem das posições anti-horárias, iniciando do jogador atual
        const positionOrderA = {
            bottom: ['bottom-right', 'top-left'],
            top: ['top-left', 'bottom-right'],
        };

        const positionOrderC = {
            bottom: ['top-left', 'bottom-right',],
            top: ['bottom-right', 'top-left']
        };

        const firstCardOrigin = gameDetails.step.first_card_origin;
        const originChair = firstCardOrigin ? firstCardOrigin.split('---')[1] : null;

        // Define a ordem de posições baseada na cadeira de origem da primeira carta
        const getPositionOrder = () => {
            switch (originChair) {
                case 'chair_a':
                    return positionOrderA;
                case 'chair_c':
                    return positionOrderC;
                default:
                    return positionOrderA; // Caso padrão, se a origem não for identificada
            }
        };

        const positionOrder = getPositionOrder();
        const currentPlayerPosition = name === chair_a ? 'bottom' :
            name === chair_c ? 'top' : null;

        const cardPositions = positionOrder[currentPlayerPosition || 'bottom'];

        const getCardTeam = (cardIndex: number): string => {
            const origins = [
                gameDetails.step.first_card_origin,
                gameDetails.step.second_card_origin,
                gameDetails.step.third_card_origin,
                gameDetails.step.fourth_card_origin
            ];

            const origin = origins[cardIndex];
            if (!origin) return ''; // Se o índice não existir, retorna vazio

            const team = origin.split('---')[2]; // Extrai o time (NOS ou ELES)
            return team;
        };

        // Renderiza as cartas na mesa seguindo a ordem definida
        return gameDetails.step.table_cards.map((card, index) => {
            const team = getCardTeam(index); // Identifica o time da carta
            const cardClass = team === 'ELES' ? 'card eles' : 'card nos'; // Adiciona uma classe para o time

            return (
                <div key={index} className={`table-card ${cardPositions[index]} ${cardClass}`}>
                    {formatCard(card)}
                </div>
            );
        });
    };

    // Função para determinar o texto do botão "Trucar"
    const getTrucarButtonText = (): string | null => {
        const { player_call_3, player_call_6, player_call_9, player_call_12 } = gameDetails?.step || {};

        if (!player_call_3 && !player_call_6 && !player_call_9 && !player_call_12) {
            return "TRUCO !!!";
        }
        if (player_call_3 && !player_call_6 && !player_call_9 && !player_call_12) {
            return "SEIS !!!";
        }
        if (player_call_3 && player_call_6 && !player_call_9 && !player_call_12) {
            return "NOVE !!!";
        }
        if (player_call_3 && player_call_6 && player_call_9 && !player_call_12) {
            return "DOZE !!!";
        }
        // Se todos os valores estiverem preenchidos, o botão desaparece
        if (player_call_3 && player_call_6 && player_call_9 && player_call_12) {
            return null;
        }

        return "Truco !!!"; // Default para outros casos
    };


    // Verifica se o jogador atual pode trucar
    const canTrucar = (): boolean => {
        if (!gameDetails) return false;

        const currentPlayer = localStorage.getItem('user_name') || '';
        const { chair_a, chair_b, chair_c, chair_d } = gameDetails.chairs;

        // Determina o time do jogador atual
        const currentPlayerTeam = [chair_a, chair_b].includes(currentPlayer) ? 'NOS' : 'ELES';

        // Função auxiliar para encontrar a última chamada válida
        const getLastCall = (): { player: string; team: string; value: number } | null => {
            const calls = [
                { call: gameDetails.step.player_call_12, value: 12 },
                { call: gameDetails.step.player_call_9, value: 9 },
                { call: gameDetails.step.player_call_6, value: 6 },
                { call: gameDetails.step.player_call_3, value: 3 },
            ];

            for (const { call, value } of calls) {
                if (call) {
                    const stringCall = String(call); // Converte o valor para string
                    const [player, team] = stringCall.split('---');
                    return { player, team, value };
                }
            }
            return null; // Nenhuma chamada foi feita
        };

        const lastCall = getLastCall();

        // Regra: O time que fez a última chamada não pode fazer a próxima
        if (lastCall && lastCall.team === currentPlayerTeam) {
            return false;
        }

        // Regra: O jogador atual deve ser o próximo a jogar
        if (gameDetails.step.player_time !== currentPlayer) {
            return false;
        }

        // Regra: O botão não deve aparecer quando a última chamada foi Doze
        if (lastCall?.value === 12) {
            return false;
        }

        // Regra adicional: O botão não deve aparecer se já houver 2 cartas na mesa
        if (gameDetails.step.table_cards.length === 2) {
            return false;
        }

        // Regra adicional: Ninguém truca na mão de 11
        if (gameDetails.score_them === 11 || gameDetails.score_us === 11) {
            console.log('Ninguém truca na mão de 11');
            return false;
        }


        return true; // Caso contrário, o jogador pode trucar
    };


    const isTrucoCalled = (playerName: string | undefined): string | null => {
        if (!gameDetails) return null;

        // Função auxiliar para extrair detalhes da chamada
        const extractDetails = (value: number | string | null | undefined): { player: string; team: string } | null => {
            if (!value) return null;
            const stringValue = String(value); // Converte para string
            const [player, team] = stringValue.split('---'); // Extrai jogador e time
            return { player, team };
        };

        // Extrai detalhes das chamadas
        const playerCall12 = gameDetails.step.player_call_12 ? extractDetails(gameDetails.step.player_call_12) : null;
        const playerCall9 = gameDetails.step.player_call_9 ? extractDetails(gameDetails.step.player_call_9) : null;
        const playerCall6 = gameDetails.step.player_call_6 ? extractDetails(gameDetails.step.player_call_6) : null;
        const playerCall3 = gameDetails.step.player_call_3 ? extractDetails(gameDetails.step.player_call_3) : null;

        // Determina a maior chamada ativa
        const highestCall = playerCall12
            ? { value: 12, team: playerCall12.team }
            : playerCall9
                ? { value: 9, team: playerCall9.team }
                : playerCall6
                    ? { value: 6, team: playerCall6.team }
                    : playerCall3
                        ? { value: 3, team: playerCall3.team }
                        : null;

        if (!highestCall) return null; // Se nenhuma chamada foi feita

        // Verifica se o jogador pertence ao time da maior chamada
        const { chair_a, chair_b, chair_c, chair_d } = gameDetails.chairs;
        const teamUs = [chair_a, chair_b]; // Time "NOS"
        const teamThem = [chair_c, chair_d]; // Time "ELES"

        const playerTeam = teamUs.includes(playerName || '') ? 'NOS' : 'ELES';

        // Exibe a maior chamada apenas para o time correspondente
        if (playerTeam === highestCall.team) {
            switch (highestCall.value) {
                case 12:
                    return "DOZE !!!";
                case 9:
                    return "NOVE !!!";
                case 6:
                    return "SEIS !!!";
                case 3:
                    return "TRUCO !!!";
                default:
                    return null;
            }
        }

        return null; // Retorna null se o jogador não pertence ao time da maior chamada
    };




    const isAcceptCalled = (playerName: string | undefined): { hasResponse: boolean, emoji: string, colorClass: string } => {
        const extractDetails = (value: string | null) => {
            if (!value) return null;
            const [player, accept] = value.split('---');
            return { player, accept };
        };

        const acceptFirstDetails = extractDetails(gameDetails?.step.is_accept_first ?? null);
        const acceptSecondDetails = extractDetails(gameDetails?.step.is_accept_second ?? null);

        // Verifica se o playerName corresponde e retorna os detalhes apropriados
        if (playerName && acceptFirstDetails && acceptFirstDetails.player === playerName) {
            return {
                hasResponse: true,
                emoji: acceptFirstDetails.accept === 'yes' ? 'VEM !!!' : 'NÃO ..',
                colorClass: acceptFirstDetails.accept === 'yes' ? 'accept-green' : 'accept-red'
            };
        } else if (playerName && acceptSecondDetails && acceptSecondDetails.player === playerName) {
            return {
                hasResponse: true,
                emoji: acceptSecondDetails.accept === 'yes' ? 'VEM !!!' : 'NÃO ..',
                colorClass: acceptSecondDetails.accept === 'yes' ? 'accept-green' : 'accept-red'
            };
        }

        return { hasResponse: false, emoji: '', colorClass: '' };
    };




    const isOpponentTurnToRespond = (): boolean => {
        if (!gameDetails || gameDetails.step.player_time !== null) return false; // Apenas se `player_time` for nulo

        // Função auxiliar para encontrar o último valor não nulo na hierarquia
        const getLastNonNullCall = (): string | null => {
            const calls = [
                gameDetails.step.player_call_12,
                gameDetails.step.player_call_9,
                gameDetails.step.player_call_6,
                gameDetails.step.player_call_3,
            ];

            // Converte os valores para string e retorna o primeiro não nulo
            const lastCall = calls.find((call) => call !== null);
            return lastCall ? String(lastCall) : null;
        };

        const lastCall = getLastNonNullCall();
        if (!lastCall) return false; // Nenhum `player_call` ativo

        const [callingPlayer, callingTeam] = lastCall.split('---'); // Extrai o jogador e o time

        const isOpponentTeam = (team: string) => team !== callingTeam; // Verifica se é o time oposto

        // Verifica se o jogador atual está no time oposto
        const { chair_a, chair_b, chair_c, chair_d } = gameDetails.chairs;
        const currentPlayer = localStorage.getItem('user_name') || '';

        if ([chair_a, chair_b].includes(currentPlayer) && isOpponentTeam('NOS')) {
            return true; // Jogador pertence ao time "ELES" e "NOS" está chamando
        }
        if ([chair_c, chair_d].includes(currentPlayer) && isOpponentTeam('ELES')) {
            return true; // Jogador pertence ao time "NOS" e "ELES" está chamando
        }

        return false;
    };

    const getChairByPlayer = (player: string | null): string | null => {
        if (!player) return null; // Retorna null se o player for null
        const { chair_a, chair_b, chair_c, chair_d } = gameDetails?.chairs || {};
        if (player === chair_a) return 'chair_a';
        if (player === chair_b) return 'chair_b';
        if (player === chair_c) return 'chair_c';
        if (player === chair_d) return 'chair_d';
        return null;
    };




    const canShowEncobrir = (): boolean => {
        if (!gameDetails) return false;

        if (gameDetails?.step.table_cards.length === 2) {
            return false;
        }

        // Condições para mostrar o botão Encobrir
        return (
            !!gameDetails?.step.first && // Segunda rodada
            gameDetails?.step.table_cards.length >= 1 && // Pelo menos 1 carta na mesa
            gameDetails?.step.player_time === name // É a vez do jogador
        );
    };

    const handleEscape = async () => {
        if (!gameDetails) return; // Verifica se o jogo está carregado

        try {
            const response = await escapeGame(gameDetails.uuid); // Chama o método da service
            console.log('Escape realizado com sucesso:', response);
            // Você pode adicionar lógica adicional aqui, como redirecionar ou exibir um alerta
        } catch (error) {
            console.error('Erro ao realizar escape:', error);
        }
    };


    if (loading) {
        return <div>Carregando...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="game-container" translate="no">
            <div className="game-info">
                <div className="room-name">
                    Sala: {gameDetails?.room_name}
                </div>
                <div className="score-board">
                    <span className="score-team">
                        <span className="team-name us">NÓS</span>: {gameDetails?.score_us}
                    </span>
                    <span className="score-team">
                        <span className="team-name them">ELES</span>: {gameDetails?.score_them}
                    </span>
                </div>
                <div className="round-status">
                    <div className="round-field">
                        <span>Primeira:</span>
                        <span className={`round-result ${gameDetails?.step.first === 'NOS' ? 'us' : gameDetails?.step.first === 'ELES' ? 'them' : ''}`}>
                            {gameDetails?.step.first === 'NOS' ? 'NÓS' : gameDetails?.step.first === 'ELES' ? 'ELES' : gameDetails?.step.first === 'EMPACHE' ? 'EMPACHE' : ' '}
                        </span>
                    </div>
                    <div className="round-field">
                        <span>Segunda:</span>
                        <span className={`round-result ${gameDetails?.step.second === 'NOS' ? 'us' : gameDetails?.step.second === 'ELES' ? 'them' : ''}`}>
                            {gameDetails?.step.second === 'NOS' ? 'NÓS' : gameDetails?.step.second === 'ELES' ? 'ELES' : gameDetails?.step.second === 'EMPACHE' ? 'EMPACHE' : ' '}
                        </span>
                    </div>
                </div>
                {/* Renderiza a frase com base na condição */}
                {gameDetails?.step.table_cards.length === 2 || gameDetails?.step.win ? (
                    <div className="owner-action">
                        Dono da sala{' '}
                        <span className="player-name">
                            <strong>{gameDetails.owner.name}</strong>
                        </span>{' '}
                        do time{' '}
                        <span
                            className={`team-name ${['chair_a', 'chair_b'].includes(
                                getChairByPlayer(gameDetails.owner.name) || ''
                            )
                                ? 'us'
                                : 'them'
                                }`}
                        >
                            {['chair_a', 'chair_b'].includes(getChairByPlayer(gameDetails.owner.name) || '')
                                ? 'NÓS'
                                : 'ELES'}
                        </span>{' '}
                        recolhe as cartas.
                    </div>
                ) : gameDetails?.step.player_time && (
                    <div className="current-player">
                        Vez do jogador{' '}
                        <span className="player-name">
                            <strong>{gameDetails.step.player_time}</strong>
                        </span>{' '}
                        do time{' '}
                        <span
                            className={`team-name ${['chair_a', 'chair_b'].includes(
                                getChairByPlayer(gameDetails.step.player_time) || ''
                            )
                                ? 'us'
                                : 'them'
                                }`}
                        >
                            {['chair_a', 'chair_b'].includes(getChairByPlayer(gameDetails.step.player_time) || '')
                                ? 'NÓS'
                                : 'ELES'}
                        </span>
                        .
                    </div>
                )}
            </div>
            <div className="game-table">
                <div className="vira-card">
                    <span className={`card-value ${gameDetails?.step.vira?.slice(-1) === 'O' || gameDetails?.step.vira?.slice(-1) === 'C' ? 'red-suit' : ''}`}>
                        {gameDetails?.step.vira?.slice(0, -1) || ''}
                    </span>
                    <span className={`card-suit ${gameDetails?.step.vira?.slice(-1) === 'O' || gameDetails?.step.vira?.slice(-1) === 'C' ? 'red-suit' : ''}`}>
                        {formatSuitSymbol(gameDetails?.step.vira?.slice(-1) || '')}
                    </span>
                </div>

                {renderTableCards()}

                {/* Cadeiras ao redor da mesa com posições dinâmicas */}
                <div className={`x2-chair bottom ${chairPositions.bottom === chair_a ? 'team-us' : 'team-them'} ${chairPositions.bottom === gameDetails?.step.player_time ? 'current-turn' : ''}`}>
                    <div className="chair-content">
                        <div className={`accept-call ${isAcceptCalled(chairPositions.bottom).colorClass}`}>
                            {isAcceptCalled(chairPositions.bottom).emoji}
                        </div>
                        {isTrucoCalled(chairPositions.bottom) && (
                            <div className="truco-call">{isTrucoCalled(chairPositions.bottom)}</div>
                        )}
                        <div className={`team-name ${chairPositions.bottom === chair_a ? 'us' : 'them'}`}>
                            {chairPositions.bottom === chair_a ? 'NÓS' : 'ELES'}
                        </div>
                        <div>
                            {chairPositions.bottom}
                        </div>
                    </div>
                </div>

                <div className={`x2-chair top ${chairPositions.top === chair_a ? 'team-us' : 'team-them'} ${chairPositions.top === gameDetails?.step.player_time ? 'current-turn' : ''}`}>
                    <div className="chair-content">
                        <div className={`accept-call ${isAcceptCalled(chairPositions.top).colorClass}`}>
                            {isAcceptCalled(chairPositions.top).emoji}
                        </div>
                        {isTrucoCalled(chairPositions.top) && (
                            <div className="truco-call">{isTrucoCalled(chairPositions.top)}</div>
                        )}
                        <div className={`team-name ${chairPositions.top === chair_a ? 'us' : 'them'}`}>
                            {chairPositions.top === chair_a ? 'NÓS' : 'ELES'}
                        </div>
                        <div>
                            {chairPositions.top}
                        </div>
                    </div>
                </div>
            </div>
            {/* Painel do jogador com cartas */}
            {isPlayer && (
                <div className="player-panel">
                    <div className="card-container">
                        {playerCards.map((card, index) => (
                            <div
                                key={index}
                                className={`card ${!isPlayerTurn || gameDetails?.step.table_cards.length === 2 ? 'disabled' : ''}`}
                                onClick={() => isPlayerTurn && gameDetails?.step.table_cards.length < 2 && playTheCard(card, isEncobrir)}
                                style={{ cursor: (isPlayerTurn && gameDetails?.step.table_cards.length < 2) ? 'pointer' : 'default' }}
                            >
                                {formatCard(card)}
                                {isEncobrir && <img src="/rails.png" alt="Encobrir" className="card-overlay" />}
                            </div>
                        ))}
                    </div>

                    {!gameDetails?.end_game_win && (
                        <div className="action-buttons">
                            {/* Botão para recolher cartas */}
                            {(gameDetails?.step.table_cards.length === 2 || gameDetails?.step.win) && gameDetails?.owner?.name === name ? (
                                <button className="action-button" onClick={collectTableCards}>
                                    Recolher Cartas
                                </button>
                            ) : (
                                <>
                                    {/* Botão "Trucar" disponível apenas para o jogador da vez */}
                                    {(canTrucar() || isOpponentTurnToRespond()) && getTrucarButtonText() && (
                                        <button className="action-button" onClick={handleTrucar}>
                                            {getTrucarButtonText()}
                                        </button>
                                    )}
                                    {canShowEncobrir() && (
                                        <button className="action-button" onClick={toggleEncobrir}>
                                            {isEncobrir ? "Encobrir (Ativo)" : "Encobrir"}
                                        </button>
                                    )}
                                    {/* Botões disponíveis para o time adversário responder ao truco */}
                                    {isOpponentTurnToRespond() && (
                                        <>
                                            <button className="action-button" onClick={() => handleTrucoRespose(false)}>
                                                Correr
                                            </button>
                                            <button className="action-button" onClick={() => handleTrucoRespose(true)}>
                                                Aceitar
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Botão "Fugir" disponível somente quando o botão "Recolher Cartas" não está sendo exibido */}
                            {!(gameDetails?.step.table_cards.length === 2 || gameDetails?.step.win) &&
                                !gameDetails?.step.player_call_3 &&
                                !gameDetails?.step.player_call_6 &&
                                !gameDetails?.step.player_call_9 &&
                                !gameDetails?.step.player_call_12 && (
                                    <button className="action-button-escape" onClick={handleEscape}>
                                        FUGIR ..
                                    </button>
                                )}
                        </div>
                    )}

                </div>)}
            {showWinnerPopup && (
                <div className="popup-game">
                    <p>
                        {winnerMessage.includes("NÓS") ? "O time " : ""}
                        {winnerMessage.includes("NÓS") && <span className="pop-team-name us">NÓS</span>}
                        {winnerMessage.includes("ELES") ? "O time " : ""}
                        {winnerMessage.includes("ELES") && <span className="pop-team-name them">ELES</span>}
                        {winnerMessage.includes("EMPATE") ? "EMPATE DA " : ""}
                        {winnerMessage.includes("JOGO") ? " ganhou o JOGO" : ""}
                        {winnerMessage.includes("partida") ? " ganhou a partida" : ""}
                    </p>
                </div>
            )}
            <>
                <br></br>
                <br></br>
            </>
            {(gameDetails?.protected === false || isPlayer) && (
                <div className="room-card-room">
                    <Chat
                        messages={gameDetails?.messages || []} roomUuid={gameDetails?.room_id || ''} game_chairs={{
                            chair_a: gameDetails?.chairs?.chair_a ?? null,
                            chair_b: gameDetails?.chairs?.chair_b ?? null,
                            chair_c: gameDetails?.chairs?.chair_c ?? null,
                            chair_d: gameDetails?.chairs?.chair_d ?? null,
                        }} />
                </div>
            )}
        </div>

    );
};

export default GameX2;
