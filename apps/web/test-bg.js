import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/admin/estimator/rates', { waitUntil: 'networkidle' });

    const colors = await page.evaluate(() => {
        const getBg = (selector) => {
            const el = document.querySelector(selector);
            return el ? window.getComputedStyle(el).backgroundColor : 'not found';
        };
        const getClass = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.className : 'not found';
        };
        return {
            html_class: document.documentElement.className,
            body: getBg('body'),
            root: getBg('#root'),
            sidebarWrapper: getBg('.group\\/sidebar-wrapper'),
            main: getBg('main'),
            slate950: getBg('.bg-slate-950'),
            html_bg: getBg('html')
        };
    });

    console.log("BACKGROUND COLORS:", colors);
    await browser.close();
})();
