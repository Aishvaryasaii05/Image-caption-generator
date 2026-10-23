import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  root.render(
    <main className="mx-auto max-w-2xl px-6 py-20 text-center text-gray-100">
      <h1 className="text-2xl font-bold">Authentication setup required</h1>
      <p className="mt-4 leading-7 text-gray-400">
        Add VITE_CLERK_PUBLISHABLE_KEY to client/.env.local and the matching
        CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to server/.env, then restart both.
      </p>
    </main>,
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  );
}
