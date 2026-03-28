import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''
const googleClientId = rawClientId

if (import.meta.env.DEV) {
  const maskedClientId = googleClientId
    ? `${googleClientId.slice(0, 14)}...${googleClientId.slice(-12)}`
    : '(empty)'

  console.info('[Google OAuth Debug]', {
    origin: window.location.origin,
    clientId: maskedClientId,
    configuredOrigins: String(import.meta.env.VITE_GOOGLE_AUTHORIZED_ORIGINS || ''),
  })
}

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
