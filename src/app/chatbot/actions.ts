'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function askAI(messages: ChatCompletionMessageParam[]) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to use the chatbot.' }
  }

  // 1. Get user context (profile and latest resume)
  const { data: profile } = await supabase
    .from('profiles')
    .select('career_goals, education, skills')
    .eq('id', user.id)
    .single()

  const { data: resume } = await supabase
    .from('resumes')
    .select('parsed_text')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 2. Construct the system prompt with user context
  const systemPrompt = `You are a helpful career advisor. Your goal is to provide personalized career advice to the user based on their profile and resume.
  Here is the user's profile information:
  - Career Goals: ${profile?.career_goals || 'Not specified'}
  - Education: ${profile?.education || 'Not specified'}
  - Skills: ${profile?.skills || 'Not specified'}

  Here is the text from the user's most recent resume:
  ---
  ${resume?.parsed_text || 'No resume provided'}
  ---

  Keep your responses concise and helpful. Use the provided context to tailor your advice.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
    })

    return { response: completion.choices[0].message.content }
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    return { error: 'There was an error communicating with the AI. Please try again.' }
  }
}
