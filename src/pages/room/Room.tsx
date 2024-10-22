import React, { useEffect, useState } from 'react';
import Bar from '../../components/bar/Bar';
import { useParams } from 'react-router-dom';
import './Room.css';

interface RoomDetails {
  uuid: string;
  name: string;
  players_count: number;
  owner: {
    name: string;
  };
}

const Room: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/rooms/${uuid}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar os detalhes da sala');
        }
        const data = await response.json();
        setRoomDetails(data);
      } catch (error) {
        setError('Erro ao carregar a sala');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [uuid]);

  if (loading) {
    return <div className="room">Carregando...</div>;
  }

  if (error) {
    return <div className="room">{error}</div>;
  }

  return (
    <div className="room">
      <Bar />
      {roomDetails && (
        <div className="room-details">
          <h2>{roomDetails.name}</h2>
          <p>Dono: {roomDetails.owner.name}</p>
          <p>Jogadores na sala: {roomDetails.players_count}</p>
        </div>
      )}
    </div>
  );
};

export default Room;
