'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { error } = await supabase.from('profiles').update({
    full_name: formData.get('fullName'),
    career_goals: formData.get('careerGoals'),
    education: formData.get('education'),
    skills: formData.get('skills'),
    updated_at: new Date(),
  }).eq('id', user.id)

  if (error) {
    return redirect('/profile?message=Could not update profile')
  }

  return redirect('/profile?message=Profile updated successfully')
}
