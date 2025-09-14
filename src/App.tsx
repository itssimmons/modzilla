import { useMemo, useState } from 'react'
import { Center, Circle, Container, Flex, Grid, Text } from '@chakra-ui/react'

import ChannelBox from './components/channel-box'
import ChatBox from './components/chat-box'
import Dialog from './components/dialog'
import PlayerCursors from './components/player-cursors'
import TextBox from './components/text-box'
import { toaster, Toaster } from './components/ui/toaster'
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

  useHydratedEffect(() => {
    UserService.all().then(setPlayers)
  }, [])

  useHydratedEffect(() => {
    channelNp.on(
      'channel:whisper',
      (payload: {
        from: { username: string }
        whisper: string
        roomId: UUID
      }) => {
        toaster.create({
          action: {
            label: 'Dismiss',
            onClick: () => toaster.dismiss()
          },
          title: `@${payload.from.username} whispered on you:`,
          duration: Infinity,
          description: payload.whisper
        })
      }
    )

    return () => {
      channelNp.off('channel:whisper')
    }
  }, [])

  useHydratedEffect(() => {
    if (!session) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        channelNp.emit('player:action', {
          event: 'channel:status',
          room: roomId,
          payload: {
            user: { ...session, status: Status.Idle }
          }
        })
      } else {
        channelNp.emit('player:action', {
          event: 'channel:status',
          room: roomId,
          payload: {
            user: { ...session, status: Status.Online }
          }
        })
      }
    }
    const handleBeforeUnload = () => {
      alert('Are you sure you want to leave?')

      channelNp.emit('player:action', {
        event: 'channel:status',
        room: roomId,
        payload: {
          user: { ...session, status: Status.Offline }
        }
      })
      channelNp.emit('leave', { room: roomId })
      channelNp.disconnect()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [session, roomId])

  useHydratedEffect(() => {
    channelNp.on('channel:status', (payload: { user: User }) => {
      const { user } = payload
      console.debug('Change status=', payload)

      setPlayers((players) => {
        const copy = [...players]

        const idx = copy.findIndex((p) => p.id === user.id)

        if (idx === -1) {
          return [
            ...players,
            {
              ...user,
              status: user.status
            }
          ]
        } else {
          copy[idx] = {
            ...copy[idx],
            sid: user.sid,
            status: user.status
          }
        }

        return copy
      })
    })

    return () => {
      channelNp.off('activity:channel')
    }
  }, [setPlayers])

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
      .then(({ user }) => {
        console.debug('User connected & registered: ', user)
        setSession(user)

        channelNp.emit('connected', { user_id: user.id })
        channelNp.emit('join', { room: roomId })
        /* channelNp.emit('player:action', {
          event: 'channel:status',
          room: roomId,
          payload: {
            user: { ...user, status: Status.Online }
          }
        }) */

        searchParams.set('userId', String(user.id))
        searchParams.set('roomId', roomId)
        history.pushState({ user }, '', `?${searchParams.toString()}`)
      })
      .catch(console.error)
      .finally(() => setConnecting(false))
  }, [authenticated, roomId])

  const onlinePlayerCount = useMemo(
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
              {onlinePlayerCount} Online users
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

      <Toaster />
    </Center>
  )
}

export default App
