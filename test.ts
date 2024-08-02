import { PrismaClient } from '@prisma/client';
import {getListImage, getDetailImage} from "./service";

const prisma = new PrismaClient();

const testGetListImage = async () => {
    try {
        // Setup: Insert a sample setting and history
        await prisma.setting.create({
            data: {
                status: 'active',
                apiUrl: 'https://example.com/api',
                domainUrl: 'https://example.com'
            }
        });
        // Call the function
        const result = await getListImage('pop');
        console.log('Result:', result);
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
};

testGetListImage();
