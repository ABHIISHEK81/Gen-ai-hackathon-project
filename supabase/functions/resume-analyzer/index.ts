import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

serve(async (req) => {
  // This is an example of a Supabase Edge Function.
  // It will be triggered by a database webhook on the `resumes` table.

  const { record } = await req.json()

  // 1. Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { id, parsed_text } = record

  if (!parsed_text) {
    return new Response(JSON.stringify({ message: 'No text to analyze' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  try {
    // 2. Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert career advisor. Analyze the following resume text and provide feedback. Focus on identifying key skills, suggesting improvements, and highlighting missing keywords for a software engineering role. Structure your response in JSON format with three keys: "strengths", "areasForImprovement", and "suggestedKeywords".',
        },
        {
          role: 'user',
          content: parsed_text,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const analysis_result = JSON.parse(completion.choices[0].message.content)

    // 3. Update the resume record with the analysis
    const { error } = await supabase
      .from('resumes')
      .update({ analysis_result })
      .eq('id', id)

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ message: 'Analysis complete' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in resume-analyzer function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
