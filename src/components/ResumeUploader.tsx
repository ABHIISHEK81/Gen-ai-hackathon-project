'use client'

import { uploadResume } from '@/app/dashboard/actions'
import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Uploading...' : 'Upload'}
    </Button>
  )
}

export default function ResumeUploader() {
  const formRef = useRef<HTMLFormElement>(null)

  const handleUpload = async (formData: FormData) => {
    await uploadResume(formData)
    formRef.current?.reset()
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold">Upload Your Resume</h2>
      <form ref={formRef} action={handleUpload} className="mt-4 space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="resume">Select a file (PDF, DOC, DOCX)</Label>
          <Input
            id="resume"
            name="resume"
            type="file"
            required
            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
        </div>
        <SubmitButton />
      </form>
    </div>
  )
}
