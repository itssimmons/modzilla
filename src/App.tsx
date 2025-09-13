import { useEffect, useMemo, useState } from 'react'
import { Center, Circle, Container, Flex, Grid, Text } from '@chakra-ui/react'

import ChannelBox from './components/channel-box'
import ChatBox from './components/chat-box'
import Dialog from './components/dialog'
import PlayerCursors from './components/player-cursors'
import TextBox from './components/text-box'
import { Toaster } from './components/ui/toaster'
import { Status } from './enums'
import useHydratedEffect from './hooks/useHydratedEffect'
import useSession from './hooks/useSession'
import Hex from './lib/prototypes/Hex.prototype'
import UserService from './lib/services/User.service'
import channelNp from './socket'

const ROOM_ID = '53c38a2c-9640-4957-92d7-0d4400b2b9ac'

function App() {
  const { session, setSession } = useSession()

  const [connecting, setConnecting] = useState(false)
  const [players, setPlayers] = useState<User[]>([])

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

  const roomId = useMemo(
    () => searchParams.get('roomId') ?? ROOM_ID,
    [searchParams]
  )

  useEffect(() => {
    const listener = () => {
      if (document.visibilityState === 'hidden') {
        channelNp.emit('idle', { room: roomId, user: session })
      } else {
        channelNp.emit('online', { room: roomId, user: session })
      }
    }

    document.addEventListener('visibilitychange', listener)

    return () => {
      document.removeEventListener('visibilitychange', listener)
    }
  }, [session, roomId])

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
      room: roomId
    }

    console.debug(registerPayload)

    UserService.register(registerPayload)
      .then(({ user, is }) => {
        console.debug('User connected & registered: ', user)
        setSession(user)

        channelNp.emit('connected', { room: roomId, user, op: is })
        channelNp.emit('join', { room: roomId })

        searchParams.set('userId', String(user.id))
        searchParams.set('roomId', roomId)
        history.pushState({ user }, '', `?${searchParams.toString()}`)
      })
      .catch(console.error)
      .finally(() => setConnecting(false))
  }, [authenticated, roomId])

  const playersOnline = useMemo(
    () => players.filter((p) => p.status === Status.Online).length,
    [players]
  )

  return (
    <Center w='vw' h='vh' as='section' overflow='hidden'>
      <Toaster />
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
          gridTemplateColumns='225px 1fr'
          border='1px solid {colors.gray.800}'
          width='600px'
          borderRadius='md'
          overflow='hidden'
        >
          <ChannelBox players={players} />
          <ChatBox />
          <TextBox players={players} />
        </Grid>
      </Container>
    </Center>
  )
}

export default App
