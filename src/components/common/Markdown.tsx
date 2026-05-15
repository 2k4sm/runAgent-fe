import { lazy, memo, Suspense } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

// Code-split the syntax highlighter — it is large and only needed for code blocks.
const CodeBlock = lazy(() => import('./CodeBlock').then((m) => ({ default: m.CodeBlock })))

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? '')
    const text = String(children).replace(/\n$/, '')
    // Block code carries a language- class or contains newlines; otherwise inline.
    if (match || text.includes('\n')) {
      return (
        <Suspense
          fallback={<pre className="bg-muted my-3 overflow-x-auto p-3 text-xs">{text}</pre>}
        >
          <CodeBlock language={match?.[1] ?? ''} value={text} />
        </Suspense>
      )
    }
    return (
      <code className="bg-muted px-1 py-0.5 text-[0.85em]" {...props}>
        {children}
      </code>
    )
  },
  a({ children, href }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
        {children}
      </a>
    )
  },
}

interface MarkdownProps {
  content: string
  className?: string
}

/** Renders agent/message markdown with GFM tables and highlighted code. */
export const Markdown = memo(function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none',
        'prose-code:after:content-none prose-headings:font-semibold',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
})
