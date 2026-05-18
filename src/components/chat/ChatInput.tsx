import { useRef, useState } from 'react'
import { Brain, Paperclip, Plug, Send, Square } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AttachmentPreview } from './AttachmentPreview'
import { useChat } from '@/hooks/useChat'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { useChatStore } from '@/stores/chatStore'
import { useUIStore } from '@/stores/uiStore'
import { fileService } from '@/services/fileService'
import type { StagedFile } from '@/types'

/** Attachment limits: at most 5 files, each up to 15MB. */
const MAX_FILES = 5
const MAX_FILE_MB = 15
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

/** Message composer: auto-growing textarea, file attachments, send/stop control. */
export function ChatInput() {
  const { send, stop } = useChat()
  const streaming = useChatStore((s) => s.streaming)
  const reasoningEnabled = useUIStore((s) => s.reasoningEnabled)
  const toggleReasoning = useUIStore((s) => s.toggleReasoning)
  const openMcpModal = useUIStore((s) => s.setMcpModalOpen)
  const [content, setContent] = useState('')
  const [staged, setStaged] = useState<StagedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // On touch devices Enter inserts a newline; the message is sent only by
  // tapping the send button. Desktop keeps Enter-to-send.
  const isTouch = useIsTouchDevice()

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  /** Patch one staged file in place by its localId. */
  const patch = (localId: string, fields: Partial<StagedFile>) =>
    setStaged((prev) => prev.map((s) => (s.localId === localId ? { ...s, ...fields } : s)))

  /** Upload a staged file immediately via POST /files/upload. */
  const uploadStaged = async (sf: StagedFile) => {
    patch(sf.localId, { status: 'uploading' })
    try {
      const asset = await fileService.upload(sf.file)
      patch(sf.localId, { status: 'uploaded', assetId: asset.id, asset })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(`${sf.file.name}: ${message}`)
      patch(sf.localId, { status: 'error', error: message })
    }
  }

  const onSelectFiles = (picked: File[]) => {
    if (picked.length === 0) return

    // Reject files over the per-file size limit.
    const tooLarge = picked.filter((f) => f.size > MAX_FILE_BYTES)
    for (const f of tooLarge) {
      toast.error(`${f.name}: exceeds the ${MAX_FILE_MB}MB limit`)
    }
    let accepted = picked.filter((f) => f.size <= MAX_FILE_BYTES)

    // Cap the total number of attachments.
    const remainingSlots = MAX_FILES - staged.length
    if (remainingSlots <= 0) {
      toast.error(`You can attach at most ${MAX_FILES} files`)
      return
    }
    if (accepted.length > remainingSlots) {
      toast.error(`You can attach at most ${MAX_FILES} files`)
      accepted = accepted.slice(0, remainingSlots)
    }
    if (accepted.length === 0) return

    const next: StagedFile[] = accepted.map((file) => ({
      localId: crypto.randomUUID(),
      file,
      status: 'pending',
    }))
    setStaged((prev) => [...prev, ...next])
    // Store every file right away — the send button only enables once uploads
    // finish. send() re-uploads anything still unstored as a safety net.
    for (const sf of next) void uploadStaged(sf)
  }

  const uploading = staged.some((s) => s.status === 'uploading')
  const hasUsable = staged.some((s) => s.status !== 'error')
  const canSend = !streaming && !uploading && (Boolean(content.trim()) || hasUsable)

  const submit = () => {
    if (!canSend) return
    void send(content, staged)
    setContent('')
    setStaged([])
    requestAnimationFrame(resize)
  }

  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-3xl p-3">
        <AttachmentPreview
          files={staged}
          onRemove={(localId) => setStaged((prev) => prev.filter((s) => s.localId !== localId))}
        />

        <div className="border-input bg-background flex items-end gap-2 border p-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              onSelectFiles(Array.from(e.target.files ?? []))
              e.target.value = ''
            }}
          />
          <textarea
            ref={textareaRef}
            value={content}
            rows={1}
            placeholder="Send a message…"
            className="placeholder:text-muted-foreground max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-sm outline-none"
            onChange={(e) => {
              setContent(e.target.value)
              resize()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isTouch) {
                e.preventDefault()
                submit()
              }
            }}
          />

          <Tooltip content="Attach files">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach files"
            >
              <Paperclip />
            </Button>
          </Tooltip>

          <Tooltip content={reasoningEnabled ? 'Reasoning on' : 'Reasoning off'}>
            <Button
              variant={reasoningEnabled ? 'secondary' : 'ghost'}
              size="icon"
              className={cn('size-8 shrink-0', reasoningEnabled && 'text-primary')}
              onClick={toggleReasoning}
              aria-label="Toggle reasoning"
              aria-pressed={reasoningEnabled}
            >
              <Brain />
            </Button>
          </Tooltip>

          <Tooltip content="MCP servers">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => openMcpModal(true)}
              aria-label="Manage MCP servers"
            >
              <Plug />
            </Button>
          </Tooltip>

          {streaming ? (
            <Button
              size="icon"
              variant="secondary"
              className="size-8 shrink-0"
              onClick={stop}
              aria-label="Stop generating"
            >
              <Square />
            </Button>
          ) : (
            <Button
              size="icon"
              className="size-8 shrink-0"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
            >
              <Send />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mt-1.5 text-center text-[0.7rem]">
          {uploading
            ? 'Uploading attachments…'
            : isTouch
              ? 'Tap send to send your message'
              : 'Enter to send · Shift+Enter for a new line'}
        </p>
      </div>
    </div>
  )
}
