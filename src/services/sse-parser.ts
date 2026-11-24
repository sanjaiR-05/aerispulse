/**
 * Sentinel payload terminating a chat event stream.
 */
export const SSE_DONE_SENTINEL = '[DONE]';

/**
 * Serialized prefix of a single Server-Sent Event data line.
 */
const SSE_DATA_PREFIX = 'data:';

/**
 * Result of buffering a raw SSE byte chunk.
 */
export interface SseBufferSplit {
  /** Complete events decoded from the buffer */
  events: string[];
  /** Trailing partial event retained for the next chunk */
  remainder: string;
}

/**
 * Splits a buffered SSE payload into complete events, retaining any trailing partial
 * event so that network chunk boundaries can never truncate a message.
 *
 * @param buffer - Accumulated raw SSE text
 * @returns {SseBufferSplit} Complete events plus the unconsumed remainder
 *
 * @example
 * ```ts
 * const { events, remainder } = splitSseEvents('data: {"text":"Hi"}\n\ndata: {"te');
 * ```
 */
export function splitSseEvents(buffer: string): SseBufferSplit {
  const segments = buffer.split('\n\n');
  const remainder = segments.pop() ?? '';
  return {
    events: segments.filter((segment) => segment.trim().length > 0),
    remainder,
  };
}

/**
 * Decoded outcome of a single SSE event.
 */
export interface SseEventResult {
  /** Whether the server signalled end-of-stream */
  done: boolean;
  /** Incremental assistant text contributed by this event */
  text: string;
}

/**
 * Decodes one SSE event into assistant text (or the end-of-stream signal).
 * Supports both the canonical `{"text": "..."}` envelope and plain-text payloads.
 *
 * @param event - A single complete SSE event block
 * @returns {SseEventResult} Incremental text and completion flag
 *
 * @example
 * ```ts
 * const { text } = parseSseEvent('data: {"text":"Hi"}');
 * ```
 */
export function parseSseEvent(event: string): SseEventResult {
  const dataLines = event
    .split('\n')
    .filter((line) => line.startsWith(SSE_DATA_PREFIX))
    .map((line) => line.slice(SSE_DATA_PREFIX.length).trim());

  const payload = dataLines.join('\n').trim();
  if (payload === '') {
    return { done: false, text: '' };
  }
  if (payload === SSE_DONE_SENTINEL) {
    return { done: true, text: '' };
  }

  try {
    const parsed: unknown = JSON.parse(payload);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'text' in parsed &&
      typeof (parsed as { text: unknown }).text === 'string'
    ) {
      return { done: false, text: (parsed as { text: string }).text };
    }
    return { done: false, text: '' };
  } catch {
    // Non-JSON payload: surface the raw text so the UI still renders a response.
    return { done: false, text: payload };
  }
}
