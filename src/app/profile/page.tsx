import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default async function ProfilePage({
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

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error)
  }

  return (
    <Card className="w-full max-w-2xl">
      <form action={updateProfile}>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Update your profile information below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams.message && (
            <p className="rounded-md bg-blue-100 p-3 text-center text-sm text-blue-800">
              {searchParams.message}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={profile?.full_name ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careerGoals">Career Goals</Label>
            <Textarea
              id="careerGoals"
              name="careerGoals"
              rows={3}
              defaultValue={profile?.career_goals ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              name="education"
              rows={3}
              defaultValue={profile?.education ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              name="skills"
              rows={3}
              defaultValue={profile?.skills ?? ''}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Update Profile</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
