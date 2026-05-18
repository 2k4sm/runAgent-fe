import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Plug, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useUIStore } from '@/stores/uiStore'
import { useMCPStore } from '@/stores/mcpStore'
import { cn } from '@/lib/utils'
import type { MCPAuthType, MCPHeaderInput, MCPServer, MCPServerStatus } from '@/types'

const STATUS_STYLE: Record<MCPServerStatus, { label: string; className: string }> = {
  connected: { label: 'Connected', className: 'border-green-600/40 text-green-600' },
  needs_auth: { label: 'Needs auth', className: 'border-amber-600/40 text-amber-600' },
  error: { label: 'Error', className: 'border-red-600/40 text-red-600' },
  disconnected: { label: 'Disconnected', className: 'text-muted-foreground' },
}

function StatusBadge({ status }: { status: MCPServerStatus }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.disconnected
  return <Badge className={style.className}>{style.label}</Badge>
}

/** One row in the server list. */
function ServerRow({
  server,
  onRequestDelete,
}: {
  server: MCPServer
  onRequestDelete: (server: MCPServer) => void
}) {
  const { updateServer, testServer, startOAuth } = useMCPStore()
  const [busy, setBusy] = useState(false)

  const needsAuth = server.auth_type === 'oauth' && server.status !== 'connected'

  const run = async (fn: () => Promise<void>, errorMsg: string) => {
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : errorMsg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-border border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="size-4 shrink-0 rounded-sm" />
            ) : (
              <Plug className="text-muted-foreground size-4 shrink-0" />
            )}
            <span className="truncate text-sm font-medium">{server.name}</span>
            <StatusBadge status={server.status} />
          </div>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">{server.url}</p>
          {server.description ? (
            <p className="text-muted-foreground mt-0.5 truncate text-xs">{server.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onRequestDelete(server)}
          aria-label={`Remove ${server.name}`}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {server.status === 'error' && server.status_detail ? (
        <p className="text-destructive mt-2 flex items-start gap-1.5 text-xs">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span className="break-words">{server.status_detail}</span>
        </p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs">
          {server.tools.length} tool{server.tools.length === 1 ? '' : 's'}
        </span>
        <div className="flex-1" />
        {needsAuth ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => run(() => startOAuth(server.id), 'Could not start OAuth')}
          >
            Connect
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run(() => testServer(server.id), 'Connection test failed')}
        >
          <RefreshCw className={cn('size-3.5', busy && 'animate-spin')} />
          Test
        </Button>
        <Button
          size="sm"
          variant={server.enabled ? 'secondary' : 'ghost'}
          disabled={busy}
          onClick={() =>
            run(() => updateServer(server.id, { enabled: !server.enabled }), 'Could not update')
          }
        >
          {server.enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
    </div>
  )
}

const AUTH_TYPES: { value: MCPAuthType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'header', label: 'Header' },
  { value: 'oauth', label: 'OAuth' },
]

/** The "add a server" form. */
function AddServerForm({ onCancel }: { onCancel: () => void }) {
  const { addServer, startOAuth } = useMCPStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [authType, setAuthType] = useState<MCPAuthType>('none')
  const [headers, setHeaders] = useState<MCPHeaderInput[]>([{ key: '', value: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patchHeader = (i: number, field: keyof MCPHeaderInput, value: string) =>
    setHeaders((prev) => prev.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const server = await addServer({
        name: name.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
        auth_type: authType,
        headers: authType === 'header' ? headers.filter((h) => h.key.trim()) : undefined,
      })
      if (server.auth_type === 'oauth' && server.status !== 'connected') {
        await startOAuth(server.id)
        toast.info('Complete authorization in the popup window.')
      } else {
        toast.success(`Added ${server.name}`)
      }
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-4">
      <button
        type="button"
        onClick={onCancel}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
      >
        <ArrowLeft className="size-3.5" /> Back
      </button>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="mcp-name">
          Name
        </label>
        <Input
          id="mcp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. GitHub"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="mcp-desc">
          Description <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="mcp-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this server is used for"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="mcp-url">
          Server URL
        </label>
        <Input
          id="mcp-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/mcp"
        />
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Authentication</span>
        <div className="flex gap-1.5">
          {AUTH_TYPES.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={authType === opt.value ? 'secondary' : 'outline'}
              onClick={() => setAuthType(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {authType === 'header' ? (
        <div className="space-y-1.5">
          <span className="text-muted-foreground text-xs">
            Headers sent on every request (e.g. Authorization).
          </span>
          {headers.map((h, i) => (
            <div key={i} className="flex gap-1.5">
              <Input
                value={h.key}
                onChange={(e) => patchHeader(i, 'key', e.target.value)}
                placeholder="Header"
              />
              <Input
                value={h.value}
                onChange={(e) => patchHeader(i, 'value', e.target.value)}
                placeholder="Value"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-9 shrink-0"
                aria-label="Remove header"
                onClick={() =>
                  setHeaders((prev) =>
                    prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i),
                  )
                }
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setHeaders((prev) => [...prev, { key: '', value: '' }])}
          >
            <Plus className="size-3.5" /> Add header
          </Button>
        </div>
      ) : null}

      {authType === 'oauth' ? (
        <p className="text-muted-foreground text-xs">
          After saving, a window opens for you to authorize access. The server connects
          automatically once you approve.
        </p>
      ) : null}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save server'}
        </Button>
      </div>
    </form>
  )
}

/** Empty state shown when the user has no MCP servers yet. */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="border-border text-muted-foreground border p-3">
        <Plug className="size-6" />
      </div>
      <div>
        <p className="text-sm font-medium">No MCP servers connected</p>
        <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
          MCP servers give the agent extra tools — connect one to let it work with your external
          services. You will need the server URL and, if it is protected, an auth header or OAuth
          access.
        </p>
      </div>
      <Button size="sm" onClick={onAdd}>
        <Plus className="size-3.5" /> Connect MCP server
      </Button>
    </div>
  )
}

/** The MCP server management modal. */
export function MCPModal() {
  const open = useUIStore((s) => s.mcpModalOpen)
  const setOpen = useUIStore((s) => s.setMcpModalOpen)
  const { servers, loading, loaded, load, removeServer } = useMCPStore()
  const [view, setView] = useState<'list' | 'add'>('list')
  const [pendingDelete, setPendingDelete] = useState<MCPServer | null>(null)

  // Load servers the first time the modal opens.
  useEffect(() => {
    if (open && !loaded) void load()
  }, [open, loaded, load])

  // Reset to the list view whenever the modal is reopened.
  useEffect(() => {
    if (open) setView('list')
  }, [open])

  // The OAuth callback popup posts a message when it finishes.
  useEffect(() => {
    if (!open) return
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; status?: string } | null
      if (data?.type !== 'mcp-oauth') return
      void load()
      if (data.status === 'connected') toast.success('MCP server connected')
      else toast.error('MCP authorization failed')
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [open, load])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await removeServer(pendingDelete.id)
      toast.success(`Removed ${pendingDelete.name}`)
    } catch {
      toast.error('Could not remove server')
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="MCP servers"
        description="Connect Model Context Protocol servers to give the agent more tools."
      >
        {view === 'add' ? (
          <AddServerForm onCancel={() => setView('list')} />
        ) : loading && !loaded ? (
          <p className="text-muted-foreground p-6 text-center text-sm">Loading…</p>
        ) : servers.length === 0 ? (
          <EmptyState onAdd={() => setView('add')} />
        ) : (
          <div className="space-y-2 p-4">
            {servers.map((server) => (
              <ServerRow key={server.id} server={server} onRequestDelete={setPendingDelete} />
            ))}
            <Button size="sm" variant="outline" className="w-full" onClick={() => setView('add')}>
              <Plus className="size-3.5" /> Connect another server
            </Button>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null)
        }}
        title="Remove MCP server?"
        description={`${pendingDelete?.name ?? 'This server'} will be disconnected and removed.`}
        confirmLabel="Remove"
        destructive
        onConfirm={confirmDelete}
      />
    </>
  )
}
