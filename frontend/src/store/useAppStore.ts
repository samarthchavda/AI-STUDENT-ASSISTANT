import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'basic' | 'pro'
  isAdmin?: boolean
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  chatHistory: any[]
  addChatMessage: (message: any) => void
  clearChat: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      chatHistory: [],
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, isAuthenticated: false, chatHistory: [] })
      },
      
      addChatMessage: (message) => 
        set((state) => ({ 
          chatHistory: [...state.chatHistory, message] 
        })),
      
      clearChat: () => set({ chatHistory: [] }),
    }),
    {
      name: 'app-storage',
    }
  )
)
