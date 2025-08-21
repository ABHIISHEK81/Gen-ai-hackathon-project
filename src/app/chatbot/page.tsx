import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Chatbot from '@/components/Chatbot'

export default async function ChatbotPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 py-12">
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-3xl font-bold">AI Career Advisor</h1>
        <p className="mb-6 text-gray-600">
          Ask me anything about your career path, resume, or skills.
        </p>
        <Chatbot />
      </div>
    </div>
  )
}
