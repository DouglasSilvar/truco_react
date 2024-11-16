import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoomDetails, playMove } from '../../services/gameService';
import './Game.css';

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
}

interface GameDetails {
    uuid: string;
    room_id: string;
    score_us: number;
    score_them: number;
    created_at: string;
    updated_at: string;
    room_name: string;
    end_game_win: number | null;
    chairs: {
        chair_a: string;
        chair_b: string;
        chair_c: string;
        chair_d: string;
    };
    step: StepDetails;
    owner: OWner;
}

interface OWner {
    name: string;
}

const Game: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [isEncobrir, setIsEncobrir] = useState(false);
    const [showWinnerPopup, setShowWinnerPopup] = useState<boolean>(false);
    const [winnerMessage, setWinnerMessage] = useState<string>('');


    useEffect(() => {
        const loadGameDetails = async () => {
            try {
                const data = await fetchRoomDetails(uuid!);
                console.log(data);
                setGameDetails(data);

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
                    const name = localStorage.getItem('user_name');
                    const { chair_a, chair_b, chair_c, chair_d } = data.chairs || {};
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

        return (
            <span className={isRedSuit ? 'card red-suit' : 'card'}>
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
    const playerCards = gameDetails?.step.cards_chair_a.length ? gameDetails.step.cards_chair_a :
        gameDetails?.step.cards_chair_b.length ? gameDetails.step.cards_chair_b :
            gameDetails?.step.cards_chair_c.length ? gameDetails.step.cards_chair_c :
                gameDetails?.step.cards_chair_d.length ? gameDetails.step.cards_chair_d : [];

    const name = localStorage.getItem('user_name');
    const { chair_a, chair_b, chair_c, chair_d } = gameDetails?.chairs || {};

    const getChairPositions = () => {
        if (name === chair_a) {
            return { bottom: chair_a, left: chair_c, top: chair_b, right: chair_d };
        }
        if (name === chair_b) {
            return { bottom: chair_b, left: chair_d, top: chair_a, right: chair_c };
        }
        if (name === chair_c) {
            return { bottom: chair_c, left: chair_b, top: chair_d, right: chair_a };
        }
        if (name === chair_d) {
            return { bottom: chair_d, left: chair_a, top: chair_c, right: chair_b };
        }
        return { bottom: '', left: '', top: '', right: '' }; // Caso o usuário não esteja em nenhuma das cadeiras
    };

    const chairPositions = getChairPositions();
    const isPlayerTurn = gameDetails?.step.player_time === name;

    const playTheCard = async (card: string, encoberta: boolean) => {
        console.log('Encobrir:', isEncobrir);
        if (!gameDetails) return;
        if (encoberta) toggleEncobrir();
        console.log('Encobrir:', isEncobrir);
        await playMove(gameDetails.uuid, card, encoberta, null, null, null)
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
            playMove(gameDetails.uuid, null, null, null, null, callValue)
                .then(response => {
                    console.log(`Trucada chamada com valor ${callValue}:`, response);
                })
                .catch(error => {
                    console.error(`Erro ao chamar trucada com valor ${callValue}:`, error);
                });
        }
    };

    const collectCards = async () => {
        if (!gameDetails) return;

        try {
            const response = await playMove(gameDetails.uuid, null, null, null, true, null);
            console.log('Cartas recolhidas com sucesso:', response);
        } catch (error) {
            console.error('Erro ao recolher as cartas:', error);
        }
    };

    const renderTableCards = () => {
        // Pega a posição atual do jogador na mesa
        if (!gameDetails) return null;

        // Define a ordem das posições anti-horárias, iniciando do jogador atual
        const positionOrderA = {
            bottom: ['bottom-right', 'top-right', 'top-left', 'bottom-left'],
            right: ['top-left', 'bottom-left', 'bottom-right', 'top-right'],
            top: ['top-right', 'top-left', 'bottom-left', 'bottom-right'],
            left: ['bottom-left', 'bottom-right', 'top-right', 'top-left']
        };

        const positionOrderD = {
            left: ['bottom-right', 'top-right', 'top-left', 'bottom-left'],
            bottom: ['top-right', 'top-left', 'bottom-left', 'bottom-right'],
            right: ['bottom-left', 'bottom-right', 'top-right', 'top-left'],
            top: ['top-left', 'bottom-left', 'bottom-right', 'top-right']
        };

        const positionOrderB = {
            top: ['bottom-left', 'bottom-right', 'top-right', 'top-left'],
            left: ['top-right', 'top-left', 'bottom-left', 'bottom-right'],
            bottom: ['top-left', 'bottom-left', 'bottom-right', 'top-right'],
            right: ['bottom-right', 'top-right', 'top-left', 'bottom-left']
        };

        const positionOrderC = {
            right: ['top-right', 'top-left', 'bottom-left', 'bottom-right'],
            top: ['bottom-right', 'top-right', 'top-left', 'bottom-left'],
            left: ['top-left', 'bottom-left', 'bottom-right', 'top-right'],
            bottom: ['bottom-left', 'bottom-right', 'top-right', 'top-left']
        };

        const firstCardOrigin = gameDetails.step.first_card_origin;
        const originChair = firstCardOrigin ? firstCardOrigin.split('---')[1] : null;

        // Define a ordem de posições baseada na cadeira de origem da primeira carta
        const getPositionOrder = () => {
            switch (originChair) {
                case 'chair_a':
                    return positionOrderA;
                case 'chair_b':
                    return positionOrderB;
                case 'chair_c':
                    return positionOrderC;
                case 'chair_d':
                    return positionOrderD;
                default:
                    return positionOrderA; // Caso padrão, se a origem não for identificada
            }
        };

        const positionOrder = getPositionOrder();
        const currentPlayerPosition = name === chair_a ? 'bottom' :
            name === chair_b ? 'right' :
                name === chair_c ? 'top' :
                    name === chair_d ? 'left' : null;

        const cardPositions = positionOrder[currentPlayerPosition || 'bottom'];

        // Renderiza as cartas na mesa seguindo a ordem definida
        return gameDetails.step.table_cards.map((card, index) => (
            <div key={index} className={`table-card ${cardPositions[index]}`}>
                {formatCard(card)}
            </div>
        ));
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="game-container">
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
                <div className={`chair bottom ${chairPositions.bottom === chair_a || chairPositions.bottom === chair_b ? 'team-us' : 'team-them'} ${chairPositions.bottom === gameDetails?.step.player_time ? 'current-turn' : ''}`}>
                    <div className="chair-content">
                        <div className={`team-name ${chairPositions.bottom === chair_a || chairPositions.bottom === chair_b ? 'us' : 'them'}`}>
                            {chairPositions.bottom === chair_a || chairPositions.bottom === chair_b ? 'NÓS' : 'ELES'}
                        </div>
                        <div>{chairPositions.bottom || 'A'}</div>
                    </div>
                </div>
                <div className={`chair left ${chairPositions.left === chair_a || chairPositions.left === chair_b ? 'team-us' : 'team-them'} ${chairPositions.left === gameDetails?.step.player_time ? 'current-turn' : ''}`}>
                    <div className="chair-content">
                        <div className={`team-name ${chairPositions.left === chair_a || chairPositions.left === chair_b ? 'us' : 'them'}`}>
                            {chairPositions.left === chair_a || chairPositions.left === chair_b ? 'NÓS' : 'ELES'}
                        </div>
                        <div>{chairPositions.left || 'C'}</div>
                    </div>
                </div>
                <div className={`chair top ${chairPositions.top === chair_a || chairPositions.top === chair_b ? 'team-us' : 'team-them'} ${chairPositions.top === gameDetails?.step.player_time ? 'current-turn' : ''}`}>
                    <div className="chair-content">
                        <div className={`team-name ${chairPositions.top === chair_a || chairPositions.top === chair_b ? 'us' : 'them'}`}>
                            {chairPositions.top === chair_a || chairPositions.top === chair_b ? 'NÓS' : 'ELES'}
                        </div>
                        <div>{chairPositions.top || 'B'}</div>
                    </div>
                </div>
                <div className={`chair right ${chairPositions.right === chair_a || chairPositions.right === chair_b ? 'team-us' : 'team-them'} ${chairPositions.right === gameDetails?.step.player_time ? 'current-turn' : ''}`}>
                    <div className="chair-content">
                        <div className={`team-name ${chairPositions.right === chair_a || chairPositions.right === chair_b ? 'us' : 'them'}`}>
                            {chairPositions.right === chair_a || chairPositions.right === chair_b ? 'NÓS' : 'ELES'}
                        </div>
                        <div>{chairPositions.right || 'D'}</div>
                    </div>
                </div>
            </div>
            {/* Painel do jogador com cartas */}
            <div className="player-panel">
                <div className="card-container">
                    {playerCards.map((card, index) => (
                        <div
                        key={index}
                        className={`card ${!isPlayerTurn || gameDetails?.step.table_cards.length === 4 ? 'disabled' : ''}`}
                        onClick={() => isPlayerTurn && gameDetails?.step.table_cards.length < 4 && playTheCard(card, isEncobrir)}
                        style={{ cursor: (isPlayerTurn && gameDetails?.step.table_cards.length < 4) ? 'pointer' : 'default' }}
                    >
                        {formatCard(card)}
                        {isEncobrir && <img src="/rails.png" alt="Encobrir" className="card-overlay" />}
                    </div>
                    
                    ))}
                </div>

                {/* Botões embaixo das cartas */}
                <div className="action-buttons">
                    {gameDetails?.step.table_cards.length === 4 && gameDetails?.owner?.name === name && (
                        <button className="action-button" onClick={collectCards}>
                            Recolher Cartas
                        </button>
                    )}
                    <button
                        className="action-button"
                        onClick={toggleEncobrir}
                        disabled={
                            !gameDetails?.step.first || // Condição 1: `step.first` deve ter algum valor
                            gameDetails?.step.table_cards.length < 1 || // Condição 2: `table_cards` deve ter pelo menos 1 item
                            !isPlayerTurn || // Condição 3: Deve ser a vez do jogador
                            (!!gameDetails?.step.first && !!gameDetails?.step.second && gameDetails?.step.table_cards.length === 0) // Nova condição com coerção para boolean
                        }
                    >
                        {isEncobrir ? "Encobrir (Ativo)" : "Encobrir"}
                    </button>
                    <button
                        className="action-button"
                        onClick={handleTrucar}
                        disabled={
                            gameDetails?.step.player_call_3 !== null &&
                            gameDetails?.step.player_call_6 !== null &&
                            gameDetails?.step.player_call_9 !== null &&
                            gameDetails?.step.player_call_12 !== null ||
                            !isPlayerTurn
                        }
                    >
                        Trucar
                    </button>
                    <button className="action-button" disabled={!isPlayerTurn}>
                        Correr
                    </button>
                </div>
            </div>
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
        </div>
    );
};

export default Game;
