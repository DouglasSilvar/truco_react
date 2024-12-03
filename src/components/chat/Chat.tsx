import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';
import { sendMessage } from '../../services/roomService';

interface Message {
  player_name: string;
  date_created: string;
  content: string;
}

interface ChatProps {
  messages: Message[];
  roomUuid: string;
  game_chairs: {
    chair_a: string | null;
    chair_b: string | null;
    chair_c: string | null;
    chair_d: string | null;
  };
}

const Chat: React.FC<ChatProps> = ({ messages, roomUuid, game_chairs }) => {
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const name = localStorage.getItem('user_name');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);
  };

  const handleSendMessage = async () => {
    if (messageContent.trim() !== '') {
      try {
        await sendMessage(roomUuid, messageContent);
        setMessageContent('');
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
        setError('Erro ao enviar mensagem');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
  );

  const getPlayerTeamColor = (playerName: string): string => {
    if (
      playerName === game_chairs.chair_a ||
      playerName === game_chairs.chair_b
    ) {
      return '#6897bb'; // Time NOS
    }
    if (
      playerName === game_chairs.chair_c ||
      playerName === game_chairs.chair_d
    ) {
      return '#2e86ab'; // Time ELES
    }
    return '#000'; // Cor padrão (caso o jogador não esteja em nenhuma cadeira)
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sortedMessages]);

  return (
    <div className="chat-container">
      {/* Quadro de mensagens */}
      <div className="chat-messages-container">
        {sortedMessages.map((message, index) => {
          const isOwnMessage = message.player_name === name;
          const playerColor = getPlayerTeamColor(message.player_name);
          const teamClass =
            message.player_name === game_chairs.chair_a || message.player_name === game_chairs.chair_b
              ? 'team-nos'
              : 'team-eles';
  
          return (
            <div
              key={index}
              className={`chat-message-item ${isOwnMessage ? 'chat-message-own' : ''}`}
            >
              <div
                className={`chat-message-content ${teamClass}`}
                style={{
                  border: `2px solid ${playerColor}`, // Borda do time
                }}
              >
                <span className="chat-player-name" style={{ color: playerColor }}>
                  {message.player_name}
                </span>
                <div>{message.content}</div>
              </div>
            </div>
          );
        })}
      </div>
  
      {/* Exibe erro, se existir */}
      {error && <div className="chat-error">{error}</div>}
  
      {/* Campo de input e botão de envio */}
      {name === game_chairs.chair_a ||
      name === game_chairs.chair_b ||
      name === game_chairs.chair_c ||
      name === game_chairs.chair_d ? (
        <>
          <div className="chat-message-input-container">
            <input
              type="text"
              className="chat-message-input"
              placeholder="Digite sua mensagem..."
              value={messageContent}
              maxLength={256}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />
            <button className="chat-send-button" onClick={handleSendMessage}>
              Enviar
            </button>
          </div>
          <div className="chat-character-counter">
            {messageContent.length}/256
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Chat;
