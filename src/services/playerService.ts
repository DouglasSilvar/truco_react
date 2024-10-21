const BASE_URL = 'http://localhost:3000';

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