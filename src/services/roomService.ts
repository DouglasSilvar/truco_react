const BASE_URL = 'http://localhost:3000';

export const fetchRooms = async () => {
  const response = await fetch(`${BASE_URL}/rooms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar salas');
  }

  return response.json();
};

export const createRoom = async (roomName: string, playerUuid: string) => {
    const response = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_uuid: playerUuid,
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
