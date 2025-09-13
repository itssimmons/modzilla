import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Textarea,
  type StackProps
} from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'

import debounce from '@/lib/helpers/debounce'
import ChatService from '@/lib/services/Chat.service'
import Dayjs from '@/lib/third-party/day'
import useChat from '@/hooks/useChat'
import useSession from '@/hooks/useSession'
import { Status } from '@/enums'
import channelNp from '@/socket'

interface TextBoxProps extends StackProps {
  players: User[]
}

export default function TextBox({ players, ...props }: TextBoxProps) {
  const { session, room } = useSession()
  const { append } = useChat()

  const pendingIdRef = useRef<Chat['id'] | null>(null)

  const [txt, setTxt] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const location = useMemo(() => window.location, [])
  const emptyTxt = useMemo(() => txt.trim().length <= 0, [txt])

  const typingPlayers = useMemo(() => {
    const total = players.filter((p) => p.status === Status.Typing)
    const countAfterSix = total.slice(6).length

    return {
      count: total.length,
      players: total.slice(0, 6),
      countAfterSix: countAfterSix > 9 ? 9 : countAfterSix
    }
  }, [players])

  const stopWriting = useCallback(
    debounce(() => {
      channelNp.emit('activity:channel', {
        user: { ...session, status: Status.Online },
        room,
        is: 'old'
      })
      setIsTyping(false)
    }, 1000),
    []
  )

  const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTxt(ev.target.value)

    if (!isTyping) {
      channelNp.emit('activity:channel', {
        user: { ...session, status: Status.Typing },
        room,
        is: 'old'
      })

      setIsTyping(true)
    }

    stopWriting()
  }

  const handleEnter = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      handleSend(ev)
    }
  }

  const handleSend = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const content = txt.trim()
    if (content.length <= 0) return

    if (!pendingIdRef.current) {
      pendingIdRef.current = uuidv4() as UUID
    }

    const searchParams = new URLSearchParams(location.search)

    const userId = searchParams.get('userId')!
    const roomId = searchParams.get('roomId') as UUID

    const newMessage: Chat = {
      id: pendingIdRef.current,
      message: content,
      sender_id: Number(userId),
      room_id: roomId,
      created_at: Dayjs().format('YYYY-MM-DD HH:mm:ss'),
      modified_at: null,
      modified_id: null,
      player: session!,
      reactions: []
    }

    setTxt('')

    append({ message: newMessage, roomId })
    ChatService.send({ message: content, senderId: Number(userId), roomId }) // delegate to a server thread
    channelNp.emit('message', {
      room: roomId,
      user_id: Number(userId),
      message: content
    })

    pendingIdRef.current = null
  }

  return (
    <Box pos='relative'>
      {typingPlayers.count > 0 && (
        <HStack
          pos='absolute'
          bottom='40px'
          left='0px'
          w='full'
          h='fit'
          pt={2}
          pb={1}
          px={1}
          columnGap={1}
          bgImage={`linear-gradient(0deg, rgba(9,7,11,1) 0%,
            rgba(9,7,11,1) 60%,
            rgba(9,7,11,0) 100%)`}
        >
          <AvatarGroup gap='0' spaceX='-1.5'>
            {typingPlayers.players.map((p) => (
              <Avatar.Root key={p.id} h={5} w={5}>
                <Avatar.Fallback name={p.username} />
                <Avatar.Image src={p.avatar} />
              </Avatar.Root>
            ))}

            {typingPlayers.countAfterSix > 0 && (
              <Avatar.Root h={5} w={5} variant='solid' background='gray.500'>
                <Avatar.Fallback fontSize={6} color='gray.50'>
                  +{typingPlayers.countAfterSix}
                </Avatar.Fallback>
              </Avatar.Root>
            )}
          </AvatarGroup>

          <Flex>
            <Text fontSize='small' fontWeight='light' color='gray.500'>
              Typing
            </Text>
            <AnimatedDots />
          </Flex>
        </HStack>
      )}

      <HStack
        as='footer'
        data-role='message-box'
        gridRow='2'
        h='full'
        gridColumn={'2/3'}
        gap={0}
        {...props}
      >
        <Textarea
          onChange={handleChange}
          onKeyDown={handleEnter}
          value={txt}
          placeholder='Write something interesting...'
          resize='none'
          size='xs'
          p={2}
          h='full'
          fontSize='sm'
          borderRadius={0}
          borderLeft='none'
          borderBottom='none'
          borderRight='none'
          outline='none'
          _focus={{ borderTopColor: 'border' }}
        ></Textarea>
        <Button
          onClick={handleSend}
          disabled={emptyTxt}
          variant='solid'
          h='full'
          w='100px'
          fontSize='xs'
          type='button'
          backgroundColor='green.400'
          borderRadius={0}
        >
          Send
        </Button>
      </HStack>
    </Box>
  )
}

const AnimatedDots = () => {
  return (
    <Flex columnGap='.8px' fontSize='small' fontWeight='light' color='gray.500'>
      <Box
        animationName='jump'
        animationDuration='1300ms'
        animationDelay='0ms'
        animationIterationCount='infinite'
        animationTimingFunction='linear'
      >
        .
      </Box>
      <Box
        animationName='jump'
        animationDuration='1300ms'
        animationDelay='-1100ms'
        animationIterationCount='infinite'
        animationTimingFunction='linear'
      >
        .
      </Box>
      <Box
        animationName='jump'
        animationDuration='1300ms'
        animationDelay='-900ms'
        animationIterationCount='infinite'
        animationTimingFunction='linear'
      >
        .
      </Box>
    </Flex>
  )
}
