import { Builder, WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
let driver: WebDriver | null = null

const getDriver = async () => {
    if (driver) return driver
    let options = new chrome.Options()
    options.addArguments('headless') // Uncomment this if you want to run in headless mode
    options.addArguments('disable-gpu')
    options.addArguments('no-sandbox')
    options.addArguments('disable-dev-shm-usage')

    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build()

    return driver
}

const scrapper = async (
    callback: (...args: any[]) => Promise<any>,
    ...callbackArgs: any[]
): Promise<any> => {
    const setting = await prisma.setting.findFirst({
        where: { status: 'active' },
    })

    if (!setting) {
        throw new Error('No active setting found')
    }

    const driver = await getDriver()
    try {
        await driver.get(setting.domainUrl)
        return await driver.executeScript(callback, ...callbackArgs)
    } finally {
        // Remove this line to keep the session open
        // await driver.quit();
    }
}

// Make sure to close the driver when the application ends or after a set time
const closeDriver = async () => {
    if (driver) {
        await driver.quit()
        driver = null
    }
    await prisma.$disconnect() // Close the Prisma Client connection
}

process.on('exit', closeDriver)
process.on('SIGINT', closeDriver)
process.on('SIGTERM', closeDriver)

export default scrapper
