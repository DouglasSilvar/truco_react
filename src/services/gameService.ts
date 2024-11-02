const BASE_URL = 'http://localhost:3000';

const getUserHeaders = () => {
  const name = localStorage.getItem('user_name');
  const uuid = localStorage.getItem('user_uuid');
  
  return {
    'Content-Type': 'application/json',
    'name': name ? name : '',
    'uuid': uuid ? uuid : ''
  };
};

export const fetchRoomDetails = async (gameUuid: string) => {
  const response = await fetch(`${BASE_URL}/games/${gameUuid}`, {
    method: 'GET',
    headers: getUserHeaders(),
  });

  if (response.status === 404) {
    throw new Error('RoomNotFound');
  }

  if (!response.ok) {
    throw new Error('Erro ao buscar os detalhes da sala');
  }

  return response.json();
};