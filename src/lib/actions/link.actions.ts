// lib/actions/link.actions.ts
'use server'; // علامت‌گذاری به عنوان Server Action
import { fetcher } from '@/lib/fetcher';

export async function getLinks() {
    try {
        const query = `
            query Links {
                links {
                    _id
                    txt
                    path
                    sort
                    subLinks {
                        link
                        path
                        brand
                    }
                    createdAt
                    updatedAt
                }
            }
        `;
        const data = await fetcher(query);
        return data.links || [];
    } catch (error) {
        console.error('Error fetching links:', error);
        return [];
    }
}