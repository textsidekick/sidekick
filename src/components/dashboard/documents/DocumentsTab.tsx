'use client'

import { useState, useRef, useEffect } from 'react'
import { UploadZone } from './UploadZone'
import { IntegrationsRow } from './IntegrationsRow'
import { DocumentsTable } from './DocumentsTable'
import { Send, Loader2, MessageCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface DocumentsTabProps {
  companyId?: string
  documents?: any[]
}

function DocumentsChat({ companyId }: { companyId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Need to add more info about your company? Just tell me — I can learn from anything you type, or you can upload documents above." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          sessionId: companyId || 'docs-chat',
        }),
      })

      if (res.ok) {
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let assistantMsg = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
            for (const line of lines) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.token) assistantMsg += parsed.token
              } catch {}
            }
          }
        }

        if (assistantMsg) {
          setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }])
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Try again." }])
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(28,26,22,0.1)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(28,26,22,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <MessageCircle size={16} style={{ color: '#C96442' }} />
        <span style={{ fontWeight: 600, fontSize: 14, color: '#1C1A16' }}>Add info via chat</span>
        <span style={{ fontSize: 12, color: 'rgba(28,26,22,0.4)' }}>— tell Sidekick about your company</span>
      </div>

      <div style={{
        maxHeight: 320,
        overflowY: 'auto',
        padding: '16px',
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 12,
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? '#C96442' : '#F7F3EC',
              color: msg.role === 'user' ? 'white' : '#1C1A16',
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: '14px 14px 14px 4px',
              background: '#F7F3EC',
              color: 'rgba(28,26,22,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
            }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(28,26,22,0.06)',
        display: 'flex',
        gap: 8,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Tell Sidekick about your company..."
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid rgba(28,26,22,0.1)',
            borderRadius: 10,
            fontSize: 14,
            outline: 'none',
            background: '#F7F3EC',
            color: '#1C1A16',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: 'none',
            background: input.trim() ? '#C96442' : 'rgba(28,26,22,0.1)',
            color: input.trim() ? 'white' : 'rgba(28,26,22,0.3)',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

function DocumentsTab({ companyId, documents = [] }: DocumentsTabProps) {
  return (
    <div className="space-y-6">
      <DocumentsChat companyId={companyId} />
      <UploadZone />
      <IntegrationsRow />
      <DocumentsTable documents={documents} />
    </div>
  )
}

export { DocumentsTab }
export type { DocumentsTabProps }
