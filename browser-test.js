/**
 * Browser Compatibility Test Script
 *
 * Copy and paste this into your browser console to check compatibility
 *
 * Usage:
 * 1. Open DevTools (F12 or Cmd+Option+I)
 * 2. Go to Console tab
 * 3. Copy all of this code
 * 4. Paste into console
 * 5. Press Enter
 */

console.log('%c🎤 Voice Agent Browser Compatibility Test', 'font-size: 20px; font-weight: bold; color: #0EA5E9;');
console.log('═'.repeat(60));

// Test 1: HTTPS Check
console.log('\n%c1. HTTPS / Secure Context Check', 'font-weight: bold; color: #22C55E;');
if (window.isSecureContext) {
  console.log('✅ Running in secure context (HTTPS or localhost)');
} else {
  console.log('❌ NOT in secure context - Voice recording will NOT work');
  console.log('   Solution: Use HTTPS or localhost');
}

// Test 2: getUserMedia Check
console.log('\n%c2. getUserMedia API Check', 'font-weight: bold; color: #22C55E;');
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log('✅ getUserMedia API available');
} else {
  console.log('❌ getUserMedia API NOT available');
  console.log('   Your browser does not support microphone access');
}

// Test 3: MediaRecorder Check
console.log('\n%c3. MediaRecorder API Check', 'font-weight: bold; color: #22C55E;');
if (window.MediaRecorder) {
  console.log('✅ MediaRecorder API available');
} else {
  console.log('❌ MediaRecorder API NOT available');
  console.log('   Your browser cannot record audio');
}

// Test 4: Audio Format Detection
console.log('\n%c4. Supported Audio Format Detection', 'font-weight: bold; color: #22C55E;');
const formats = [
  { mime: 'audio/webm;codecs=opus', name: 'WebM with Opus (Chrome/Edge)', emoji: '🟢' },
  { mime: 'audio/webm', name: 'WebM (Firefox)', emoji: '🟠' },
  { mime: 'audio/mp4', name: 'MP4 (Safari)', emoji: '🔵' },
  { mime: 'audio/ogg;codecs=opus', name: 'OGG with Opus', emoji: '🟡' },
];

let supportedFormat = null;
formats.forEach(format => {
  const supported = MediaRecorder.isTypeSupported(format.mime);
  if (supported) {
    console.log(`${format.emoji} ${format.name}: ✅ Supported`);
    if (!supportedFormat) supportedFormat = format;
  } else {
    console.log(`${format.emoji} ${format.name}: ❌ Not supported`);
  }
});

if (supportedFormat) {
  console.log(`\n%c📍 Your browser will use: ${supportedFormat.name}`, 'font-weight: bold; color: #0EA5E9;');
  console.log(`   MIME type: ${supportedFormat.mime}`);
} else {
  console.log('\n%c❌ No supported audio formats found!', 'font-weight: bold; color: #EF4444;');
}

// Test 5: Browser Detection
console.log('\n%c5. Browser Information', 'font-weight: bold; color: #22C55E;');
const ua = navigator.userAgent;
let browser = 'Unknown';
if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
else if (ua.includes('Firefox')) browser = 'Firefox';
else if (ua.includes('Edg')) browser = 'Edge';

console.log(`Browser: ${browser}`);
console.log(`User Agent: ${ua}`);
console.log(`Platform: ${navigator.platform}`);

// Test 6: Microphone Permission Status
console.log('\n%c6. Microphone Permission Check', 'font-weight: bold; color: #22C55E;');
if (navigator.permissions && navigator.permissions.query) {
  navigator.permissions.query({ name: 'microphone' }).then(result => {
    if (result.state === 'granted') {
      console.log('✅ Microphone permission: GRANTED');
    } else if (result.state === 'prompt') {
      console.log('⚠️  Microphone permission: PROMPT (will ask when you click FAB)');
    } else if (result.state === 'denied') {
      console.log('❌ Microphone permission: DENIED');
      console.log('   Solution: Enable microphone in browser settings');
    }
  }).catch(err => {
    console.log('⚠️  Could not check microphone permission status');
  });
} else {
  console.log('⚠️  Permission API not available (will prompt when needed)');
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('%c📊 Compatibility Summary', 'font-size: 16px; font-weight: bold; color: #0EA5E9;');

const checks = {
  'Secure Context (HTTPS)': window.isSecureContext,
  'getUserMedia API': !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  'MediaRecorder API': !!window.MediaRecorder,
  'Audio Format Support': !!supportedFormat,
};

let allPassed = true;
Object.entries(checks).forEach(([check, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${check}`);
  if (!passed) allPassed = false;
});

console.log('═'.repeat(60));

if (allPassed) {
  console.log('%c🎉 All checks passed! Voice Agent will work in this browser.', 'font-size: 16px; font-weight: bold; color: #22C55E; background: #DCFCE7; padding: 8px;');
  console.log('\n%cNext Steps:', 'font-weight: bold;');
  console.log('1. Click the voice FAB button (bottom-right corner)');
  console.log('2. Grant microphone permission if prompted');
  console.log('3. Speak your question');
  console.log('4. Listen for the response');
} else {
  console.log('%c⚠️ Some checks failed. Voice Agent may not work correctly.', 'font-size: 16px; font-weight: bold; color: #F59E0B; background: #FEF3C7; padding: 8px;');
  console.log('\nPlease address the failed checks above.');
}

console.log('\n═'.repeat(60));
