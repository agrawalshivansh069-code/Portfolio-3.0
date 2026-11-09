import puppeteer from 'puppeteer';

async function dblclickIcon(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`Element ${sel} not found!`);
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
  }, selector);
}

async function runTests() {
  console.log('--- STARTING SHIVANSH OS MANDATORY TEST SUITE ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Load local server
  console.log('Navigating to http://localhost:8088/...');
  await page.goto('http://localhost:8088/', { waitUntil: 'networkidle0' });

  // Skip boot if visible
  const skipBtn = await page.$('#skipBootBtn');
  if (skipBtn) {
    console.log('Skipping boot screen...');
    await skipBtn.click();
    await new Promise((r) => setTimeout(r, 600));
  }

  // --- TEST 8: Verify desktop icons are vertically aligned on the left ---
  console.log('\n[TEST 8] Verifying desktop icons are vertically aligned along the left...');
  const iconBoundingBoxes = await page.evaluate(() => {
    const icons = document.querySelectorAll('.desktop-icon');
    return Array.from(icons).map((icon) => {
      const rect = icon.getBoundingClientRect();
      return {
        app: icon.getAttribute('data-app'),
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
    });
  });

  console.log('Desktop icons detected:', iconBoundingBoxes.length);
  // Verify that all icons have approximately the same left offset (vertical column)
  const firstLeft = iconBoundingBoxes[0].left;
  const isLeftAligned = iconBoundingBoxes.slice(0, 5).every((b) => Math.abs(b.left - firstLeft) < 15);
  console.log(`Are icons vertically column-aligned on the left? ${isLeftAligned} (left=${firstLeft}px)`);
  if (!isLeftAligned) throw new Error('Icons are not aligned on the left!');

  // Take screenshot of desktop layout with left-aligned icons
  await page.screenshot({ path: 'screenshots/01-desktop-layout-icons-left.png' });
  console.log('Saved: screenshots/01-desktop-layout-icons-left.png');

  // Test single-click icon selection
  console.log('Testing single click icon selection...');
  await page.click('.desktop-icon[data-app="projects"]');
  const isSelected = await page.evaluate(() => {
    const icon = document.querySelector('.desktop-icon[data-app="projects"]');
    return icon.classList.contains('is-selected');
  });
  console.log(`Projects icon is-selected: ${isSelected}`);
  if (!isSelected) throw new Error('Single click failed to select icon!');

  // --- TEST 1: Open Terminal -> close it using X ---
  console.log('\n[TEST 1] Testing Terminal open and close via X button...');
  await dblclickIcon(page, '.desktop-icon[data-app="terminal"]');
  await new Promise((r) => setTimeout(r, 400));

  let terminalVisible = await page.evaluate(() => {
    const win = document.getElementById('win-terminal');
    return win && win.style.display !== 'none' && !win.hasAttribute('hidden');
  });
  console.log(`Terminal window open: ${terminalVisible}`);
  if (!terminalVisible) throw new Error('Terminal failed to open!');

  // Capture screenshot of Terminal open
  await page.screenshot({ path: 'screenshots/02-terminal-open-centered.png' });
  console.log('Saved: screenshots/02-terminal-open-centered.png');

  // Click close (X) button
  console.log('Clicking Terminal close button (X)...');
  await page.click('#win-terminal .win-btn.close');
  await new Promise((r) => setTimeout(r, 300));

  terminalVisible = await page.evaluate(() => {
    const win = document.getElementById('win-terminal');
    return win && win.style.display !== 'none' && !win.hasAttribute('hidden');
  });
  console.log(`Terminal window closed: ${!terminalVisible}`);
  if (terminalVisible) throw new Error('Terminal failed to close via X button!');

  // --- TEST 2: Open Sticky Notes (Whiteboard) -> close it using X ---
  console.log('\n[TEST 2] Testing Sticky Notes open and close via X button...');
  await dblclickIcon(page, '.desktop-icon[data-app="whiteboard"]');
  await new Promise((r) => setTimeout(r, 400));

  let wbVisible = await page.evaluate(() => {
    const win = document.getElementById('win-whiteboard');
    return win && win.style.display !== 'none' && !win.hasAttribute('hidden');
  });
  console.log(`Whiteboard open: ${wbVisible}`);
  if (!wbVisible) throw new Error('Whiteboard failed to open!');

  await page.click('#win-whiteboard .win-btn.close');
  await new Promise((r) => setTimeout(r, 300));

  wbVisible = await page.evaluate(() => {
    const win = document.getElementById('win-whiteboard');
    return win && win.style.display !== 'none' && !win.hasAttribute('hidden');
  });
  console.log(`Whiteboard closed: ${!wbVisible}`);
  if (wbVisible) throw new Error('Whiteboard failed to close via X button!');

  // --- TEST 3: Open multiple applications -> close them individually ---
  console.log('\n[TEST 3] Testing multiple open applications and individual closing...');
  await dblclickIcon(page, '.desktop-icon[data-app="projects"]');
  await new Promise((r) => setTimeout(r, 300));
  await dblclickIcon(page, '.desktop-icon[data-app="terminal"]');
  await new Promise((r) => setTimeout(r, 300));
  await dblclickIcon(page, '.desktop-icon[data-app="whiteboard"]');
  await new Promise((r) => setTimeout(r, 400));

  let openCount = await page.evaluate(() => {
    const openWins = Array.from(document.querySelectorAll('.os-window')).filter(
      (w) => w.style.display !== 'none' && !w.hasAttribute('hidden')
    );
    return openWins.length;
  });
  console.log(`Active open windows: ${openCount}`);
  if (openCount !== 3) throw new Error(`Expected 3 open windows, got ${openCount}`);

  // Screenshot of 3 windows open
  await page.screenshot({ path: 'screenshots/03-multiple-apps-open.png' });
  console.log('Saved: screenshots/03-multiple-apps-open.png');

  // Close top window (Whiteboard) individually
  console.log('Closing Whiteboard individually...');
  await page.click('#win-whiteboard .win-btn.close');
  await new Promise((r) => setTimeout(r, 300));

  let statusCheck1 = await page.evaluate(() => ({
    projectsOpen: document.getElementById('win-projects').style.display !== 'none',
    terminalOpen: document.getElementById('win-terminal').style.display !== 'none',
    whiteboardOpen: document.getElementById('win-whiteboard').style.display !== 'none'
  }));
  console.log('Status after closing Whiteboard:', statusCheck1);
  if (!statusCheck1.projectsOpen || !statusCheck1.terminalOpen || statusCheck1.whiteboardOpen) {
    throw new Error('Individual window close of Whiteboard failed!');
  }

  // Close next window (Terminal) individually
  console.log('Closing Terminal individually...');
  await page.click('#win-terminal .win-btn.close');
  await new Promise((r) => setTimeout(r, 300));

  let statusCheck2 = await page.evaluate(() => ({
    projectsOpen: document.getElementById('win-projects').style.display !== 'none',
    terminalOpen: document.getElementById('win-terminal').style.display !== 'none'
  }));
  console.log('Status after closing Terminal:', statusCheck2);
  if (!statusCheck2.projectsOpen || statusCheck2.terminalOpen) {
    throw new Error('Individual window close of Terminal failed!');
  }

  // Close last window (Projects) individually
  console.log('Closing Projects individually...');
  await page.click('#win-projects .win-btn.close');
  await new Promise((r) => setTimeout(r, 300));

  let statusCheck3 = await page.evaluate(() => ({
    projectsOpen: document.getElementById('win-projects').style.display !== 'none'
  }));
  console.log('Status after closing Projects:', statusCheck3);
  if (statusCheck3.projectsOpen) {
    throw new Error('Individual window close of Projects failed!');
  }
  console.log('All 3 windows closed individually without affecting each other.');

  // --- TEST 4: Minimize and restore an application ---
  console.log('\n[TEST 4] Testing minimize and restore...');
  await dblclickIcon(page, '.desktop-icon[data-app="projects"]');
  await new Promise((r) => setTimeout(r, 300));

  console.log('Clicking minimize (-) button on Projects...');
  await page.click('#win-projects .win-btn.minimize');
  await new Promise((r) => setTimeout(r, 300));

  let projDisplay = await page.evaluate(() => document.getElementById('win-projects').style.display);
  console.log(`Projects display after minimize: ${projDisplay}`);
  if (projDisplay !== 'none') throw new Error('Minimize failed to hide window!');

  console.log('Restoring Projects from dock...');
  await page.click('.dock-item[data-open-app="projects"]');
  await new Promise((r) => setTimeout(r, 300));

  projDisplay = await page.evaluate(() => document.getElementById('win-projects').style.display);
  console.log(`Projects display after restore: ${projDisplay}`);
  if (projDisplay === 'none') throw new Error('Restore failed to display window!');

  // --- TEST 5: Maximize and restore an application ---
  console.log('\n[TEST 5] Testing maximize and restore...');
  console.log('Clicking maximize (□) button on Projects...');
  await page.click('#win-projects .win-btn.maximize');
  await new Promise((r) => setTimeout(r, 300));

  let isMax = await page.evaluate(() => document.getElementById('win-projects').classList.contains('is-maximized'));
  console.log(`Projects is-maximized: ${isMax}`);
  if (!isMax) throw new Error('Maximize failed to add .is-maximized!');

  await page.screenshot({ path: 'screenshots/04-maximized-window.png' });
  console.log('Saved: screenshots/04-maximized-window.png');

  console.log('Clicking restore (❐) button on Projects...');
  await page.click('#win-projects .win-btn.maximize');
  await new Promise((r) => setTimeout(r, 300));

  isMax = await page.evaluate(() => document.getElementById('win-projects').classList.contains('is-maximized'));
  console.log(`Projects is-maximized after restore: ${isMax}`);
  if (isMax) throw new Error('Restore failed to remove .is-maximized!');

  // Close projects
  await page.click('#win-projects .win-btn.close');
  await new Promise((r) => setTimeout(r, 200));

  // --- TEST 6: Drag an application window and then click its close button ---
  console.log('\n[TEST 6] Testing dragging a window and then closing it via X...');
  await dblclickIcon(page, '.desktop-icon[data-app="terminal"]');
  await new Promise((r) => setTimeout(r, 300));

  // Drag titlebar by 150px right, 50px down
  const titlebarHandle = await page.$('#win-terminal .window-titlebar');
  const tbBox = await titlebarHandle.boundingBox();

  await page.mouse.move(tbBox.x + 80, tbBox.y + 15);
  await page.mouse.down();
  await page.mouse.move(tbBox.x + 230, tbBox.y + 65, { steps: 10 });
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 300));

  console.log('Window dragged. Now clicking close button (X)...');
  await page.click('#win-terminal .win-btn.close');
  await new Promise((r) => setTimeout(r, 300));

  terminalVisible = await page.evaluate(() => {
    const win = document.getElementById('win-terminal');
    return win && win.style.display !== 'none';
  });
  console.log(`Dragged Terminal closed successfully: ${!terminalVisible}`);
  if (terminalVisible) throw new Error('Failed to close window after dragging!');

  await page.screenshot({ path: 'screenshots/05-dragged-window-closed.png' });
  console.log('Saved: screenshots/05-dragged-window-closed.png');

  // --- TEST 7: Close and reopen the same application ---
  console.log('\n[TEST 7] Testing close and reopen the same application...');
  await dblclickIcon(page, '.desktop-icon[data-app="contact"]');
  await new Promise((r) => setTimeout(r, 300));
  await page.click('#win-contact .win-btn.close');
  await new Promise((r) => setTimeout(r, 200));
  await dblclickIcon(page, '.desktop-icon[data-app="contact"]');
  await new Promise((r) => setTimeout(r, 300));

  const contactOpen = await page.evaluate(() => document.getElementById('win-contact').style.display !== 'none');
  console.log(`Contact reopened successfully: ${contactOpen}`);
  if (!contactOpen) throw new Error('Reopen application failed!');
  await page.click('#win-contact .win-btn.close');

  // --- TEST 9: Test on Tablet and Mobile viewports ---
  console.log('\n[TEST 9] Testing Tablet (820x1180) and Mobile (390x844)...');
  // Tablet
  await page.setViewport({ width: 820, height: 1180 });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: 'screenshots/06-tablet-view.png' });
  console.log('Saved: screenshots/06-tablet-view.png');

  // Mobile
  await page.setViewport({ width: 390, height: 844 });
  await new Promise((r) => setTimeout(r, 400));
  // Test opening an app on mobile (single tap)
  await page.click('.desktop-icon[data-app="projects"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: 'screenshots/07-mobile-view.png' });
  console.log('Saved: screenshots/07-mobile-view.png');

  // Close on mobile
  await page.click('#win-projects .win-btn.close');
  await new Promise((r) => setTimeout(r, 300));

  console.log('\n===========================================');
  console.log('ALL 9 MANDATORY TEST SCENARIOS PASSED 100%!');
  console.log('===========================================');

  await browser.close();
}

runTests().catch((err) => {
  console.error('TEST RUNNER FAILED:', err);
  process.exit(1);
});
