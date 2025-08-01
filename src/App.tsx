import { useEffect, useMemo, useState } from 'react'
import { Center, Circle, Container, Flex, Grid, Text } from '@chakra-ui/react'

import ChannelBox from './components/channel-box'
import ChatBox from './components/chat-box'
import Dialog from './components/dialog'
import PlayerCursors from './components/player-cursors'
import TextBox from './components/text-box'
import { Status } from './enums'
import useHydratedEffect from './hooks/useHydratedEffect'
import useSession from './hooks/useSession'
import Hex from './lib/prototypes/Hex.prototype'
import ChatService from './lib/services/Chat.service'
import UserService from './lib/services/User.service'
import channelNp from './socket'

const ROOM_ID = '53c38a2c-9640-4957-92d7-0d4400b2b9ac'

function App() {
  const { session, setSession } = useSession()

  const [connecting, setConnecting] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [players, setPlayers] = useState<User[]>([])
  const [missedMessages, setMissedMessages] = useState<Message[]>([])

  const location = useMemo(() => window.location, [])
  const history = useMemo(() => window.history, [])
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
      const roomID = searchParams.get('roomID')!
      const userID = searchParams.get('userID')!

      if (document.visibilityState === 'hidden') {
        channelNp.emit('idle', { room: roomID, user: session })
        UserService.updateStatus({
          status: Status.Idle,
          userID: Number(userID)
        })
          .then(console.debug)
          .catch(console.error)
      } else {
        channelNp.emit('online', { room: roomID, user: session })
        UserService.updateStatus({
          status: Status.Online,
          userID: Number(userID)
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
    if (missedMessages.length > 0) {
      document.title = `(${missedMessages.length}) modzilla | a real-time chat app`
    }
  }, [missedMessages])

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
    let isVisible = true

    const listener = () => {
      isVisible = document.visibilityState === 'visible'

      if (isVisible) {
        document.title = 'modzilla | a real-time chat app'
        setMissedMessages([])
      }
    }

    document.addEventListener('visibilitychange', listener)

    channelNp.on('main:channel', (message: Message) => {
      console.debug('Message received from server', message)
      setMessages((prev) => [...prev, message])
      if (!isVisible) setMissedMessages((prev) => [...prev, message])
    })

    return () => {
      channelNp.off('main:channel')
      document.removeEventListener('visibilitychange', listener)
    }
  }, [])

  useHydratedEffect(() => {
    UserService.all().then(setPlayers)
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
        console.debug('User connected & registered: ', user)
        setSession(user)

        channelNp.emit('connected', { room: ROOM_ID, user, op: is })
        channelNp.emit('join', { room: ROOM_ID })

        searchParams.set('userID', String(user.id))
        searchParams.set('roomID', ROOM_ID)
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
    <Center w='vw' h='vh' as='section' overflow='hidden'>
      <PlayerCursors players={players} />

      {!authenticated && <Dialog.Unauthorized />}
      {connecting && <Dialog.Connecting />}

      <Container as='main' display='flex' flexDir='column' w='fit' rowGap={1}>
        <Flex as='header' flexDir='row'>
          <Flex flexDir='row' alignItems='center' columnGap={2}>
            <Circle backgroundColor='green.500' size={2} borderRadius='full' />
            <Text fontSize='sm' fontWeight={500} color='gray.400'>
              {playersOnline} users online
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
          <ChatBox players={players} />
          <TextBox players={players} />
        </Grid>
      </Container>
    </Center>
  )
}

export default App
