import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useUIStore } from '@/stores/uiStore'
import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  language: string
  value: string
}

/** Syntax-highlighted code block with a copy button. */
export function CodeBlock({ language, value }: CodeBlockProps) {
  const theme = useUIStore((s) => s.theme)

  return (
    <div className="group border-border relative my-3 border">
      <div className="border-border bg-muted flex items-center justify-between border-b px-3 py-1">
        <span className="text-muted-foreground text-xs">{language || 'text'}</span>
        <CopyButton value={value} />
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={theme === 'dark' ? oneDark : oneLight}
        customStyle={{ margin: 0, background: 'transparent', fontSize: '0.8125rem' }}
        codeTagProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, monospace' } }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}
