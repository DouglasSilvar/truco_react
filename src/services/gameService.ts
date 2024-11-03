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

export const playMove = async (
  gameUuid: string,
  card: string | null = null,
  coverup: boolean | null = null,
  accept: boolean | null = null,
  collect: boolean | null = null,
  call: number | null = null
) => {
  const response = await fetch(`${BASE_URL}/games/${gameUuid}/play_move`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      card: card,
      coverup: coverup,
      accept: accept,
      collect: collect,
      call: call
    })
  });

  if (!response.ok) {
    throw new Error('Erro ao realizar o movimento');
  }

  return response.json();
};