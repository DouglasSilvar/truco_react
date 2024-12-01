import React, { useState } from 'react';
import './Chat.css';
import { sendMessage } from '../../services/roomService'; // Importa o método

interface Message {
  player_name: string;
  date_created: string;
  content: string;
}

interface ChatProps {
  messages: Message[];
  roomUuid: string; // UUID da sala
}

const Chat: React.FC<ChatProps> = ({ messages, roomUuid }) => {
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState<string | null>(null); // Gerencia erros de envio
  const name = localStorage.getItem('user_name');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value);
  };

  const handleSendMessage = async () => {
    if (messageContent.trim() !== '') {
      try {
        await sendMessage(roomUuid, messageContent); // Envia a mensagem para a API
        setMessageContent(''); // Limpa o campo de texto
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
        setError('Erro ao enviar mensagem'); // Atualiza o estado de erro
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      {/* Quadro de mensagens */}
      <div className="chat-messages-container">
        {messages.map((message, index) => {
          const isOwnMessage = message.player_name === name;

          return (
            <div
              key={index}
              className={`chat-message-item ${
                isOwnMessage ? 'chat-message-own' : ''
              }`}
            >
              {!isOwnMessage && (
                <span className="chat-player-name">
                  {message.player_name}:
                </span>
              )}
              <div className={`chat-message-content ${isOwnMessage ? 'own-bubble' : ''}`}>
                {message.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exibe erro, se existir */}
      {error && <div className="chat-error">{error}</div>}

      {/* Campo de input para nova mensagem */}
      <div className="chat-message-input-container">
        <input
          type="text"
          className="chat-message-input"
          placeholder="Digite sua mensagem..."
          value={messageContent}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <button className="chat-send-button" onClick={handleSendMessage}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
