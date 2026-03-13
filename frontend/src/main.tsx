import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''

// Google Sign-In is blocked on localhost by Google Cloud Console (403 origin error).
// Disable it in local development to prevent console noise.
// In production, add your domain to Authorized JavaScript Origins in Google Cloud Console.
const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(window.location.origin)
const googleClientId = isLocalhost ? '' : rawClientId

const root = (
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  ) : (
    <App />
  )
)

ReactDOM.createRoot(document.getElementById('root')!).render(root)
