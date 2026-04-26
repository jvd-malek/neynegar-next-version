import { getCookie } from 'cookies-next';

// "https://api.neynegar1.ir/graphql"
// "http://localhost:8159/graphql"

export const revalidateOneHour = { next: { revalidate: 3600 } }
export const noCaching = { cache: "no-store" }
export const revalidateOneHourByTags = (tags: string[]) => { return { next: { revalidate: 3600, tags } } }

export const fetcher = async (query: string, variables?: any, config?: any, jwt?: string) => {
    const clientjwt = getCookie("jwt") as string;
    const ValidJWT = jwt ? jwt : clientjwt
    try {
        const response = await fetch("https://api.neynegar1.ir/graphql", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(ValidJWT && { 'authorization': ValidJWT })
            },
            body: JSON.stringify({
                query,
                variables,
            }),
            ...config
        });

        const json = await response.json();

        if (json.errors) {
            console.error('GraphQL Errors:', json.errors);
            throw new Error(json.errors[0].message);
        }

        return json.data;
    } catch (error) {
        console.error('Fetcher Error:', error);
        return null
    }
};

export const imageUploader = async (body: FormData, jwt?: string) => {
    const clientjwt = getCookie("jwt") as string;
    const ValidJWT = jwt ? jwt : clientjwt
    try {
        const response = await fetch('https://api.neynegar1.ir/upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                ...(ValidJWT && { 'authorization': ValidJWT })
            },
            body
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`Failed to upload files: ${responseText}`);
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error('Fetcher Error:', error);
        return null
    }
};

