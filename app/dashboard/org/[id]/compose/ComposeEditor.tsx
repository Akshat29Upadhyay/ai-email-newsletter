'use client'

import { useState } from 'react'

export default function ComposeEditor({ orgId, action }: { orgId: string, action: (formData: FormData) => void }) {
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('<h1>Hello</h1>\n<p>Welcome to our newsletter.</p>')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function applyAI() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, html }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to generate content')
      if (typeof data.html === 'string' && data.html.trim().length > 0) {
        setHtml(data.html)
      } else {
        throw new Error('Empty response from AI')
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={action} className="grid md:grid-cols-2 gap-4">
      <input type="hidden" name="orgId" value={orgId} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="prompt" className="text-sm font-medium text-gray-700">AI prompt</label>
          <div className="flex gap-2">
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Make it more friendly and add a CTA"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button type="button" onClick={applyAI} disabled={loading} className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition min-w-[110px]">
              {loading ? 'Thinking…' : 'Apply AI'}
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="html" className="text-sm font-medium text-gray-700">HTML</label>
          <textarea
            id="html"
            name="html"
            rows={16}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="<h1>Hello</h1>\n<p>Welcome to our newsletter.</p>"
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:opacity-90 transition w-fit">Send to subscribers</button>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b text-xs text-gray-600 bg-gray-50">Preview</div>
        <iframe title="Preview" className="w-full h-full min-h-[420px] bg-white" srcDoc={html} />
      </div>
    </form>
  )
} 