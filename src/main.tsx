import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { Provider as ChakraProvider } from './components/ui/provider.tsx'
import ConfigProvider from './providers/Config.provider.tsx'
import MessageProvider from './providers/Message.provider.tsx'
import SessionProvider from './providers/Session.provider.tsx'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <MessageProvider>
        <SessionProvider>
          <ChakraProvider forcedTheme='dark'>
            <App />
          </ChakraProvider>
        </SessionProvider>
      </MessageProvider>
    </ConfigProvider>
  </StrictMode>
)
