import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'basic' | 'pro'
  isAdmin?: boolean
  phone?: string
  phoneVerified?: boolean
  college?: string
  branch?: string
  cgpa?: string
  graduationYear?: string
  linkedinUrl?: string
  githubUrl?: string
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  chatHistory: any[]
  addChatMessage: (message: any) => void
  clearChat: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      chatHistory: [],
      
      setUser: (user) => {
        // Clear chat history when switching users
        const currentUser = get().user
        const switchingUsers = currentUser && user && currentUser.id !== user.id
        
        set({ 
          user, 
          isAuthenticated: !!user,
          chatHistory: switchingUsers ? [] : get().chatHistory
        })
      },

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
      
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
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
      onRehydrateStorage: () => (state) => {
        const token = localStorage.getItem('token')
        if (!token && state?.isAuthenticated) {
          state.logout()
        }
      },
    }
  )
)
