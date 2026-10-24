import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './lib/auth';
import { ClerkProvider } from '@clerk/react';

const root = ReactDOM.createRoot(document.getElementById('root'));
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  root.render(
    <main className="auth-page flex min-h-screen items-center justify-center px-6 py-20 text-center text-gray-100">
      <div className="auth-card w-full max-w-lg rounded-3xl border border-gray-800 bg-gray-950 p-8 shadow-2xl">
      <h1 className="text-2xl font-bold">Clerk authentication setup required</h1>
      <p className="mt-4 leading-7 text-gray-400">
        Add VITE_CLERK_PUBLISHABLE_KEY to client/.env.local, then restart the frontend.
      </p>
      </div>
    </main>,
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ClerkProvider>
    </React.StrictMode>,
  );
}
