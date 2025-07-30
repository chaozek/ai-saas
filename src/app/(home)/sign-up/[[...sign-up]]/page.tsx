"use client"

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const { user } = useClerk()
  const router = useRouter()

  const demoPlanId = searchParams.get('demoPlanId')

  // After successful sign up, redirect to dashboard with demo plan
  useEffect(() => {
    if (user && demoPlanId) {
      router.push(`/dashboard?demoPlanId=${demoPlanId}`)
    } else if (user) {
      router.push('/dashboard')
    }
  }, [user, demoPlanId, router])

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <SignUp />
    </div>
  )
}