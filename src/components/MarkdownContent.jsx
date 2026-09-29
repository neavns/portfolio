import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function CodeBlock({ className, children }) {
  const match = /language-([^:]+)(?::(.+))?/.exec(className ?? '')

  if (!match) {
    return <code className="inline-code">{children}</code>
  }

  const [, language, filename = 'code'] = match

  return (
    <div className="code-window" aria-label={`${language} code sample`}>
      <div className="window-header">
        <img className="window-dot" src="/assets/dot-red.svg" alt="" />
        <img className="window-dot" src="/assets/dot-yellow.svg" alt="" />
        <img className="window-dot" src="/assets/dot-green.svg" alt="" />
        <span className="window-filename">{filename}</span>
      </div>
      <pre className="code-content">
        <code className={`language-${language}`}>{String(children).replace(/\n$/, '')}</code>
      </pre>
    </div>
  )
}

function MarkdownHeading({ children }) {
  const label = String(children)
  const classes = ['markdown-section-heading']
  if (label.toLowerCase() === 'links') classes.push('links-heading')
  return <h2 className={classes.join(' ')}>{children}</h2>
}

function MarkdownLink({ href, children }) {
  const external = href?.startsWith('http')
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {children}
    </a>
  )
}

export default function MarkdownContent({ source }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setContent('')
    setError('')

    fetch(source, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${source}.`)
        return response.text()
      })
      .then(setContent)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message)
      })

    return () => controller.abort()
  }, [source])

  if (error) return <p className="content-error">{error}</p>
  if (!content) return <p className="markdown-loading">Loading project notes...</p>

  return (
    <article className="project-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: MarkdownLink,
          code: CodeBlock,
          h2: MarkdownHeading,
          pre: ({ children }) => children,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
