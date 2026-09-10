import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const visited = new Set();
  const queue = ['http://localhost:8080/'];
  const brokenImages = [];
  
  console.log('Starting crawler...');
  
  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    
    console.log(`Visiting: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      
      // Auto-scroll to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 500;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if(totalHeight >= scrollHeight - window.innerHeight){
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
      
      // Give images a moment to load
      await page.waitForTimeout(2000);
      
      // Check images
      const imagesOnPage = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => ({
          src: img.src,
          alt: img.alt,
          broken: img.naturalWidth === 0
        }));
      });
      
      for (const img of imagesOnPage) {
        if (img.broken) {
          brokenImages.push({ page: url, src: img.src, alt: img.alt });
          console.log(`BROKEN IMAGE: ${img.src} on page ${url}`);
        }
      }
      
      // Find internal links
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => a.href)
          .filter(href => href.startsWith('http://localhost:8080/') && !href.includes('#'));
      });
      
      for (const link of links) {
        if (!visited.has(link) && !queue.includes(link)) {
          queue.push(link);
        }
      }
    } catch (e) {
      console.error(`Error visiting ${url}: ${e.message}`);
    }
  }
  
  console.log('--- SCAN COMPLETE ---');
  console.log(`Visited ${visited.size} pages.`);
  console.log(`Found ${brokenImages.length} broken images.`);
  console.dir(brokenImages, { depth: null });
  
  await browser.close();
})();
