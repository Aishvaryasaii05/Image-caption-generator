import { SignIn as ClerkSignIn } from '@clerk/react'

export const appearance = {
  variables: {
    colorPrimary: '#1d4ed8',
    colorBackground: '#050b16',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    borderRadius: '1rem',
  },
  elements: {
    card: 'clerk-auth-card',
    headerTitle: 'clerk-auth-title',
    headerSubtitle: 'clerk-auth-subtitle',
    formButtonPrimary: 'clerk-auth-primary-button',
    socialButtonsBlockButton: 'clerk-auth-social-button',
    socialButtonsBlockButtonText: 'clerk-auth-social-text',
    formFieldLabel: 'clerk-auth-label',
    formFieldInput: 'clerk-auth-input',
    formFieldInputShowPasswordButton: 'clerk-auth-show-password',
    dividerLine: 'clerk-auth-divider-line',
    dividerText: 'clerk-auth-divider-text',
    footerActionText: 'clerk-auth-footer-text',
    footerActionLink: 'clerk-auth-link',
  },
}

export default function SignIn() {
  return (
    <main className="auth-page flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <ClerkSignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={appearance}
      />
    </main>
  )
}
