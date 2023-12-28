import type { AppProps } from 'next/app'
import '../globals.css'
import { StyleProvider } from '@ant-design/cssinjs'
import { MessageProvider } from '@/content/message'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StyleProvider hashPriority="high">
      <MessageProvider>
        <Component {...pageProps} />
      </MessageProvider>
    </StyleProvider>
  )
}
