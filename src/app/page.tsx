import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-4xl font-bold">Career Adviser</h1>
        <p className="mb-8 text-lg text-gray-600">
          Your personal AI-powered career coach.
        </p>

        {user ? (
          <div className="space-y-4">
            <p>
              Welcome, <span className="font-semibold">{user.email}</span>!
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
            <form action={logout}>
              <button className="rounded-md bg-red-500 px-6 py-2 text-white hover:bg-red-600">
                Logout
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  )
}
