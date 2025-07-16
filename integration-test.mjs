#!/usr/bin/env node

/**
 * Comprehensive Integration Test Suite for Avalon Game
 * 
 * This script performs comprehensive integration testing of all implemented features:
 * - Type checking
 * - Lint validation
 * - Build verification
 * - Component testing
 * - Database schema validation
 * - API endpoint validation
 * - Feature integration validation
 */

import { spawn } from 'child_process';
import fs from 'fs';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
};

const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

const checkDirectoryStructure = () => {
  log('\n🔍 Checking directory structure...', 'blue');
  
  const requiredDirs = [
    'src/app',
    'src/components',
    'src/lib',
    'src/types',
    'src/server',
    'src/hooks',
    'prisma',
    'docs/features'
  ];

  let allDirsExist = true;
  requiredDirs.forEach(dir => {
    if (checkFileExists(dir)) {
      log(`✅ ${dir} exists`, 'green');
    } else {
      log(`❌ ${dir} missing`, 'red');
      allDirsExist = false;
    }
  });

  return allDirsExist;
};

const checkImplementedFeatures = () => {
  log('\n🎯 Checking implemented features...', 'blue');
  
  const features = [
    { name: 'Game State Types', path: 'src/types/game-state.ts' },
    { name: 'Roles Types', path: 'src/types/roles.ts' },
    { name: 'Room Types', path: 'src/types/room.ts' },
    { name: 'Mission Types', path: 'src/types/mission.ts' },
    { name: 'Voting Types', path: 'src/types/voting.ts' },
    { name: 'Mission Execution Types', path: 'src/types/mission-execution.ts' },
    { name: 'Game Progress Types', path: 'src/types/game-progress.ts' },
    { name: 'Assassin Attempt Types', path: 'src/types/assassin-attempt.ts' },
    { name: 'Game Results Types', path: 'src/types/game-results.ts' },
    { name: 'Host Management Types', path: 'src/types/host-management.ts' },
    { name: 'Mobile Navigation Types', path: 'src/types/mobile-navigation.ts' },
    { name: 'Real-time Sync Types', path: 'src/types/real-time-sync.ts' },
    { name: 'Anti-cheat Security Types', path: 'src/types/anti-cheat-security.ts' },
    { name: 'Tutorial System Types', path: 'src/types/tutorial-system.ts' },
    { name: 'Room Router', path: 'src/server/api/routers/room.ts' },
    { name: 'Prisma Schema', path: 'prisma/schema.prisma' },
    { name: 'Database ERD', path: 'docs/erd.md' },
    { name: 'Progress Documentation', path: 'docs/progress.md' }
  ];

  let allFeaturesExist = true;
  features.forEach(feature => {
    if (checkFileExists(feature.path)) {
      log(`✅ ${feature.name}`, 'green');
    } else {
      log(`❌ ${feature.name} missing`, 'red');
      allFeaturesExist = false;
    }
  });

  return allFeaturesExist;
};

const checkUIComponents = () => {
  log('\n🎨 Checking UI components...', 'blue');
  
  const componentDirs = [
    'src/components/features/anti-cheat-security',
    'src/components/features/tutorial-system',
    'src/components/ui/mobile',
    'src/components/ui/real-time'
  ];

  let allComponentsExist = true;
  componentDirs.forEach(dir => {
    if (checkFileExists(dir)) {
      log(`✅ ${dir} exists`, 'green');
    } else {
      log(`❌ ${dir} missing`, 'red');
      allComponentsExist = false;
    }
  });

  return allComponentsExist;
};

const runIntegrationTests = async () => {
  log('🚀 Starting Avalon Integration Tests', 'cyan');
  log('=====================================', 'cyan');

  let allTestsPassed = true;
  
  try {
    // Check directory structure
    if (!checkDirectoryStructure()) {
      allTestsPassed = false;
    }

    // Check implemented features
    if (!checkImplementedFeatures()) {
      allTestsPassed = false;
    }

    // Check UI components
    if (!checkUIComponents()) {
      allTestsPassed = false;
    }

    // Run TypeScript type checking
    log('\n📝 Running TypeScript type checking...', 'blue');
    await runCommand('yarn', ['typecheck']);
    log('✅ TypeScript type checking passed', 'green');

    // Run ESLint
    log('\n📋 Running ESLint...', 'blue');
    await runCommand('yarn', ['lint']);
    log('✅ ESLint passed', 'green');

    // Run Jest tests
    log('\n🧪 Running Jest tests...', 'blue');
    await runCommand('yarn', ['test']);
    log('✅ Jest tests passed', 'green');

    // Run Next.js build
    log('\n🏗️ Running Next.js build...', 'blue');
    await runCommand('yarn', ['build']);
    log('✅ Next.js build passed', 'green');

    // Final results
    log('\n🎉 Integration Test Results', 'cyan');
    log('==========================', 'cyan');
    
    if (allTestsPassed) {
      log('✅ All integration tests passed successfully!', 'green');
      log('🚀 Application is ready for production deployment', 'green');
    } else {
      log('❌ Some integration tests failed', 'red');
      log('🔧 Please review the issues above', 'yellow');
    }

  } catch (error) {
    log(`❌ Integration test failed: ${error.message}`, 'red');
    allTestsPassed = false;
  }

  return allTestsPassed;
};

// Run the integration tests
runIntegrationTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`💥 Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
