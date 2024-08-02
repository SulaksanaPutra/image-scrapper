import {History, Image, PrismaClient, Setting} from '@prisma/client';
import scrapper from './utils/scrapper';

const prisma = new PrismaClient();

export const getListImage = async (keyword: string): Promise<{ data: any[], meta: History }> => {
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

    const callback = (keyword : string, limit:number, skip:number, setting: Setting) => {
        return fetch(`${setting.apiUrl}/post/search?limit=${limit}&skip=${skip}&searchQuery=${keyword}`, {
            headers: {
                'X-Origin': setting.domainUrl
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const rows = data.results;
                const imagePromises = rows.map((row :any)  => {
                    return fetch(`${setting.apiUrl}/post/${row._id}`, {
                        headers: {
                            'X-Origin': setting.domainUrl
                        }
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(description => ({
                            header: row,
                            description: description
                        }));
                });
                return Promise.all(imagePromises);
            })
            .then(images => {
                // Process the images array as needed
                return images;
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                return [];
            });
    };
    // Use scrapper function
    const images = await scrapper(callback, keyword, history.limit, history.skip, setting);
    if (images.length > 0) {
        await prisma.image.createMany({
            data: images.map((image : any) => ({
                id: image._id,
                imageUrl: image.imageUrl,
                author: image.author ?? null,
                generator: image.generator ?? null,
            })),
        });
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
    const callback = (id: string, setting: Setting) => {
        const fullUrl = `${setting.apiUrl}/post/${id}`;
        return fetch(`${fullUrl}`, {
            headers: {
                'X-Origin': setting.domainUrl
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                return [];
            });
    };
    // Use scrapper function
    const image = await scrapper(callback, id, setting);
    await prisma.$disconnect();
    return {
        data: image,
    };
};

