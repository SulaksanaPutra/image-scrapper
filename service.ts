import {History, Image, PrismaClient, Setting} from '@prisma/client';
import scrapper from './utils/scrapper';

const prisma = new PrismaClient();

export const getListImage = async (keyword: string): Promise<{ data: Image[], meta: History }> => {
    // Fetch the active setting
    const setting: Setting | null = await prisma.setting.findFirst({
        where: { status: 'active' }
    });

    if (!setting) {
        throw new Error('No active setting found');
    }

    // Fetch or create history
    let history: History | null = await prisma.history.findFirst({
        where: { keyword }
    });

    if (!history) {
        history = await prisma.history.create({
            data: { keyword }
        });
    }

    const request = {
        keyword: history.keyword,
        limit: history.limit,
        skip: history.skip,
    };

    const callback = async () : Promise<Image[]> => {
        try {
            const query = new URLSearchParams(request as any);
            const fullUrl = `${setting.apiUrl}/post/search?${query.toString()}`;
            const response = await fetch(fullUrl, { headers: { 'X-Origin': setting.domainUrl } });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return []; // Return an empty array in case of error
        }
    };

    // Use scrapper function
    const images = await scrapper(callback);

    if (images.length > 0) {
        await prisma.image.createMany({ data: images });
    }
    await prisma.$disconnect();
    return {
        data: images,
        meta: history
    };
};


export const getDetailImage = async (id: string): Promise<{ data: any }> => {
    // Fetch the active setting
    const setting: Setting | null = await prisma.setting.findFirst({
        where: { status: 'active' }
    });

    if (!setting) {
        throw new Error('No active setting found');
    }

    const callback = async () : Promise<Image[]> => {
        try {
            const fullUrl = `${setting.apiUrl}/post/view?${id}`;
            const response = await fetch(fullUrl, { headers: { 'X-Origin': setting.domainUrl } });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return []; // Return an empty array in case of error
        }
    };

    // Use scrapper function
    const image = await scrapper(callback);
    await prisma.$disconnect();

    return {
        data: image,
    };
};

