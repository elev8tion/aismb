# Voice Agent Testing Session

**Date:** 2026-02-03
**Status:** 🟢 Dev Server Running
**URL:** http://localhost:3000

---

## Quick Test Checklist

### Test 1: Basic Voice Interaction ✅
**Steps:**
1. Open http://localhost:3000 in your browser
2. Look for the voice FAB button (bottom-right corner with blue logo)
3. Click the FAB button
4. Grant microphone permission when prompted
5. Speak clearly: "What's your pricing?"
6. Wait for transcription to appear
7. Listen for the audio response

**Expected Results:**
- ✅ FAB button animates and opens modal
- ✅ Microphone permission prompt appears (first time only)
- ✅ Green waveform animation shows while listening
- ✅ "Listening..." text displays
- ✅ After you stop: "Processing..." shows with orange spinner
- ✅ Your question appears in transcript box
- ✅ "Speaking..." shows with blue speaker icon
- ✅ Audio response plays clearly
- ✅ Returns to idle state when done

**Check Browser Console:**
- Open DevTools (F12 or Cmd+Option+I)
- Look for any red errors
- Should see logs about transcription and API calls

---

### Test 2: Browser Compatibility Check ✅
**Current Browser Detection:**

Open DevTools Console and run:
```javascript
// Check what format your browser will use
if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
  console.log('✅ Browser: Chrome/Edge - Format: audio/webm;codecs=opus');
} else if (MediaRecorder.isTypeSupported('audio/mp4')) {
  console.log('✅ Browser: Safari - Format: audio/mp4');
} else if (MediaRecorder.isTypeSupported('audio/webm')) {
  console.log('✅ Browser: Firefox - Format: audio/webm');
} else {
  console.log('❌ Browser: Not supported');
}
```

**Expected:**
- Chrome/Edge: audio/webm;codecs=opus
- Safari: audio/mp4
- Firefox: audio/webm

---

### Test 3: Error Handling ✅
**Test Permission Denial:**
1. Block microphone in browser settings:
   - Chrome: Settings > Privacy > Site Settings > Microphone
   - Safari: Safari > Settings for This Website > Microphone
   - Firefox: Address bar lock icon > Permissions > Microphone
2. Click FAB button
3. Should see error: "Microphone access denied..."
4. Re-enable microphone
5. Try again - should work

**Expected:**
- ✅ Clear error message displays
- ✅ FAB remains functional after error
- ✅ Can recover after granting permission

---

### Test 4: Race Condition Prevention ✅
**Test Rapid Clicking:**
1. Click FAB button 5 times rapidly
2. Check console for warnings

**Expected:**
- ✅ Only ONE recording starts
- ✅ Console shows: "Recording already in progress" for subsequent clicks
- ✅ No duplicate API calls in Network tab

---

### Test 5: Memory Cleanup ✅
**Test Component Cleanup:**
1. Open DevTools > Application > Background Services
2. Click FAB and start recording
3. Navigate to a different page or close modal
4. Check for:
   - No active MediaStreams
   - No pending timers
   - No console errors

**Expected:**
- ✅ All resources cleaned up
- ✅ No memory leaks
- ✅ No orphaned requests

---

### Test 6: Network Monitoring ✅
**Watch API Calls:**
1. Open DevTools > Network tab
2. Click FAB and record a question
3. Watch for these requests:

**Expected Sequence:**
1. `POST /api/voice-agent/transcribe` (200, ~2-3s)
2. `POST /api/voice-agent/chat` (200, ~2-3s)
3. `POST /api/voice-agent/speak` (200, ~3-4s)

**Check Headers:**
- Transcribe: Should send audio file (FormData)
- Chat: Should send JSON with question
- Speak: Should receive audio/mpeg

---

### Test 7: 60-Second Timeout ✅
**Test Auto-Stop:**
1. Click FAB and start recording
2. Wait 60 seconds without stopping
3. Should auto-stop and process

**Expected:**
- ✅ Console log: "Max recording duration reached..."
- ✅ Recording stops automatically
- ✅ Transcription is processed
- ✅ No errors

---

### Test 8: User Cancellation ✅
**Test Graceful Cancel:**
1. Click FAB and start recording
2. Immediately click "Stop" button
3. OR click "Close" button while recording

**Expected:**
- ✅ Recording stops immediately
- ✅ NO error message shown
- ✅ Component returns to idle
- ✅ No pending requests in Network tab

---

## 🐛 Debugging Checklist

If something doesn't work:

### No FAB Button Visible
- Check: Is component mounted on homepage?
- Check: Browser console for errors
- Look for: Bottom-right corner of page

### Microphone Not Working
- Check: Browser microphone permissions
- Check: HTTPS or localhost (required)
- Check: No other app using microphone
- Try: Different browser

### No Audio Playback
- Check: Browser console for errors
- Check: Network tab for speak API response (200)
- Check: System volume not muted
- Try: Different browser

### Recording Doesn't Start
- Check: Console for specific error
- Check: HTTPS connection (required for getUserMedia)
- Check: Browser supports MediaRecorder
- Try: Grant microphone permission explicitly

### API Errors
- Check: .env.local has OPENAI_API_KEY
- Check: Network tab for actual error response
- Check: Server logs in terminal
- Verify: API key is valid

---

## 📊 Success Indicators

You'll know everything is working when:

- ✅ FAB button visible and clickable
- ✅ Modal opens with animations
- ✅ Microphone permission granted
- ✅ Waveform shows while recording
- ✅ Transcription appears correctly
- ✅ Audio response plays clearly
- ✅ No console errors
- ✅ Clean state transitions (idle → listening → processing → speaking → idle)

---

## 🔍 What to Monitor

### Browser Console
```
Expected logs:
- "📤 Transcribing audio: [size] bytes, type: audio/webm"
- "Transcription result: [your question]"
- "Chat API received: { question: '...' }"
- "⏱️ Response generated in [time]ms"
```

### Network Tab
```
Expected requests:
1. transcribe: FormData with audio file
2. chat: JSON with question
3. speak: Returns audio/mpeg file
```

### Performance
```
Total round-trip time: 7-10 seconds (first time)
                       5-6 seconds (cached responses)
```

---

## 📝 Notes

### Known Limitations
- Requires HTTPS or localhost
- 60-second max recording duration
- 10 MB max audio file size
- Rate limited: 10 requests/minute

### Browser-Specific Notes
- **Safari**: Uses MP4 format (tested ✅)
- **Chrome/Edge**: Uses WebM with Opus codec
- **Firefox**: Uses WebM format
- **Mobile Safari**: May require user gesture for audio playback

---

## ✅ Testing Complete When:

- [ ] Basic voice interaction works
- [ ] Browser format detected correctly
- [ ] Error handling works (permission denial)
- [ ] Rapid clicking prevented
- [ ] Memory cleanup verified
- [ ] All API calls successful (200 responses)
- [ ] 60-second timeout works (optional)
- [ ] User cancellation graceful
- [ ] No console errors

---

**Happy Testing! 🎤**

If you encounter any issues, check the browser console first for specific error messages.
