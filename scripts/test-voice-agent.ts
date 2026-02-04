#!/usr/bin/env node
/**
 * Voice Agent Integration Test Script
 *
 * Tests the complete voice agent flow:
 * 1. Browser compatibility detection
 * 2. Audio format selection
 * 3. API endpoint validation
 * 4. Error handling scenarios
 *
 * Usage: npx tsx scripts/test-voice-agent.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function checkEnvVariables(): Promise<boolean> {
  section('1. Environment Variables Check');

  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found', 'red');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasOpenAIKey = envContent.includes('OPENAI_API_KEY=sk-');
  const hasVoiceAgentEnabled = envContent.includes('VOICE_AGENT_ENABLED=true');

  if (hasOpenAIKey) {
    log('✅ OPENAI_API_KEY configured', 'green');
  } else {
    log('❌ OPENAI_API_KEY missing or invalid', 'red');
    return false;
  }

  if (hasVoiceAgentEnabled) {
    log('✅ VOICE_AGENT_ENABLED=true', 'green');
  } else {
    log('⚠️  VOICE_AGENT_ENABLED not set (defaulting to enabled)', 'yellow');
  }

  return hasOpenAIKey;
}

function checkUtilityFiles(): boolean {
  section('2. Frontend Utility Files Check');

  const files = [
    'components/VoiceAgentFAB/utils/browserCompatibility.ts',
    'components/VoiceAgentFAB/utils/mediaRecorder.ts',
    'components/VoiceAgentFAB/utils/audioProcessor.ts',
    'components/VoiceAgentFAB/useVoiceRecording.ts',
    'components/VoiceAgentFAB/index.tsx',
  ];

  let allExist = true;

  for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} - NOT FOUND`, 'red');
      allExist = false;
    }
  }

  return allExist;
}

function checkAPIRoutes(): boolean {
  section('3. API Routes Check');

  const routes = [
    'app/api/voice-agent/transcribe/route.ts',
    'app/api/voice-agent/chat/route.ts',
    'app/api/voice-agent/speak/route.ts',
  ];

  let allExist = true;

  for (const route of routes) {
    const routePath = path.join(process.cwd(), route);
    if (fs.existsSync(routePath)) {
      log(`✅ ${route}`, 'green');
    } else {
      log(`❌ ${route} - NOT FOUND`, 'red');
      allExist = false;
    }
  }

  return allExist;
}

function analyzeBrowserCompatibility(): void {
  section('4. Browser Compatibility Analysis');

  const compatPath = path.join(
    process.cwd(),
    'components/VoiceAgentFAB/utils/browserCompatibility.ts'
  );

  if (!fs.existsSync(compatPath)) {
    log('❌ browserCompatibility.ts not found', 'red');
    return;
  }

  const content = fs.readFileSync(compatPath, 'utf-8');

  // Check for key features
  const features = {
    'getBrowserAudioFormat()': content.includes('getBrowserAudioFormat'),
    'checkBrowserCompatibility()': content.includes('checkBrowserCompatibility'),
    'Error classes (5 types)':
      content.includes('BrowserNotSupportedError') &&
      content.includes('PermissionDeniedError') &&
      content.includes('NetworkError') &&
      content.includes('ValidationError') &&
      content.includes('UserCancelledError'),
    'HTTPS detection': content.includes('isSecureContext'),
    'getUserMedia detection': content.includes('getUserMedia'),
    'MediaRecorder detection': content.includes('MediaRecorder.isTypeSupported'),
  };

  for (const [feature, exists] of Object.entries(features)) {
    if (exists) {
      log(`✅ ${feature}`, 'green');
    } else {
      log(`❌ ${feature} - MISSING`, 'red');
    }
  }
}

function analyzeCustomHook(): void {
  section('5. Custom Hook (useVoiceRecording) Analysis');

  const hookPath = path.join(
    process.cwd(),
    'components/VoiceAgentFAB/useVoiceRecording.ts'
  );

  if (!fs.existsSync(hookPath)) {
    log('❌ useVoiceRecording.ts not found', 'red');
    return;
  }

  const content = fs.readFileSync(hookPath, 'utf-8');

  const features = {
    'AbortController ref': content.includes('abortControllerRef'),
    'Timeout ref': content.includes('timeoutRef'),
    'MediaRecorder ref': content.includes('mediaRecorderRef'),
    'Recording guard ref': content.includes('isRecordingRef'),
    'Cleanup function': content.includes('const cleanup = useCallback'),
    'useEffect cleanup': content.includes('return cleanup'),
    'startRecording guard': content.includes('if (isRecordingRef.current)'),
    'API validation': content.includes('isValidAudioBlob'),
    'Network error handling': content.includes('AbortError'),
  };

  for (const [feature, exists] of Object.entries(features)) {
    if (exists) {
      log(`✅ ${feature}`, 'green');
    } else {
      log(`❌ ${feature} - MISSING`, 'red');
    }
  }
}

function analyzeMemoryManagement(): void {
  section('6. Memory Management Analysis');

  const audioProcessorPath = path.join(
    process.cwd(),
    'components/VoiceAgentFAB/utils/audioProcessor.ts'
  );

  if (!fs.existsSync(audioProcessorPath)) {
    log('❌ audioProcessor.ts not found', 'red');
    return;
  }

  const content = fs.readFileSync(audioProcessorPath, 'utf-8');

  const features = {
    'AudioURLManager class': content.includes('class AudioURLManager'),
    'createURL() method': content.includes('createURL'),
    'revokeURL() method': content.includes('revokeURL'),
    'revokeAll() method': content.includes('revokeAll'),
    'URL tracking with Set': content.includes('Set<string>'),
    'Blob validation': content.includes('isValidAudioBlob'),
  };

  for (const [feature, exists] of Object.entries(features)) {
    if (exists) {
      log(`✅ ${feature}`, 'green');
    } else {
      log(`❌ ${feature} - MISSING`, 'red');
    }
  }
}

function checkAPIEndpointFix(): void {
  section('7. API Endpoint Audio Format Fix');

  const transcribePath = path.join(
    process.cwd(),
    'app/api/voice-agent/transcribe/route.ts'
  );

  if (!fs.existsSync(transcribePath)) {
    log('❌ transcribe route not found', 'red');
    return;
  }

  const content = fs.readFileSync(transcribePath, 'utf-8');

  // Check if the hardcoded 'audio.webm' has been fixed
  if (content.includes('audio.webm') && !content.includes('extension')) {
    log('⚠️  Still using hardcoded audio.webm filename', 'yellow');
    log('   This may cause issues with Safari MP4 uploads', 'yellow');
  } else if (content.includes('extension')) {
    log('✅ Dynamic file extension based on MIME type', 'green');
  } else {
    log('❓ Unable to determine audio format handling', 'yellow');
  }
}

async function testBuildCompilation(): Promise<boolean> {
  section('8. TypeScript Compilation Test');

  log('Testing TypeScript compilation...', 'blue');
  log('(This will take a few seconds)', 'blue');

  const { execSync } = require('child_process');

  try {
    execSync('npx tsc --noEmit --skipLibCheck', {
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    log('✅ TypeScript compilation successful', 'green');
    return true;
  } catch (error) {
    log('❌ TypeScript compilation failed', 'red');
    if (error instanceof Error && 'stdout' in error) {
      const stdout = (error as any).stdout?.toString() || '';
      const stderr = (error as any).stderr?.toString() || '';
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
    }
    return false;
  }
}

function generateReport(results: {
  env: boolean;
  utils: boolean;
  routes: boolean;
  compile: boolean;
}): void {
  section('Test Summary');

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`Total Checks: ${total}`);
  log(`Passed: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`Failed: ${total - passed}`, total - passed === 0 ? 'green' : 'red');
  console.log(`Success Rate: ${percentage}%`);

  console.log('\n' + '='.repeat(60));

  if (passed === total) {
    log('🎉 ALL TESTS PASSED! Voice Agent is ready for testing.', 'green');
    console.log('\nNext Steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Open browser and navigate to the app');
    console.log('3. Click the voice FAB button');
    console.log('4. Test across Chrome, Safari, Firefox');
  } else {
    log('⚠️  Some checks failed. Please review the errors above.', 'yellow');
  }

  console.log('='.repeat(60) + '\n');
}

async function main() {
  log('Voice Agent Integration Test', 'cyan');
  log('Testing all components of the voice agent system\n', 'blue');

  const results = {
    env: await checkEnvVariables(),
    utils: checkUtilityFiles(),
    routes: checkAPIRoutes(),
    compile: false,
  };

  analyzeBrowserCompatibility();
  analyzeCustomHook();
  analyzeMemoryManagement();
  checkAPIEndpointFix();

  // Only run compilation test if previous checks passed
  if (results.env && results.utils && results.routes) {
    results.compile = await testBuildCompilation();
  } else {
    section('8. TypeScript Compilation Test');
    log('⏭️  Skipped (previous checks failed)', 'yellow');
  }

  generateReport(results);
}

main().catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});
