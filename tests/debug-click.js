import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8088/');

  const skipBtn = await page.$('#skipBootBtn');
  if (skipBtn) await skipBtn.click();
  await new Promise((r) => setTimeout(r, 600));

  console.log('Dispatching double click on Terminal icon...');
  const res = await page.evaluate(() => {
    const el = document.querySelector('.desktop-icon[data-app="terminal"]');
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    const win = document.getElementById('win-terminal');
    return {
      winDisplay: win.style.display,
      winHidden: win.hasAttribute('hidden')
    };
  });
  console.log('Result after dblclick:', res);

  await browser.close();
})();
