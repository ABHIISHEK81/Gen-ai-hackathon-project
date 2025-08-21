import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/auth/actions'

export default async function Navbar() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="flex w-full items-center justify-between border-b p-4">
      <Link href="/" className="text-2xl font-bold text-indigo-600">
        Career Adviser
      </Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <Link href="/chatbot">
              <Button variant="ghost">Chatbot</Button>
            </Link>
            <form action={logout}>
              <Button variant="destructive">Logout</Button>
            </form>
          </>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
