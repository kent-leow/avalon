#!/usr/bin/env node

/**
 * Simple Integration Test Script for Avalon Game
 * Checks core functionality and build status
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const runCommand = (command, description) => {
  console.log(`\n🔍 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} passed`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed`);
    return false;
  }
};

const checkFileExists = (filePath, description) => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists`);
    return true;
  } else {
    console.log(`❌ ${description} missing`);
    return false;
  }
};

const runIntegrationTests = async () => {
  console.log('🚀 Avalon Integration Tests');
  console.log('===========================');
  
  let allPassed = true;
  let passedTests = 0;
  let totalTests = 0;

  // Check core files
  console.log('\n📂 Checking core files...');
  const coreFiles = [
    ['src/server/api/routers/room.ts', 'Room API Router'],
    ['src/types/game-state.ts', 'Game State Types'],
    ['src/types/roles.ts', 'Role Types'],
    ['src/lib/role-assignment.ts', 'Role Assignment Logic'],
    ['prisma/schema.prisma', 'Database Schema'],
    ['src/app/create-room/CreateRoomForm.tsx', 'Create Room Form'],
    ['src/app/join/page.tsx', 'Join Room Page'],
    ['docs/progress.md', 'Progress Documentation']
  ];

  for (const [file, description] of coreFiles) {
    totalTests++;
    if (checkFileExists(file, description)) {
      passedTests++;
    } else {
      allPassed = false;
    }
  }

  // Check TypeScript compilation
  totalTests++;
  if (runCommand('yarn typecheck', 'TypeScript type checking')) {
    passedTests++;
  } else {
    allPassed = false;
  }

  // Check ESLint
  totalTests++;
  if (runCommand('yarn lint', 'ESLint code quality check')) {
    passedTests++;
  } else {
    allPassed = false;
  }

  // Check Next.js build
  totalTests++;
  if (runCommand('yarn build', 'Next.js build')) {
    passedTests++;
  } else {
    allPassed = false;
  }

  // Final results
  console.log('\n🎉 Integration Test Results');
  console.log('===========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (allPassed) {
    console.log('🎉 All integration tests passed!');
    console.log('🚀 Application is ready for production');
  } else {
    console.log('❌ Some tests failed');
    console.log('🔧 Please review the issues above');
  }

  return allPassed;
};

// Run the tests
runIntegrationTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(`💥 Fatal error: ${error.message}`);
  process.exit(1);
});
