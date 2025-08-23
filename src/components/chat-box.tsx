import { useEffect, useRef, useState } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Container,
  Menu,
  Portal,
  Text,
  type BoxProps
} from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'

import getPlayer from '@/lib/helpers/get-player'
import Dayjs from '@/lib/third-party/day'
import useMessage from '@/hooks/useChat'
import useSession from '@/hooks/useSession'

import React from './react'

interface ChatBoxProps extends BoxProps {
  players: User[]
}

export default function ChatBox({ players, ...props }: ChatBoxProps) {
  const scrollBoxRef = useRef<HTMLDivElement>(null)
  const [action, setAction] = useState<'react' | 'edit' | 'delete' | null>(null)

  const { session } = useSession()
  const { state: messages, react } = useMessage()

  useEffect(() => {
    const { current: scrollBox } = scrollBoxRef
    if (!scrollBox) return
    scrollBox.scrollTo(0, scrollBox.scrollHeight)
  }, [messages])

  const reactMessage =
    ({ id, senderId }: { id: Chat['id']; senderId: number }) =>
    (e: { value: string | null }) => {
      if (!e.value) return
      react(id, {
        id: uuidv4(),
        emoji: e.value,
        chat_id: id,
        sender_id: senderId,
        created_at: Date.now().toString(),
        count: 1
      })
    }

  return (
    <Container
      as='main'
      ref={scrollBoxRef}
      data-role='chat'
      gridRow='1'
      gridColumn='2/3'
      overflowY='scroll'
      scrollbarWidth='thin'
      px={3}
      pt={3}
      pb={4}
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
          const isStaff = user?.role === 'staff'

          const formatDatetime = (date: string) => {
            const now = Dayjs()
            const createdAt = Dayjs(date)
            if (now.diff(createdAt, 'hours') <= 24)
              return `${createdAt.fromNow(true)} ago`
            return createdAt.format('DD MMM YY, HH:mm')
          }

          return (
            <Box
              key={m.id}
              py='.5px'
              css={{
                '--datetime-visibility': 'hidden',
                _hover: { '--datetime-visibility': 'visible' }
              }}
            >
              <Box display='flex' columnGap={2} alignItems='center'>
                {(!prevMessageItsMine || i === 0) && (
                  <Avatar.Root w={5} h={5}>
                    <Avatar.Image loading='lazy' src={user.avatar} />
                  </Avatar.Root>
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

              <Menu.Root onSelect={(e) => setAction(e.value as typeof action)}>
                <Menu.ContextTrigger width='full'>
                  <Text
                    fontSize='small'
                    fontWeight={400}
                    rounded='md'
                    ml={8}
                    p={1}
                    textAlign='left'
                    mt={!prevMessageItsMine ? 0.5 : 0}
                    color={isStaff ? 'gray.500' : 'gray.100'}
                    _hover={{ background: 'whiteAlpha.100' }}
                  >
                    {m.message}
                  </Text>
                </Menu.ContextTrigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item value='react'>React</Menu.Item>
                      <Menu.Item value='edit'>Edit</Menu.Item>
                      <Menu.Item value='delete' color='red.500'>
                        Delete
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>

              <React.Root
                open={action === 'react'}
                setOpen={(open) => setAction(open ? 'react' : null)}
                onSelect={reactMessage({ id: m.id, senderId: session!.id })}
              >
                <Portal>
                  <React.Positioner origin='mouse'>
                    <React.List>
                      <React.Item value='👍'>👍</React.Item>
                      <React.Item value='👎'>👎</React.Item>
                    </React.List>
                  </React.Positioner>
                </Portal>
              </React.Root>

              {!nextMessageItsMine && (
                <Text
                  visibility='var(--datetime-visibility)'
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
