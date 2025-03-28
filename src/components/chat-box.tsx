import {
  Badge,
  Box,
  Container,
  Image,
  Text,
  type BoxProps
} from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

import getPlayer from '@/lib/utils/get-player'
import Dayjs from '@/third-party/day'

interface ChatBoxProps extends BoxProps {
  messages: Message[]
  players: User[]
}

export default function ChatBox({ messages, players, ...props }: ChatBoxProps) {
  const scrollBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { current: scrollBox } = scrollBoxRef
    if (!scrollBox) return
    scrollBox.scrollTo(0, scrollBox.scrollHeight)
  }, [messages])

  return (
    <Container
      as='main'
      ref={scrollBoxRef}
      data-role='chat'
      gridRow='1'
      gridColumn='2/3'
      overflowY='scroll'
      scrollbarWidth='thin'
      p={3}
      {...props}
    >
      {messages.length > 0 &&
        players.length > 0 &&
        messages.map((m, i) => {
          const user = getPlayer(m.sender_id, players)
          const prevMessage = messages.at(i - 1)
          const nextMessage = messages.at(i + 1)
          const prevMessageItsMine = prevMessage?.sender_id === user?.id
          const nextMessageItsMine = nextMessage?.sender_id === user?.id
          const isAssistant = user?.role === 'assistant'

          const formatDatetime = (date: string) => {
            const now = Dayjs()
            const createdAt = Dayjs(date, 'YYYY-MM-DD HH:mm:ss')
            if (now.diff(createdAt, 'day') <= 1)
              return `${createdAt.fromNow(true)} ago`
            return createdAt.format('YYYY-MM-DD HH:mm:ss')
          }

          return (
            <Box
              key={m.id}
              py='.5px'
              css={{
                '--dt-visibility': 'hidden',
                _hover: { '--dt-visibility': 'visible' }
              }}
            >
              <Box display='flex' columnGap={2} alignItems='center'>
                {(!prevMessageItsMine || i === 0) && (
                  <Image src={user?.avatar} borderRadius='full' h={5} w={5} />
                )}
                {(!prevMessageItsMine || i === 0) && (
                  <Badge
                    px={1}
                    size='sm'
                    color={user?.color}
                    backgroundColor={user?.color + '12'}
                  >
                    {user.username}
                  </Badge>
                )}
              </Box>
              <Text
                fontSize='small'
                fontWeight={400}
                ml={8}
                color={isAssistant ? 'gray.500' : 'gray.100'}
                mt={!prevMessageItsMine ? 0.5 : 0}
              >
                {m.message}
              </Text>

              {!nextMessageItsMine && (
                <Text
                  visibility='var(--dt-visibility)'
                  fontSize='x-small'
                  color='gray.500'
                  fontWeight={400}
                  ml={8}
                  mb={1}
                >
                  {formatDatetime(m.created_at)}
                </Text>
              )}
            </Box>
          )
        })}
    </Container>
  )
}
