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

    return (
        <div className="game-container">
            <div className="game-table">
                <div className="vira-card">
                    <span className="card-value">{gameDetails?.step.vira?.slice(0, -1) || ''}</span>
                    <span className="card-suit">{formatSuitSymbol(gameDetails?.step.vira?.slice(-1) || '')}</span>
                </div>

                {/* Cadeiras ao redor da mesa */}
                <div className="chair chair-a">{gameDetails?.chairs.chair_a || 'A'}</div>
                <div className="chair chair-b">{gameDetails?.chairs.chair_b || 'B'}</div>
                <div className="chair chair-c">{gameDetails?.chairs.chair_c || 'C'}</div>
                <div className="chair chair-d">{gameDetails?.chairs.chair_d || 'D'}</div>
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
