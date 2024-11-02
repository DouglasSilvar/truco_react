import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRoomDetails } from '../../services/gameService';
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
}

interface GameDetails {
    uuid: string;
    room_id: string;
    score_us: number;
    score_them: number;
    created_at: string;
    updated_at: string;
    room_name: string;
    chairs: {
        chair_a: string;
        chair_b: string;
        chair_c: string;
        chair_d: string;
    };
    step: StepDetails;
}

const Game: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadGameDetails = async () => {
            try {
                const data = await fetchRoomDetails(uuid!);
                setGameDetails(data);
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

        loadGameDetails();
    }, [uuid, navigate]);

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Função para formatar as cartas com os símbolos corretos e cores específicas para naipes
    const formatCard = (card: string) => {
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
        <span className={`round-result ${gameDetails?.step.first === 'US' ? 'us' : 'them'}`}>
            {gameDetails?.step.first === 'US' ? 'NÓS' : gameDetails?.step.first === 'THEM' ? 'ELES' : ' '}
        </span>
    </div>
    <div className="round-field">
        <span>Segunda:</span>
        <span className={`round-result ${gameDetails?.step.second === 'US' ? 'us' : 'them'}`}>
            {gameDetails?.step.second === 'US' ? 'NÓS' : gameDetails?.step.second === 'THEM' ? 'ELES' : ' '}
        </span>
    </div>
</div>
            </div>
            
            <div className="game-table">
    <div className="vira-card">
        <span className="card-value">{gameDetails?.step.vira?.slice(0, -1) || ''}</span>
        <span className="card-suit">{formatSuitSymbol(gameDetails?.step.vira?.slice(-1) || '')}</span>
    </div>

    {/* Cadeiras ao redor da mesa com posições dinâmicas */}
    <div className={`chair bottom ${chairPositions.bottom === chair_a || chairPositions.bottom === chair_b ? 'team-us' : 'team-them'}`}>
        <div className="chair-content">
            <div className={`team-name ${chairPositions.bottom === chair_a || chairPositions.bottom === chair_b ? 'us' : 'them'}`}>
                {chairPositions.bottom === chair_a || chairPositions.bottom === chair_b ? 'NÓS' : 'ELES'}
            </div>
            <div>{chairPositions.bottom || 'A'}</div>
        </div>
    </div>
    <div className={`chair left ${chairPositions.left === chair_a || chairPositions.left === chair_b ? 'team-us' : 'team-them'}`}>
        <div className="chair-content">
            <div className={`team-name ${chairPositions.left === chair_a || chairPositions.left === chair_b ? 'us' : 'them'}`}>
                {chairPositions.left === chair_a || chairPositions.left === chair_b ? 'NÓS' : 'ELES'}
            </div>
            <div>{chairPositions.left || 'C'}</div>
        </div>
    </div>
    <div className={`chair top ${chairPositions.top === chair_a || chairPositions.top === chair_b ? 'team-us' : 'team-them'}`}>
        <div className="chair-content">
            <div className={`team-name ${chairPositions.top === chair_a || chairPositions.top === chair_b ? 'us' : 'them'}`}>
                {chairPositions.top === chair_a || chairPositions.top === chair_b ? 'NÓS' : 'ELES'}
            </div>
            <div>{chairPositions.top || 'B'}</div>
        </div>
    </div>
    <div className={`chair right ${chairPositions.right === chair_a || chairPositions.right === chair_b ? 'team-us' : 'team-them'}`}>
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
                {playerCards.map((card, index) => (
                    <div key={index} className="card">
                        {formatCard(card)}
                    </div>
                ))}
            </div>
        </div>
    );
    

};

export default Game;
