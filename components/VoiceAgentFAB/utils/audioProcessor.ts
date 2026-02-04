// Audio processing and lifecycle management utilities

/**
 * Creates a blob URL and tracks it for cleanup
 */
export class AudioURLManager {
  private urls: Set<string> = new Set();

  /**
   * Creates a URL for a blob and tracks it
   */
  createURL(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  /**
   * Revokes a specific URL
   */
  revokeURL(url: string): void {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  /**
   * Revokes all tracked URLs
   */
  revokeAll(): void {
    this.urls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.urls.clear();
  }

  /**
   * Returns the number of tracked URLs
   */
  getCount(): number {
    return this.urls.size;
  }
}

/**
 * Plays an audio blob with proper cleanup
 */
export async function playAudioBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Audio playback error: ${error}`));
    };

    audio.play().catch((error) => {
      URL.revokeObjectURL(url);
      reject(error);
    });
  });
}

/**
 * Converts a Blob to base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Validates that a blob is a valid audio file
 */
export function isValidAudioBlob(blob: Blob): boolean {
  if (!blob || blob.size === 0) {
    return false;
  }

  // Check if mime type starts with 'audio/'
  return blob.type.startsWith('audio/');
}

/**
 * Formats audio duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
