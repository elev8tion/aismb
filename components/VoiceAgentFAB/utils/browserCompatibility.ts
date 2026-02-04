// Browser compatibility utilities for voice recording

export class BrowserNotSupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrowserNotSupportedError';
  }
}

export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UserCancelledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserCancelledError';
  }
}

export interface AudioFormat {
  mimeType: string;
  fileExtension: string;
}

/**
 * Detects the best supported audio format for the current browser
 * @returns AudioFormat with mimeType and file extension
 * @throws BrowserNotSupportedError if no supported formats found
 */
export function getBrowserAudioFormat(): AudioFormat {
  if (!window.MediaRecorder) {
    throw new BrowserNotSupportedError('MediaRecorder API not available in this browser');
  }

  // Try formats in order of preference
  const formats: AudioFormat[] = [
    { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm' },
    { mimeType: 'audio/webm', fileExtension: 'webm' },
    { mimeType: 'audio/mp4', fileExtension: 'm4a' },
    { mimeType: 'audio/ogg;codecs=opus', fileExtension: 'ogg' },
  ];

  for (const format of formats) {
    if (MediaRecorder.isTypeSupported(format.mimeType)) {
      return format;
    }
  }

  throw new BrowserNotSupportedError('No supported audio formats found');
}

/**
 * Checks if getUserMedia is available
 * @returns true if available, false otherwise
 */
export function isGetUserMediaSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Checks if the page is running in a secure context (HTTPS or localhost)
 * @returns true if secure context, false otherwise
 */
export function isSecureContext(): boolean {
  return window.isSecureContext;
}

/**
 * Performs comprehensive browser compatibility checks
 * @throws BrowserNotSupportedError with specific message if not supported
 */
export function checkBrowserCompatibility(): void {
  if (!isSecureContext()) {
    throw new BrowserNotSupportedError(
      'Voice recording requires HTTPS. Please access this page over a secure connection.'
    );
  }

  if (!isGetUserMediaSupported()) {
    throw new BrowserNotSupportedError(
      'Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Safari.'
    );
  }

  // This will throw if no supported formats
  getBrowserAudioFormat();
}

/**
 * Maps errors to user-friendly messages
 * @param error The error to map
 * @returns User-friendly error message
 */
export function getErrorMessage(error: Error): string {
  if (error instanceof BrowserNotSupportedError) {
    return error.message;
  }

  if (error instanceof PermissionDeniedError) {
    return 'Microphone access denied. Please enable microphone permissions in your browser settings.';
  }

  if (error instanceof NetworkError) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error instanceof ValidationError) {
    return 'Invalid response from server. Please try again.';
  }

  if (error instanceof UserCancelledError) {
    return ''; // Silent - user intentionally cancelled
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}
