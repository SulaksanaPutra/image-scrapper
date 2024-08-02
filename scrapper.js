const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { db, resultsDb } = require('./db'); // Import lowdb instances

const scrapper = async (injectionScript, domainUrl, ...scriptArgs) => {
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
        await driver.get(domainUrl);
        const results = await driver.executeScript(injectionScript, ...scriptArgs);
        return results;
    } finally {
        await driver.quit();
    }
};
