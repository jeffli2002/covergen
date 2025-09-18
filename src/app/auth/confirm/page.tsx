import { Suspense } from 'react'
import EmailConfirmClient from './email-confirm-client'

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailConfirmClient />
    </Suspense>
  )
}