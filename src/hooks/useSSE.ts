import type { SSEEvent } from '@/types'

/**
 * Reads a Server-Sent Events stream from a fetch Response body.
 *
 * Handles the two awkward realities of streamed SSE: a single network chunk may
 * contain zero, one, or many `data:` frames, and a frame may be split across
 * chunks. A persistent buffer accumulates decoded text and is split on the
 * `\n\n` frame delimiter; the trailing partial frame is carried to the next read.
 */
export async function readSSEStream(
  response: Response,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!response.body) throw new Error('Response has no readable body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const flushFrame = (frame: string) => {
    // A frame may have multiple lines; concatenate all `data:` payloads.
    const dataLines = frame
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
    if (dataLines.length === 0) return
    const payload = dataLines.join('\n')
    if (payload === '[DONE]') return
    try {
      onEvent(JSON.parse(payload) as SSEEvent)
    } catch {
      // Ignore malformed frames / heartbeats.
    }
  }

  try {
    while (true) {
      if (signal?.aborted) break
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''
      for (const frame of frames) {
        if (frame.trim()) flushFrame(frame)
      }
    }
    // Flush any trailing complete frame left in the buffer.
    if (buffer.trim()) flushFrame(buffer)
  } finally {
    reader.releaseLock()
  }
}
