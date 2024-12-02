const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

// Função para obter name e uuid do localStorage
const getUserHeaders = () => {
  const name = localStorage.getItem('user_name');
  const uuid = localStorage.getItem('user_uuid');
  
  return {
    'Content-Type': 'application/json',
    'name': name ? name : '',
    'uuid': uuid ? uuid : ''
  };
};

export const fetchRooms = async (page: number = 1) => {
  const response = await fetch(`${BASE_URL}/rooms?page=${page}`, {
    method: 'GET',
    headers: getUserHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar salas');
  }

  return response.json();
};


export const fetchRoomDetails = async (roomUuid: string) => {
  const response = await fetch(`${BASE_URL}/rooms/${roomUuid}`, {
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


export const createRoom = async (roomName: string, playerUuid: string, password?: string) => {
  const response = await fetch(`${BASE_URL}/rooms`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      player_uuid: playerUuid,
      password: password,
      room: {
        name: roomName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar a sala');
  }

  return response.json();
};

// Função para entrar em uma sala
export const joinRoom = async (roomUuid: string, playerUuid: string, password?: string) => {
  const response = await fetch(`${BASE_URL}/rooms/${roomUuid}/join`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      player_uuid: playerUuid,
      password: password,
    }),
  });

  if (response.status === 403) {
    return { status: 403 };  // Retorna o status 403 explicitamente
  }

  return response.json();
};


export const leaveRoom = async (roomUuid: string, playerUuid: string) => {
  const response = await fetch(`${BASE_URL}/rooms/${roomUuid}/leave`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      player_uuid: playerUuid,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao sair da sala');
  }

  return response.json();
};

export const changeChair = async (roomUuid: string, body: { player_name: string; chair_destination: string }) => {
  const response = await fetch(`${BASE_URL}/rooms/${roomUuid}/changechair`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      player_name: body.player_name,
      chair_destination: body.chair_destination,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao trocar de cadeira');
  }

  return response.json();
};

export const kickPlayer = async (roomUuid: string, playerName: string) => {
  const response = await fetch(`${BASE_URL}/rooms/${roomUuid}/kick`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      player_name: playerName,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao remover o jogador da sala');
  }

  return response.json();
};

export const setPlayerReady = async (roomUuid: string, readyStatus: boolean) => {
  const response = await fetch(`${BASE_URL}/rooms/${roomUuid}/ready/${readyStatus}`, {
    method: 'POST',
    headers: getUserHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao marcar como pronto');
  }

  return response.json();
};

export const startGame = async (roomUuid: string) => {
  const response = await fetch(`${BASE_URL}/rooms/${roomUuid}/start`, {
    method: 'POST',
    headers: getUserHeaders(),
  });

  if (!response.ok) {
    throw new Error('Erro ao marcar como pronto');
  }

  return response.json();
};

export const sendMessage = async (roomUuid: string, content: string) => {
  const response = await fetch(`${BASE_URL}/rooms/${roomUuid}/message`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({
      content: content,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao sair da sala');
  }

  return response.json();
};