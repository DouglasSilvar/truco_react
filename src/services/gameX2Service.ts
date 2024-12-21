const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

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
  const response = await fetch(`${BASE_URL}/gamesx2/${gameUuid}`, {
    method: 'GET',
    headers: getUserHeaders(),
  });

  if (response.status === 404) {
    throw new Error('RoomNotFound');
  }

  if (response.status === 401) {
    window.location.href = '/';
  }

  if (!response.ok) {
    throw new Error('Erro ao buscar os detalhes da sala');
  }

  return response.json();
};

export const playMove = async (
  gameUuid: string,
  card: string | null = null,
  coverup: boolean | null = null
) => {
  const response = await fetch(`${BASE_URL}/gamesx2/${gameUuid}/play_move`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      card: card,
      coverup: coverup
    })
  });

  if (!response.ok) {
    throw new Error('Erro ao realizar o movimento');
  }

  return response.json();
};

export const collectCards = async (
  gameUuid: string,
) => {
  const response = await fetch(`${BASE_URL}/gamesx2/${gameUuid}/collect`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      collect: true
    })
  });

  if (!response.ok) {
    throw new Error('Erro ao realizar o movimento');
  }

  return response.json();
};
export const trucarAccept = async (
  gameUuid: string,
  accept: boolean | null = null,
  call: number | null = null
) => {
  const response = await fetch(`${BASE_URL}/gamesx2/${gameUuid}/call`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      accept: accept,
      call: call
    })
  });

  if (!response.ok) {
    throw new Error('Erro ao realizar o movimento');
  }

  return response.json();
};
