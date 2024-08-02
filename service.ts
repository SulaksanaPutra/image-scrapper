import { PrismaClient, Setting, History, Image } from '@prisma/client';
import scrapper from './utils/scrapper';

const prisma = new PrismaClient();

interface HistoryWithLimitAndPage extends History {
    limit: number;
    page: number;
}

const getListImage = async (keyword: string): Promise<{ data: Image[], meta: History }> => {
    // Fetch the active setting
    const setting: Setting | null = await prisma.setting.findFirst({
        where: { status: 'active' }
    });

    if (!setting) {
        throw new Error('No active setting found');
    }

    // Fetch or create history
    let history: HistoryWithLimitAndPage | null = await prisma.history.findFirst({
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
        skip: history.page,
    };

    const callback = async () => {
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

export default getListImage;

//
// const getDetailImage = () =>{
//     return scrapper(async ({id}) => {
//     try {
//         const fullUrl = `${apiUrl}/post/detail` + encodeURIComponent(request)
//         const response = await fetch(fullUrl, {
//             headers: {
//                 'X-Origin': domainUrl
//             }
//         });
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         return data.results;
//     } catch (error) {
//         console.error('There was a problem with the fetch operation:', error);
//         return {};
//     }
// }, domainUrl, {id});
// }
