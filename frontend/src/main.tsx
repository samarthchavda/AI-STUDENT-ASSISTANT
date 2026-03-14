import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''
const googleClientId = rawClientId

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
