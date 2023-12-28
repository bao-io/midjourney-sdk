import { createContext } from 'react'

const ToastContent = createContext<{ name: string } | null>(null)

export default function MjToast({ children }: { children: React.ReactNode }) {
  return (
    <ToastContent.Provider value={{ name: '1231' }}>
      {children}
    </ToastContent.Provider>
  )
}

export function useToast() {}
