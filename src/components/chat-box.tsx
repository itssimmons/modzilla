import { useLayoutEffect, useRef, useState } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Container,
  Flex,
  Menu,
  Portal,
  Text,
  type BoxProps
} from '@chakra-ui/react'

import accumulate from '@/lib/helpers/accumulate'
import Dayjs from '@/lib/third-party/day'
import useChat from '@/hooks/useChat'
import useSession from '@/hooks/useSession'

import React from './react'

export default function ChatBox({ ...props }: BoxProps) {
  const { session } = useSession()
  const { state: messages, react } = useChat()

  const scrollBoxRef = useRef<HTMLDivElement>(null)
  const pendingReactionId = useRef<Reaction['id'] | null>(null)

  const [action, setAction] = useState<'react' | 'edit' | 'delete' | null>(null)
  const [messageId, setMessageId] = useState<Chat['id']>('')

  // useLayoutEffect(() => {
  // const { current: scrollBox } = scrollBoxRef
  // if (!scrollBox) return
  // scrollBox.scrollTo(0, scrollBox.scrollHeight)
  // }, [messages])

  const handleMessageReact = (payload: { senderId: number; emoji: string }) => {
    if (pendingReactionId.current !== null) return

    const message = messages.find((m) => m.id === messageId)!
    const nextId = message.reactions.length
    pendingReactionId.current = nextId

    react(messageId, {
      id: nextId,
      emoji: payload.emoji,
      chat_id: messageId,
      sender_id: payload.senderId,
      created_at: Dayjs().format('YYYY-MM-DD HH:mm:ss'),
      count: 1
    })

    setMessageId('')
    pendingReactionId.current = null
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
        messages.map((m, i) => {
          const user = m.player
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

          const totalReactions = accumulate(m.reactions, 'count')

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

              <Menu.Root
                onSelect={(e) => {
                  setAction(e.value as typeof action)
                  setMessageId(m.id)
                }}
              >
                <Menu.ContextTrigger width='full'>
                  <Box position='relative'>
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

                    {m.reactions.length > 0 && (
                      <Flex
                        flexWrap='wrap'
                        alignItems='center'
                        justifyContent='flex-start'
                        width='fit-content'
                        rounded='full'
                        bgColor='gray.800'
                        borderWidth={1}
                        borderColor='gray.700'
                        ml={8}
                      >
                        {m.reactions.map((r) => (
                          <Text
                            key={r.id}
                            fontSize='x-small'
                            color='gray.500'
                            p={1}
                          >
                            {r.emoji}
                          </Text>
                        ))}
                        <Text fontSize='x-small' color='gray.500' p={1}>
                          {totalReactions}
                        </Text>
                      </Flex>
                    )}
                  </Box>
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
                onSelect={(e) => {
                  handleMessageReact({ senderId: session!.id, emoji: e.value! })
                }}
              >
                <Portal>
                  <React.Positioner origin='mouse'>
                    <React.List>
                      <React.Item value='👍'>👍</React.Item>
                      <React.Item value='👎'>👎</React.Item>
                      <React.Item value='❤️'>❤️</React.Item>
                      <React.Item value='😂'>😂</React.Item>
                      <React.Item value='🔥'>🔥</React.Item>
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
