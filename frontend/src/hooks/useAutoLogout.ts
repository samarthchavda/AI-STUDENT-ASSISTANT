import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const TOKEN_CHECK_INTERVAL = 60 * 1000 // Check every minute

export function useAutoLogout() {
  const navigate = useNavigate()
  const { logout, isAuthenticated } = useAppStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        logout()
        navigate('/auth', { state: { message: 'Session expired due to inactivity' } })
      }, INACTIVITY_TIMEOUT)
    }
  }

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      if (isAuthenticated) {
        logout()
        navigate('/auth', { state: { message: 'Session expired' } })
      }
      return
    }

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()

      if (currentTime >= expirationTime) {
        logout()
        navigate('/auth', { state: { message: 'Session expired' } })
      }
    } catch (error) {
      console.error('Error checking token expiration:', error)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
      return
    }

    // Set up inactivity timer
    resetTimer()

    // Set up token expiration checker
    checkIntervalRef.current = setInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL)
    checkTokenExpiration() // Check immediately

    // Events that indicate user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer)
    })

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [isAuthenticated, logout, navigate])

  return null
}
