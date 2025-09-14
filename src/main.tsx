import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { Provider as ChakraProvider } from './components/ui/provider.tsx'
import ChatProvider from './providers/Chat.provider.tsx'
import ConfigProvider from './providers/Config.provider.tsx'
import SessionProvider from './providers/Session.provider.tsx'

import './index.css'

import PlayerProvider from './providers/Player.provider.tsx'
import RoomProvider from './providers/Room.provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <RoomProvider>
        <ChatProvider>
          <PlayerProvider>
            <SessionProvider>
              <ChakraProvider forcedTheme='dark'>
                <App />
              </ChakraProvider>
            </SessionProvider>
          </PlayerProvider>
        </ChatProvider>
      </RoomProvider>
    </ConfigProvider>
  </StrictMode>
)
