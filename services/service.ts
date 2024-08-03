import { History, Image, PrismaClient, Setting } from '@prisma/client'
import scrapper from '../utils/scrapper'

const prisma = new PrismaClient()

export const getListImage = async (
    keyword: string
): Promise<{
    data: Image[]
    meta: {
        keyword: string
        limit: number
        skip: number
        total: number
    }
}> => {
    // Fetch the active setting
    const setting: Setting | null = await prisma.setting.findFirst({
        where: { status: 'active' },
    })

    if (!setting) {
        throw new Error('No active setting found')
    }

    // Fetch or create history
    let history: History | null = await prisma.history.findFirst({
        where: { keyword },
    })

    if (!history) {
        history = await prisma.history.create({
            data: { keyword },
        })
    } else {
        history = await prisma.history.update({
            where: { id: history.id },
            data: { skip: history.skip + history.limit },
        })
    }

    const callback = (
        keyword: string,
        limit: number,
        skip: number,
        setting: Setting
    ) => {
        return fetch(
            `${setting.apiUrl}/post/search?limit=${limit}&skip=${skip}&searchQuery=${keyword}`,
            {
                headers: {
                    'X-Origin': setting.domainUrl,
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.json()
            })
            .then((data) => data.results)
            .catch((error) => {
                console.error(
                    'There was a problem with the fetch operation:',
                    error
                )
                return []
            })
    }

    // Use scrapper function
    const images = await scrapper(
        callback,
        keyword,
        history.limit,
        history.skip,
        setting
    )

    let newImages: Image[] = []
    if (images.length > 0) {
        const imageObjects = images.map((image: any) => ({
            id: image._id,
            imageUrl: image.imageUrl,
            author: image.author ?? null,
            generator: image.generator ?? null,
        }))

        newImages = await saveImages(imageObjects)
    }

    await prisma.$disconnect()
    return {
        data: newImages,
        meta: {
            keyword: history.keyword,
            limit: history.limit,
            skip: history.skip,
            total: images.length,
        },
    }
}

const saveImages = async (images: any[]): Promise<Image[]> => {
    // Step 1: Fetch existing image IDs
    const existingImages = await prisma.image.findMany({
        where: {
            id: { in: images.map((image) => image.id) },
        },
        select: { id: true },
    })

    const existingImageIds = new Set(existingImages.map((image) => image.id))

    // Step 2: Filter out images that already exist
    const newImages = images.filter((image) => !existingImageIds.has(image.id))

    // Step 3: Insert only new records
    if (newImages.length > 0) {
        await prisma.image.createMany({
            data: newImages,
        })
    }

    // Return only new images
    return newImages
}

export const getDetailImage = async (id: string): Promise<{ data: any }> => {
    // Fetch the active setting
    const setting: Setting | null = await prisma.setting.findFirst({
        where: { status: 'active' },
    })

    if (!setting) {
        throw new Error('No active setting found')
    }
    const callback = (id: string, setting: Setting) => {
        const fullUrl = `${setting.apiUrl}/post/${id}`
        return fetch(`${fullUrl}`, {
            headers: {
                'X-Origin': setting.domainUrl,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.json()
            })
            .catch((error) => {
                console.error(
                    'There was a problem with the fetch operation:',
                    error
                )
                return []
            })
    }
    // Use scrapper function
    const image = await scrapper(callback, id, setting)
    await prisma.$disconnect()
    return {
        data: image,
    }
}
