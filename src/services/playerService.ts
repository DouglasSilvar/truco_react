const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

export const createPlayer = async (name: string) => {
  const response = await fetch(`${BASE_URL}/players`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  return response;
};

export const validatePlayer = async (name: string, uuid: string) => {
  const response = await fetch(`${BASE_URL}/players/valid`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'name': name,
      'uuid': uuid,
    },
  });
  return response;
};