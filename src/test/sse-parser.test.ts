import { describe, it, expect } from 'vitest';
import { parseSseEvent, splitSseEvents, SSE_DONE_SENTINEL } from '@/services/sse-parser';

describe('Server-Sent Events Parser', () => {
  it('splits complete events and retains the trailing partial event', () => {
    const { events, remainder } = splitSseEvents(
      'data: {"text":"Hello "}\n\ndata: {"text":"world"}\n\ndata: {"te'
    );
    expect(events).toEqual(['data: {"text":"Hello "}', 'data: {"text":"world"}']);
    expect(remainder).toBe('data: {"te');
  });

  it('returns no events when the buffer contains no separator yet', () => {
    const { events, remainder } = splitSseEvents('data: {"text":"partial"');
    expect(events).toHaveLength(0);
    expect(remainder).toBe('data: {"text":"partial"');
  });

  it('ignores empty separator segments', () => {
    const { events } = splitSseEvents('\n\ndata: {"text":"Hi"}\n\n');
    expect(events).toEqual(['data: {"text":"Hi"}']);
  });

  it('decodes the canonical JSON text envelope', () => {
    expect(parseSseEvent('data: {"text":"N95 respirator"}')).toEqual({
      done: false,
      text: 'N95 respirator',
    });
  });

  it('signals completion on the [DONE] sentinel', () => {
    expect(parseSseEvent(`data: ${SSE_DONE_SENTINEL}`)).toEqual({ done: true, text: '' });
  });

  it('ignores JSON payloads without a text field', () => {
    expect(parseSseEvent('data: {"candidates":[]}')).toEqual({ done: false, text: '' });
  });

  it('ignores events with no data line', () => {
    expect(parseSseEvent(': keep-alive')).toEqual({ done: false, text: '' });
    expect(parseSseEvent('data:')).toEqual({ done: false, text: '' });
  });

  it('surfaces non-JSON payloads as raw text', () => {
    expect(parseSseEvent('data: plain answer')).toEqual({ done: false, text: 'plain answer' });
  });
});
