#!/usr/bin/env node

import { chromium } from 'playwright';

const APP_URL = 'http://localhost:3000';
const PLAYERS = [
  { name: 'Host Alice', role: 'host' },
  { name: 'Player Bob', role: 'player' },
  { name: 'Player Carol', role: 'player' },
  { name: 'Player Dave', role: 'player' },
  { name: 'Player Eve', role: 'player' }
];

let roomCode = '';
let contexts = [];
let pages = [];

async function createBrowserContexts() {
  console.log('🚀 Starting browser contexts...');
  const browser = await chromium.launch({ headless: false });
  
  for (let i = 0; i < PLAYERS.length; i++) {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    const page = await context.newPage();
    contexts.push(context);
    pages.push(page);
    console.log(`✅ Created context for ${PLAYERS[i].name}`);
  }
}

async function hostCreatesRoom() {
  console.log('\n🏠 Host creating room...');
  const hostPage = pages[0];
  
  await hostPage.goto(APP_URL);
  await hostPage.waitForLoadState('networkidle');
  
  // Click Create Room
  await hostPage.click('text=Create Room');
  await hostPage.waitForURL('**/create-room');
  
  // Enter host name
  await hostPage.fill('input[placeholder*="name"]', PLAYERS[0].name);
  await hostPage.click('button:has-text("Create Room")');
  
  // Wait for room creation and capture room code
  await hostPage.waitForURL('**/room/**/lobby');
  const url = hostPage.url();
  roomCode = url.match(/\/room\/([^\/]+)/)?.[1];
  
  console.log(`✅ Room created with code: ${roomCode}`);
  return roomCode;
}

async function playersJoinRoom() {
  console.log('\n👥 Players joining room...');
  
  for (let i = 1; i < PLAYERS.length; i++) {
    const playerPage = pages[i];
    const player = PLAYERS[i];
    
    console.log(`  📥 ${player.name} joining...`);
    
    await playerPage.goto(APP_URL);
    await playerPage.waitForLoadState('networkidle');
    
    // Click Join Room
    await playerPage.click('text=Join Room');
    await playerPage.waitForURL('**/join');
    
    // Enter room code and player name
    await playerPage.fill('input[placeholder*="room code"]', roomCode);
    await playerPage.fill('input[placeholder*="name"]', player.name);
    await playerPage.click('button:has-text("Join Room")');
    
    // Wait for successful join
    await playerPage.waitForURL(`**/room/${roomCode}/lobby`);
    console.log(`  ✅ ${player.name} joined successfully`);
    
    // Small delay between joins
    await playerPage.waitForTimeout(1000);
  }
}

async function configureGameSettings() {
  console.log('\n⚙️ Configuring game settings...');
  const hostPage = pages[0];
  
  // Wait for all players to be visible
  await hostPage.waitForSelector('text=5 players', { timeout: 10000 });
  
  // Configure game settings
  try {
    // Select characters if available
    const characterButtons = await hostPage.$$('[data-testid*="character-"] button');
    if (characterButtons.length > 0) {
      console.log('  🎭 Selecting characters...');
      for (let i = 0; i < Math.min(2, characterButtons.length); i++) {
        await characterButtons[i].click();
        await hostPage.waitForTimeout(500);
      }
    }
    
    // Look for start game button
    const startButton = await hostPage.$('button:has-text("Start Game")');
    if (startButton) {
      const isEnabled = await startButton.isEnabled();
      console.log(`  🎮 Start button enabled: ${isEnabled}`);
    }
  } catch (error) {
    console.log(`  ⚠️ Settings configuration: ${error.message}`);
  }
}

async function startGame() {
  console.log('\n🎯 Starting game...');
  const hostPage = pages[0];
  
  try {
    // Wait for start button to be available and enabled
    await hostPage.waitForSelector('button:has-text("Start Game"):not([disabled])', { timeout: 15000 });
    await hostPage.click('button:has-text("Start Game")');
    
    // Wait for game to start - all players should be redirected to game
    console.log('  ⏳ Waiting for game start...');
    
    for (let i = 0; i < pages.length; i++) {
      await pages[i].waitForURL(`**/room/${roomCode}/game`, { timeout: 20000 });
      console.log(`  ✅ ${PLAYERS[i].name} entered game`);
    }
    
    console.log('🎉 Game started successfully!');
  } catch (error) {
    console.error(`❌ Failed to start game: ${error.message}`);
    throw error;
  }
}

async function simulateGameFlow() {
  console.log('\n🎲 Simulating game flow...');
  
  try {
    // Wait for role reveals
    console.log('  👑 Waiting for role reveals...');
    for (let i = 0; i < pages.length; i++) {
      await pages[i].waitForSelector('[data-testid="player-role"], .role-card, text="Your Role"', { timeout: 15000 });
      console.log(`  ✅ ${PLAYERS[i].name} role revealed`);
    }
    
    // Look for mission team selection
    console.log('  🏆 Looking for mission activities...');
    
    // Check for mission leader or team selection
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const player = PLAYERS[i];
      
      // Check if this player is the mission leader
      const isLeader = await page.$('text="Select Mission Team", text="You are the mission leader"') !== null;
      
      if (isLeader) {
        console.log(`  👑 ${player.name} is mission leader`);
        
        // Select team members if selectable
        const playerButtons = await page.$$('[data-testid*="player-"], button[data-player]');
        if (playerButtons.length > 0) {
          console.log(`    📝 Selecting team members...`);
          // Select first few available players for the team
          for (let j = 0; j < Math.min(3, playerButtons.length); j++) {
            await playerButtons[j].click();
            await page.waitForTimeout(500);
          }
          
          // Submit team if there's a submit button
          const submitButton = await page.$('button:has-text("Submit Team"), button:has-text("Propose Team")');
          if (submitButton && await submitButton.isEnabled()) {
            await submitButton.click();
            console.log(`    ✅ ${player.name} submitted team`);
          }
        }
        break;
      }
    }
    
    // Check for voting phase
    console.log('  🗳️ Looking for voting phase...');
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const player = PLAYERS[i];
      
      const approveButton = await page.$('button:has-text("Approve"), button:has-text("Yes")');
      const rejectButton = await page.$('button:has-text("Reject"), button:has-text("No")');
      
      if (approveButton || rejectButton) {
        console.log(`  🗳️ ${player.name} voting...`);
        // Randomly vote approve/reject
        const voteApprove = Math.random() > 0.3; // 70% chance to approve
        if (voteApprove && approveButton) {
          await approveButton.click();
          console.log(`    ✅ ${player.name} voted Approve`);
        } else if (rejectButton) {
          await rejectButton.click();
          console.log(`    ❌ ${player.name} voted Reject`);
        }
        await page.waitForTimeout(500);
      }
    }
    
    // Check for mission execution
    console.log('  ⚔️ Looking for mission execution...');
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const player = PLAYERS[i];
      
      const successButton = await page.$('button:has-text("Success"), button:has-text("Pass")');
      const failButton = await page.$('button:has-text("Fail"), button:has-text("Sabotage")');
      
      if (successButton || failButton) {
        console.log(`  ⚔️ ${player.name} executing mission...`);
        // Mostly succeed unless evil
        const succeed = Math.random() > 0.2; // 80% chance to succeed
        if (succeed && successButton) {
          await successButton.click();
          console.log(`    ✅ ${player.name} chose Success`);
        } else if (failButton) {
          await failButton.click();
          console.log(`    ❌ ${player.name} chose Fail`);
        }
        await page.waitForTimeout(500);
      }
    }
    
    console.log('  ⏳ Waiting for game state updates...');
    await pages[0].waitForTimeout(3000);
    
  } catch (error) {
    console.error(`⚠️ Game flow simulation error: ${error.message}`);
  }
}

async function checkForIssues() {
  console.log('\n🔍 Checking for issues...');
  const issues = [];
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const player = PLAYERS[i];
    
    try {
      // Check for error messages
      const errorElements = await page.$$('text=/error/i, text=/failed/i, .error, [data-error]');
      if (errorElements.length > 0) {
        issues.push(`${player.name}: Found ${errorElements.length} error elements`);
      }
      
      // Check for broken navigation
      const currentUrl = page.url();
      if (!currentUrl.includes(roomCode)) {
        issues.push(`${player.name}: Not in expected room (${currentUrl})`);
      }
      
      // Check for loading states stuck
      const loadingElements = await page.$$('text=/loading/i, .loading, .spinner');
      if (loadingElements.length > 0) {
        issues.push(`${player.name}: Potentially stuck loading`);
      }
      
    } catch (error) {
      issues.push(`${player.name}: Error checking page - ${error.message}`);
    }
  }
  
  if (issues.length > 0) {
    console.log('❌ Issues found:');
    issues.forEach(issue => console.log(`  • ${issue}`));
  } else {
    console.log('✅ No major issues detected');
  }
  
  return issues;
}

async function takeScreenshots() {
  console.log('\n📸 Taking screenshots...');
  
  for (let i = 0; i < pages.length; i++) {
    try {
      await pages[i].screenshot({ 
        path: `demo-screenshot-${PLAYERS[i].name.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: true 
      });
      console.log(`  ✅ Screenshot saved for ${PLAYERS[i].name}`);
    } catch (error) {
      console.log(`  ⚠️ Screenshot failed for ${PLAYERS[i].name}: ${error.message}`);
    }
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up...');
  
  for (let i = 0; i < contexts.length; i++) {
    try {
      await contexts[i].close();
      console.log(`  ✅ Closed context for ${PLAYERS[i].name}`);
    } catch (error) {
      console.log(`  ⚠️ Error closing context for ${PLAYERS[i].name}: ${error.message}`);
    }
  }
}

async function runDemo() {
  try {
    console.log('🎭 Starting Avalon Multi-Session Game Demo');
    console.log('='=50);
    
    await createBrowserContexts();
    await hostCreatesRoom();
    await playersJoinRoom();
    await configureGameSettings();
    await startGame();
    await simulateGameFlow();
    
    const issues = await checkForIssues();
    await takeScreenshots();
    
    console.log('\n📊 Demo Summary');
    console.log('='*30);
    console.log(`✅ Room Code: ${roomCode}`);
    console.log(`✅ Players: ${PLAYERS.length}`);
    console.log(`${issues.length === 0 ? '✅' : '⚠️'} Issues: ${issues.length}`);
    
    if (issues.length === 0) {
      console.log('\n🎉 Demo completed successfully! Game flow appears to be working.');
    } else {
      console.log('\n⚠️ Demo completed with issues. Review the problems above.');
    }
    
    // Keep browsers open for manual inspection
    console.log('\n🔍 Browsers will remain open for manual inspection.');
    console.log('Press Ctrl+C to close all browsers and exit.');
    
    // Wait for manual termination
    process.on('SIGINT', async () => {
      console.log('\n👋 Shutting down...');
      await cleanup();
      process.exit(0);
    });
    
    // Keep the script running
    await new Promise(() => {});
    
  } catch (error) {
    console.error(`\n❌ Demo failed: ${error.message}`);
    console.error(error.stack);
    await cleanup();
    process.exit(1);
  }
}

runDemo();
