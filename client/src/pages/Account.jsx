import { UserProfile as ClerkUserProfile } from '@clerk/react'
import { appearance } from './SignIn'

export default function Account() {
  return (
    <main className="auth-page flex min-h-[calc(100vh-5rem)] items-start justify-center px-4 py-12">
      <ClerkUserProfile
        routing="path"
        path="/account"
        appearance={{
          ...appearance,
          elements: {
            ...appearance.elements,
            rootBox: 'clerk-profile-root',
            navbar: 'clerk-profile-navbar',
            pageScrollBox: 'clerk-profile-page',
          },
        }}
      />
    </main>
  )
}
