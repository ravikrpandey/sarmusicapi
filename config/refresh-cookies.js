const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const COOKIES_FILE = path.resolve(__dirname, 'cookies.txt');
const LOGIN_URL = 'https://accounts.google.com/signin/v2/identifier?service=youtube';

async function exportCookiesToNetscapeFormat(cookies) {
    let output = `# Netscape HTTP Cookie File\n# Generated for yt-dlp\n\n`;
    for (const cookie of cookies) {
        const domain = cookie.domain.startsWith('.') ? cookie.domain : '.' + cookie.domain;
        const flag = cookie.hostOnly ? 'FALSE' : 'TRUE';
        const pathVal = cookie.path;
        const secure = cookie.secure ? 'TRUE' : 'FALSE';
        const expiration = cookie.expires ? Math.floor(new Date(cookie.expires).getTime() / 1000) : 2147483647;
        const name = cookie.name;
        const value = cookie.value;

        output += [domain, flag, pathVal, secure, expiration, name, value].join('\t') + '\n';
    }

    return output;
}

async function refreshCookies() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--user-data-dir=./puppeteer-profile' // persistent profile to avoid layout shifts
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });

    // Center the email input
    await page.waitForSelector('input[type="email"]', { visible: true });
    await page.evaluate(() => {
        const el = document.querySelector('input[type="email"]');
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'center' });
    });

    console.log('⏳ Please login manually in the opened browser...');
    await page.waitForTimeout(60000); // wait 60s for manual login

    const cookies = await page.cookies();
    const netscapeCookies = await exportCookiesToNetscapeFormat(cookies);

    fs.writeFileSync(COOKIES_FILE, netscapeCookies);
    console.log(`✅ Cookies saved to ${COOKIES_FILE}`);

    await browser.close();
}

// Run the function if this file is executed directly
if (require.main === module) {
    refreshCookies().catch(console.error);
}

// Export the function to use elsewhere
module.exports = { refreshCookies };
