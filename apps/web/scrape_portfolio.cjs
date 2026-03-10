const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('Navigating to portfolio-details...');
    await page.goto('https://crossangleinterior.com/portfolio-details/', { waitUntil: 'networkidle' });

    const content = await page.evaluate(() => {
        // try to find the main content area
        const extractText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.innerText.trim() : null;
        };

        const extractImages = () => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.map(img => img.src).filter(src => src && !src.includes('logo'));
        };

        return {
            title: extractText('h1, .title, .portfolio-title'),
            text: extractText('main, article, .content-area, .portfolio-details-content') || document.body.innerText.substring(0, 1500),
            images: extractImages()
        };
    });

    console.log(JSON.stringify(content, null, 2));

    await browser.close();
})();
