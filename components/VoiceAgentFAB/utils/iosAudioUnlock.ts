// iOS Safari Audio Unlock Utility
// Fixes "The request is not allowed by the user agent" error on iOS Safari
// Source: https://gist.github.com/kus/3f01d60569eeadefe3a1

/**
 * iOS Safari requires audio to be "unlocked" via user interaction.
 * This class manages a pre-created Audio element that gets unlocked
 * during user interaction and can be reused for playback later.
 * Also includes Web Audio API gain boost for louder playback.
 */
export class IOSAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private isUnlocked = false;
  private isAudioContextConnected = false;
  private onEndedCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  // Volume boost multiplier (1.0 = normal, 2.0 = 2x louder)
  private readonly VOLUME_BOOST = 2.5;

  /**
   * Call this during a user interaction (tap/click) to unlock audio playback.
   * This creates a silent audio element and "warms it up" for iOS Safari.
   */
  unlock(): void {
    if (this.isUnlocked && this.audio) {
      return;
    }

    // Create audio element during user interaction
    this.audio = new Audio();

    // iOS Safari needs these attributes
    this.audio.setAttribute('playsinline', 'true');
    this.audio.setAttribute('webkit-playsinline', 'true');

    // Initialize Web Audio graph and try to resume the context while in a user gesture
    // so iOS allows it. If it fails, fall back to normal <audio> playback.
    this.setupAudioContext();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        // Resume inside user gesture
        void this.audioContext.resume();
      } catch (err) {
        console.warn('AudioContext resume during unlock failed (non-fatal):', err);
      }
    }

    // Play silent audio to unlock
    // Create a tiny silent audio data URL (smallest valid MP3)
    const silentAudioBase64 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+9DEAAAIAAJQAAAAgAADSAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

    this.audio.src = silentAudioBase64;
    this.audio.volume = 0.01; // Nearly silent

    // Play to unlock
    const playPromise = this.audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          this.isUnlocked = true;
          // Immediately pause after unlocking
          this.audio?.pause();
          this.audio!.currentTime = 0;
          this.audio!.volume = 1; // Reset volume
        })
        .catch((err) => {
          console.warn('iOS audio unlock failed:', err);
        });
    }
  }

  /**
   * Set up Web Audio API with gain boost for louder playback
   */
  private setupAudioContext(): void {
    if (this.isAudioContextConnected || !this.audio) return;

    try {
      // Create AudioContext (use webkit prefix for older Safari)
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported, using standard volume');
        return;
      }

      this.audioContext = new AudioContextClass();

      // Create gain node for volume boost
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.VOLUME_BOOST;

      // Connect: audio element -> gain -> speakers
      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.isAudioContextConnected = true;
      console.log(`🔊 Audio gain boost enabled: ${this.VOLUME_BOOST}x`);
    } catch (err) {
      console.warn('Failed to set up audio gain boost:', err);
    }
  }

  /**
   * Play audio from a blob URL. Must call unlock() first during user interaction.
   */
  async play(
    blobUrl: string,
    onEnded?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    this.onEndedCallback = onEnded || null;
    this.onErrorCallback = onError || null;

    if (!this.audio) {
      // If unlock wasn't called, create audio element now (may fail on iOS)
      this.audio = new Audio();
      this.audio.setAttribute('playsinline', 'true');
      this.audio.setAttribute('webkit-playsinline', 'true');
    }

    // Set up Web Audio API gain boost (only once per audio element)
    this.setupAudioContext();

    // Resume AudioContext if suspended (required after user interaction)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (err) {
        // Non-fatal on iOS: proceed with direct HTML5 audio playback
        console.warn('AudioContext resume failed during play (non-fatal):', err);
      }
    }

    // Set up event handlers
    this.audio.onended = () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    };

    this.audio.onerror = () => {
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error('Audio playback failed'));
      }
    };

    // Set the source and play at maximum volume
    this.audio.src = blobUrl;
    this.audio.currentTime = 0;
    this.audio.volume = 1.0; // Base volume at max, gain node adds boost

    try {
      await this.audio.play();
    } catch (error) {
      // If play fails, try to provide helpful error
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }
      throw err;
    }
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  /**
   * Check if audio is unlocked
   */
  getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sourceNode = null;
    this.gainNode = null;
    this.isUnlocked = false;
    this.isAudioContextConnected = false;
    this.onEndedCallback = null;
    this.onErrorCallback = null;
  }
}

// Singleton instance for the app
let iosAudioPlayerInstance: IOSAudioPlayer | null = null;

export function getIOSAudioPlayer(): IOSAudioPlayer {
  if (!iosAudioPlayerInstance) {
    iosAudioPlayerInstance = new IOSAudioPlayer();
  }
  return iosAudioPlayerInstance;
}
