import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const viewports = [
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1366x768', width: 1366, height: 768 },
    { name: '1280x720', width: 1280, height: 720 },
    { name: '1024x768', width: 1024, height: 768 },
    { name: '820x1180', width: 820, height: 1180 },
    { name: '390x844', width: 390, height: 844 },
    { name: '375x667', width: 375, height: 667 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:8088/', { waitUntil: 'networkidle0' });
    const skipBtn = await page.$('#skipBootBtn');
    if (skipBtn) await skipBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const data = await page.evaluate(() => {
      const col = document.querySelector('.desktop-icons-col');
      const hero = document.querySelector('.desktop-hero');
      const icons = Array.from(document.querySelectorAll('.desktop-icon'));
      const heroTitle = document.querySelector('.hero-name');
      const heroRoles = document.querySelector('.hero-roles');
      const heroIntro = document.querySelector('.hero-intro');
      const heroActions = document.querySelector('.hero-actions');
      
      const colRect = col.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const iconRects = icons.map(i => ({ app: i.dataset.app, rect: i.getBoundingClientRect() }));
      
      // Check if any icon overlaps with heroRect
      const overlaps = iconRects.filter(i => {
        return !(i.rect.right <= heroRect.left || 
                 i.rect.left >= heroRect.right || 
                 i.rect.bottom <= heroRect.top || 
                 i.rect.top >= heroRect.bottom);
      });

      return {
        colRect: { left: Math.round(colRect.left), right: Math.round(colRect.right), width: Math.round(colRect.width), top: Math.round(colRect.top), bottom: Math.round(colRect.bottom) },
        heroRect: { left: Math.round(heroRect.left), right: Math.round(heroRect.right), width: Math.round(heroRect.width), top: Math.round(heroRect.top), bottom: Math.round(heroRect.bottom) },
        heroTitle: heroTitle.textContent.trim(),
        heroTitleRect: { width: Math.round(heroTitle.getBoundingClientRect().width), height: Math.round(heroTitle.getBoundingClientRect().height) },
        overlaps: overlaps.map(o => ({ app: o.app, iconRight: o.rect.right, heroLeft: heroRect.left }))
      };
    });

    console.log(`[${vp.name}] Col: [${data.colRect.left}, ${data.colRect.right}], Hero: [${data.heroRect.left}, ${data.heroRect.right}], Overlaps: ${data.overlaps.length}, Title: ${data.heroTitleRect.width}x${data.heroTitleRect.height}`);
    await page.screenshot({ path: `screenshots/desktop-fix-${vp.name}.png` });
    await page.close();
  }

  await browser.close();
  console.log('All resolution checks completed!');
})();
