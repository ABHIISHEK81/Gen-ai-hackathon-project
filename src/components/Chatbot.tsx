'use client'

import { useState } from 'react'
import { askAI } from '@/app/chatbot/actions'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages: ChatCompletionMessageParam[] = [
      ...messages,
      { role: 'user', content: input },
    ]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const { response, error } = await askAI(newMessages)

      if (error) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: `Error: ${error}` },
        ])
      } else if (response) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: response },
        ])
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'An unexpected error occurred.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[70vh] flex-col">
      <ScrollArea className="flex-1 rounded-md border p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-lg rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {typeof msg.content === 'string' ? msg.content : 'Unsupported message format'}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-lg rounded-lg bg-muted px-4 py-2">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your career..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  )
}
