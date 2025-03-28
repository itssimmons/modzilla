import { useEffect, useMemo, useState } from 'react'
import { Center, Circle, Container, Flex, Grid, Text } from '@chakra-ui/react'

import ChannelBox from './components/channel-box'
import ChatBox from './components/chat-box'
import ConnectingOverlay from './components/connecting-overlay'
import TextBox from './components/text-box'
import UnauthorizedHintOverlay from './components/unauthorized-hint-overlay'
import { Status } from './enums'
import useHydratedEffect from './hooks/useHydratedEffect'
import useSession from './hooks/useSession'
import Hex from './prototypes/Hex.prototype'
import ChatService from './services/Chat.service'
import UserService from './services/User.service'
import channelNp from './socket'

const ROOM_ID = '53c38a2c-9640-4957-92d7-0d4400b2b9ac'

function App() {
  const { session, setSession } = useSession()

  const [connecting, setConnecting] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [players, setPlayers] = useState<User[]>([])

  const location = useMemo(() => window.location, [window.location])
  const history = useMemo(() => window.history, [window.history])
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )

  const authenticated = useMemo(
    () => searchParams.has('username'),
    [searchParams]
  )

  useEffect(() => {
    const listener = () => {
      const roomId = searchParams.get('roomId')!
      const userId = searchParams.get('userId')!

      if (document.visibilityState === 'hidden') {
        channelNp.emit('left', { room: roomId, user: session })
        UserService.updateStatus({
          status: Status.Offline,
          userId: Number(userId)
        })
          .then(console.debug)
          .catch(console.error)
      } else {
        channelNp.emit('join', { room: roomId, user: session })
        UserService.updateStatus({
          status: Status.Online,
          userId: Number(userId)
        })
          .then(console.debug)
          .catch(console.error)
      }
    }

    document.addEventListener('visibilitychange', listener)

    return () => {
      document.removeEventListener('visibilitychange', listener)
    }
  }, [session])

  useHydratedEffect(() => {
    channelNp.on(
      'activity:channel',
      (payload: { user: User; is: 'new' | 'join' | 'leave' }) => {
        const { is, user } = payload
        console.debug('Activity received from server', payload)

        setPlayers((players) => {
          const copy = [...players]

          if (is === 'new') copy.push(user)
          else {
            const index = copy.findIndex((p) => p.id === user.id)
            if (index !== -1) copy[index].status = user.status
          }

          return copy
        })
      }
    )

    return () => {
      channelNp.off('activity:channel')
    }
  }, [players])

  useHydratedEffect(() => {
    channelNp.on('main:channel', (message: Message) => {
      console.debug('Message received from server', message)

      setMessages((prev) => [...prev, message])
    })

    return () => {
      channelNp.off('main:channel')
    }
  }, [])

  useHydratedEffect(() => {
    UserService.all().then(setPlayers)
    ChatService.all().then(setMessages)
  }, [])

  useHydratedEffect(() => {
    if (!authenticated) return
    setConnecting(true)

    const color = Hex.random()
    const username = searchParams.get('username')!

    const registerPayload: {
      username: string
      color: Color.Hex
      avatar: string
      room: string
    } = {
      username,
      color: `#${color}`,
      avatar: `https://ui-avatars.com/api/?background=${color}&name=${username}&length=1`,
      room: ROOM_ID
    }

    console.debug(registerPayload)

    UserService.register(registerPayload)
      .then(({ user, is }) => {
        console.debug('User registered', user)
        setSession(user)

        channelNp.emit('join', { room: ROOM_ID, user, op: is })
        searchParams.set('userId', String(user.id))
        searchParams.set('roomId', ROOM_ID)
        history.pushState({ user }, '', `?${searchParams.toString()}`)
      })
      .catch(console.error)
      .finally(() => setConnecting(false))
  }, [authenticated])

  const playersOnline = useMemo(
    () => players.filter((p) => p.status === Status.Online).length,
    [players]
  )

  return (
    <Center w='vw' h='vh'>
      {!authenticated && <UnauthorizedHintOverlay />}
      {connecting && <ConnectingOverlay />}

      <Container as='main' display='flex' flexDir='column' w='fit' rowGap={1}>
        <Flex as='header' flexDir='row'>
          <Flex flexDir='row' alignItems='center' columnGap={2}>
            <Circle backgroundColor='green.500' size={2} borderRadius='full' />
            <Text fontSize='sm' fontWeight={500} color='gray.400'>
              {playersOnline} players online
            </Text>
          </Flex>
        </Flex>
        <Grid
          gridTemplateRows='300px 40px'
          gridTemplateColumns='200px 1fr'
          border='1px solid {colors.gray.800}'
          width='600px'
          borderRadius='md'
          overflow='hidden'
        >
          <ChannelBox players={players} />
          <ChatBox messages={messages} players={players} />
          <TextBox dispatch={setMessages} />
        </Grid>
      </Container>
    </Center>
  )
}

export default App
