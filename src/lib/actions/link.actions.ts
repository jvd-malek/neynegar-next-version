// lib/actions/link.actions.ts
'use server'; // علامت‌گذاری به عنوان Server Action
import linkModel from '@/lib/DB/model/linkModel';
import dbConnect from '../DB/db';

export async function getLinks() {
    try {
        await dbConnect()
        const links = await linkModel.find({}).lean();
        return JSON.parse(JSON.stringify(links));
    } catch (error) {
        console.error('Error fetching links:', error);
        return [];
    }
}