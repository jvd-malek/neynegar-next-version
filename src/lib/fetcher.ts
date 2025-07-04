import { getCookie } from 'cookies-next';

export const fetcher = async (query: string, variables?: any) => {
    const jwt = getCookie("jwt") as string;

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(jwt && { 'authorization': jwt })
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const json = await response.json();

        if (json.errors) {
            console.error('GraphQL Errors:', json.errors);
            throw new Error(json.errors[0].message);
        }

        return json.data;
    } catch (error) {
        console.error('Fetcher Error:', error);
        throw error;
    }
}; 