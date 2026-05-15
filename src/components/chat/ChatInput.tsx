import { useRef, useState } from 'react'
import { Paperclip, Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { AttachmentPreview } from './AttachmentPreview'
import { useChat } from '@/hooks/useChat'
import { useChatStore } from '@/stores/chatStore'

/** Message composer: auto-growing textarea, file attachments, send/stop control. */
export function ChatInput() {
  const { send, stop } = useChat()
  const streaming = useChatStore((s) => s.streaming)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const submit = () => {
    if (streaming) return
    if (!content.trim() && files.length === 0) return
    void send(content, files)
    setContent('')
    setFiles([])
    requestAnimationFrame(resize)
  }

  return (
    <div className="border-border bg-background border-t">
      <div className="mx-auto w-full max-w-3xl p-3">
        <AttachmentPreview
          files={files}
          onRemove={(i) => setFiles(files.filter((_, n) => n !== i))}
        />

        <div className="border-input bg-background flex items-end gap-2 border p-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
              e.target.value = ''
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
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
          />

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
              disabled={!content.trim() && files.length === 0}
              aria-label="Send message"
            >
              <Send />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mt-1.5 text-center text-[0.7rem]">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  )
}
