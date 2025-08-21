import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ResumeUploader from '@/components/ResumeUploader'
import CareerSuggestions from '@/components/CareerSuggestions'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: resumes, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 py-12">
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex space-x-4">
            <Link
              href="/chatbot"
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              AI Chatbot
            </Link>
            <Link
              href="/profile"
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Manage Profile
            </Link>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Welcome, {user.email}.
        </p>

        {searchParams.message && (
          <p className="mt-4 rounded-md bg-blue-100 p-3 text-center text-blue-800">
            {searchParams.message}
          </p>
        )}

        <ResumeUploader />

        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Your Resumes</h2>
          {resumes && resumes.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {resumes.map((resume) => (
                <li
                  key={resume.id}
                  className="rounded-md border p-3"
                >
                  <div className="flex items-center justify-between">
                    <span>{resume.file_name}</span>
                    <span className="text-sm text-gray-500">
                      Uploaded on {new Date(resume.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    {resume.analysis_result ? (
                      <details>
                        <summary className="cursor-pointer text-indigo-600">View Analysis</summary>
                        <pre className="mt-2 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm">
                          {JSON.stringify(resume.analysis_result, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <p className="text-sm text-gray-500">Analysis in progress...</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500">You haven't uploaded any resumes yet.</p>
          )}
        </div>

        <hr className="my-8" />

        <CareerSuggestions />
      </div>
    </div>
  )
}
