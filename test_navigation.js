// Simple test to check if the game page navigation works
const playwright = require('playwright');

async function testNavigation() {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Go to the home page
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'test_home.png' });
    
    // Try to navigate to a test room
    await page.goto('http://localhost:3000/room/TESTROOM/game');
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ path: 'test_game.png' });
    
    console.log('Navigation completed successfully');
  } catch (error) {
    console.error('Navigation error:', error);
  } finally {
    await browser.close();
  }
}

testNavigation();
