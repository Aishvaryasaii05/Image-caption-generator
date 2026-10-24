import { SignUp as ClerkSignUp } from '@clerk/react'
import { appearance } from './SignIn'

export default function SignUp() {
  return (
    <main className="auth-page flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <ClerkSignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        appearance={appearance}
      />
    </main>
  )
}
