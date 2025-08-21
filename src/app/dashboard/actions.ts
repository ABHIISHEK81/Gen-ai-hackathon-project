'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import OpenAI from 'openai'

export async function uploadResume(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const file = formData.get('resume') as File
  if (!file || file.size === 0) {
    return redirect('/dashboard?message=Please select a file to upload.')
  }

  // 1. Parse the resume text
  let parsed_text = ''
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    if (file.type === 'application/pdf') {
      const data = await pdf(fileBuffer)
      parsed_text = data.text
    } else if (
      file.type === 'application/msword' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      parsed_text = result.value
    } else {
      return redirect('/dashboard?message=Unsupported file type.')
    }
  } catch (error) {
    console.error('Parsing error:', error)
    return redirect('/dashboard?message=Error parsing resume file.')
  }

  // 2. Upload the file to storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return redirect('/dashboard?message=Could not upload resume.')
  }

  // 3. Insert record into the database
  const { error: dbError } = await supabase.from('resumes').insert({
    user_id: user.id,
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    parsed_text: parsed_text, // Add parsed text here
  })

  if (dbError) {
    console.error('DB error:', dbError)
    // Here you might want to delete the file from storage if the db insert fails
    return redirect('/dashboard?message=Could not save resume information.')
  }

  return redirect('/dashboard?message=Resume uploaded successfully. Analysis will be available shortly.')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getCareerSuggestions() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in.' }
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

  // 2. Get all career paths
  const { data: careerPaths, error: pathsError } = await supabase
    .from('career_paths')
    .select('*')

  if (pathsError) {
    console.error('Error fetching career paths:', pathsError)
    return { error: 'Could not fetch career paths.' }
  }

  // 3. Construct the prompt for OpenAI
  const systemPrompt = `You are a helpful career advisor. Your task is to suggest the top 3 most suitable career paths for the user from the provided list, based on their profile and resume.

  **User Profile:**
  - Career Goals: ${profile?.career_goals || 'Not specified'}
  - Education: ${profile?.education || 'Not specified'}
  - Skills: ${profile?.skills || 'Not specified'}

  **User's Resume Text:**
  ---
  ${resume?.parsed_text || 'No resume provided'}
  ---

  **Available Career Paths:**
  ${JSON.stringify(careerPaths, null, 2)}

  Please respond with a JSON array of objects. Each object should have two keys: "career_path" (the title of the suggested career path) and "reason" (a brief explanation of why this path is a good fit for the user).
  For example:
  [
    { "career_path": "Frontend Developer", "reason": "Your skills in React and JavaScript are a strong match for this role." },
    { "career_path": "Full-Stack Developer", "reason": "You have a good mix of both frontend and backend skills." }
  ]`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
            role: 'user',
            content: 'Based on my profile and the available career paths, what are your top 3 recommendations?'
        }
      ],
    })

    const content = completion.choices[0].message.content
    if (!content) {
      return { error: 'The AI did not return any content.' }
    }
    const suggestions = JSON.parse(content)
    return { suggestions }
  } catch (error) {
    console.error('Error calling OpenAI or parsing response:', error)
    return { error: 'There was an error generating suggestions.' }
  }
}
