// iOS Safari Audio Unlock Utility
// Fixes "The request is not allowed by the user agent" error on iOS Safari
// Source: https://gist.github.com/kus/3f01d60569eeadefe3a1

/**
 * iOS Safari requires audio to be "unlocked" via user interaction.
 * This class manages a pre-created Audio element that gets unlocked
 * during user interaction and can be reused for playback later.
 */
export class IOSAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private isUnlocked = false;
  private onEndedCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

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

    // Set the source and play
    this.audio.src = blobUrl;
    this.audio.currentTime = 0;

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
    this.isUnlocked = false;
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
