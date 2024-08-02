import {Builder} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const scrapper = async (callback: (...args: any[]) => Promise<any>, ...callbackArgs: any[]): Promise<any> => {
    const setting = await prisma.setting.findFirst({
        where: { status: 'active' }
    });

    if (!setting) {
        throw new Error('No active setting found');
    }

    let options = new chrome.Options();
    options.addArguments('headless'); // Uncomment this if you want to run in headless mode
    options.addArguments('disable-gpu');
    options.addArguments('no-sandbox');
    options.addArguments('disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.get(setting.domainUrl);
        return await driver.executeScript(callback, ...callbackArgs);
    } finally {
        await driver.quit();
        await prisma.$disconnect(); // Close the Prisma Client connection
    }
};
export default scrapper;
