import { useHydrated } from '@/hooks'
import { createContext } from 'react'

const ToastContent = createContext<{ name: string } | null>(null)

export default function MjToast({ children }: { children: React.ReactNode }) {
  const hy = useHydrated()
  return (
    <ToastContent.Provider value={{ name: '1231' }}>
      {children}
      {/* {hy && <div>111</div>} */}
    </ToastContent.Provider>
  )
}

export const useToast = () => {}
