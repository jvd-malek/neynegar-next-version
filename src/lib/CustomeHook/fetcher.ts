export const fetcher = async (query: string, jwt?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (jwt) {
    headers['authorization'] = jwt;
  }

  const response = await fetch(`http://localhost:4000/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
    }),
  });

  const json = await response.json();
  
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
};