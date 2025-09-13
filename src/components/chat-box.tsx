'use client'

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Container,
  Editable,
  Flex,
  IconButton,
  Menu,
  Portal,
  Text,
  useEditable,
  type BoxProps
} from '@chakra-ui/react'
import { LuCheck, LuX } from 'react-icons/lu'

import accumulate from '@/lib/helpers/accumulate'
import Dayjs from '@/lib/third-party/day'
import useChat from '@/hooks/useChat'
import useHydratedEffect from '@/hooks/useHydratedEffect'
import useSession from '@/hooks/useSession'
import ReactMenu from '@/components/react'
import channelNp from '@/socket'

export default function ChatBox({ ...props }: BoxProps) {
  const { state: messages, dispatch } = useChat()
  const scrollBoxRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const { current: scrollBox } = scrollBoxRef
    if (!scrollBox) return
    scrollBox.scrollTo(0, scrollBox.scrollHeight)
  }, [messages.length])
  //  ^^^ what about deletions?

  useHydratedEffect(() => {
    channelNp.on(
      'channel:reaction',
      (payload: { id: UUID; reaction: Exclude<Reaction, 'id'> }) => {
        dispatch({
          type: 'REACT',
          payload: {
            id: payload.id,
            reaction: payload.reaction
          }
        })
      }
    )

    channelNp.on(
      'channel:edition',
      (payload: { id: UUID; message: string }) => {
        dispatch({
          type: 'EDIT',
          payload: { id: payload.id, message: payload.message }
        })
      }
    )

    channelNp.on('channel:deletion', (payload: { id: UUID }) => {
      dispatch({ type: 'REMOVE', payload: { id: payload.id } })
    })

    return () => {
      channelNp.off('channel:reaction')
      channelNp.off('channel:edition')
      channelNp.off('channel:deletion')
    }
  }, [])

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
          return <Message.Content {...m} key={m.id} idx={i} />
        })}
    </Container>
  )
}

const Content = (props: { idx: number } & Chat) => {
  const { session } = useSession()
  const { state: messages, react, edit, remove, copy } = useChat()

  const pendingReactionId = useRef<Reaction['id'] | null>(null)
  const editableInputRef = useRef<HTMLInputElement>(null)
  const editableChatId = useRef<UUID | null>(null)

  const [chatId, setChatId] = useState<UUID | null>(null)
  const [action, setAction] = useState<
    'react' | 'edit' | 'delete' | 'copy' | null
  >(null)

  const [value, setValue] = useState<string>(props.message)

  useHydratedEffect(() => {
    setValue(props.message)
  }, [props.message])

  const editable = useEditable({
    value: value,
    onValueChange: (ev) => setValue(ev.value),
    disabled: action !== 'edit',
    submitMode: 'enter',
    onValueCommit: (value) => {
      if (
        editableChatId.current === null ||
        editableInputRef.current === null
      ) {
        return
      }

      const chat = messages.find((m) => m.id === editableChatId.current)!
      edit({
        id: editableChatId.current,
        message: value.value,
        roomId: chat.room_id
      })

      setAction(null)
      setChatId(null)
      editableChatId.current = null
    }
  })

  const user = useMemo(() => props.player, [props.player])
  const prevChat = useMemo(
    () => messages.at(props.idx - 1),
    [messages, props.idx]
  )
  const nextChat = useMemo(
    () => messages.at(props.idx + 1),
    [messages, props.idx]
  )
  const isPrevChatMine = useMemo(
    () => prevChat?.sender_id === user?.id,
    [prevChat, user]
  )
  const isNextChatMine = useMemo(
    () => nextChat?.sender_id === user?.id,
    [nextChat, user]
  )
  const isStaff = useMemo(() => user?.role === 'staff', [user])

  const createdAt = useMemo(() => {
    const now = Dayjs()
    const createdAt = Dayjs(props.created_at)
    if (now.diff(createdAt, 'hours') <= 24)
      return `${createdAt.fromNow(true)} ago`
    return createdAt.format('DD MMM YY, HH:mm')
  }, [props.created_at])

  const totalReactions = useMemo(
    () => accumulate(props.reactions, 'count'),
    [props.reactions]
  )

  const handleReaction = (payload: { senderId: ID; emoji: Char }) => {
    if (pendingReactionId.current !== null) return
    if (!chatId) return

    const message = messages.find((m) => m.id === chatId)!
    const nextId = message.reactions.length
    pendingReactionId.current = nextId

    react({
      id: chatId,
      roomId: message.room_id,
      reaction: {
        id: nextId,
        emoji: payload.emoji,
        chat_id: chatId,
        sender_id: payload.senderId,
        created_at: Dayjs().format('YYYY-MM-DD HH:mm:ss'),
        count: 1
      }
    })

    setChatId(null)
    setAction(null)
    pendingReactionId.current = null
  }

  return (
    <Box
      py='.5px'
      css={{
        '--datetime-visibility': 'hidden',
        _hover: { '--datetime-visibility': 'visible' }
      }}
    >
      <Box display='flex' columnGap={2} alignItems='center'>
        {(!isPrevChatMine || props.idx === 0) && (
          <Avatar.Root w={5} h={5}>
            <Avatar.Image loading='lazy' src={user.avatar} />
          </Avatar.Root>
        )}
        {(!isPrevChatMine || props.idx === 0) && (
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
          setChatId(props.id)

          const caseHandlers: { [key: string]: () => void } = {
            // 'react': () => { ? },
            delete: () => remove({ id: props.id, roomId: props.room_id }),
            copy: () => copy(props.message),
            edit: () => {
              editableChatId.current = props.id
              editableInputRef.current?.focus()
            }
          }

          caseHandlers[e.value]?.()
        }}
      >
        <Menu.ContextTrigger width='full'>
          <Box position='relative' display='flex' flexDir='column' rowGap={0.5}>
            <Flex alignItems='center' columnGap={1}>
              <Editable.RootProvider
                value={editable}
                textAlign='left'
                fontSize='small'
                fontWeight={400}
                rounded='md'
                ml={8}
                minW='fit'
                h='24px'
                mt={!isPrevChatMine ? 0.5 : 0}
                color={isStaff ? 'gray.500' : 'gray.100'}
                _hover={{
                  background: !editable.editing
                    ? 'whiteAlpha.100'
                    : 'transparent'
                }}
              >
                <Editable.Preview minH='24px' p={0} />
                <Editable.Input
                  ref={editableInputRef}
                  disabled={editableChatId.current !== props.id}
                  outline='none'
                />

                <Editable.Control>
                  <Editable.SubmitTrigger asChild onClick={editable.submit}>
                    <IconButton
                      as='span'
                      variant='outline'
                      minW='22px'
                      h='22px'
                      css={{
                        _icon: {
                          color: 'gray.500',
                          width: 3,
                          height: 3
                        }
                      }}
                    >
                      <LuCheck />
                    </IconButton>
                  </Editable.SubmitTrigger>
                  <Editable.CancelTrigger asChild>
                    <IconButton
                      as='span'
                      variant='outline'
                      minW='22px'
                      h='22px'
                      css={{
                        _icon: {
                          color: 'gray.500',
                          width: 3,
                          height: 3
                        }
                      }}
                    >
                      <LuX />
                    </IconButton>
                  </Editable.CancelTrigger>
                </Editable.Control>
              </Editable.RootProvider>
            </Flex>

            {props.reactions.length > 0 && (
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
                {props.reactions.map((r) => (
                  <Text key={r.id} fontSize='x-small' color='gray.500' p={1}>
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
              <Menu.Item value='copy'>Copy</Menu.Item>
              <Menu.Item value='delete' color='red.500'>
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <ReactMenu.Root
        open={action === 'react'}
        setOpen={(open) => setAction(open ? 'react' : null)}
        onSelect={(e) => {
          handleReaction({
            senderId: session!.id,
            emoji: e.value as Char
          })
        }}
      >
        <Portal>
          <ReactMenu.Positioner origin='mouse'>
            <ReactMenu.List>
              <ReactMenu.Item value='👍'>👍</ReactMenu.Item>
              <ReactMenu.Item value='👎'>👎</ReactMenu.Item>
              <ReactMenu.Item value='❤️'>❤️</ReactMenu.Item>
              <ReactMenu.Item value='😂'>😂</ReactMenu.Item>
              <ReactMenu.Item value='🔥'>🔥</ReactMenu.Item>
            </ReactMenu.List>
          </ReactMenu.Positioner>
        </Portal>
      </ReactMenu.Root>

      {!isNextChatMine && (
        <Text
          visibility='var(--datetime-visibility)'
          fontSize='x-small'
          color='gray.500'
          fontWeight={400}
          ml={8}
          mb={1}
        >
          {createdAt}
        </Text>
      )}
    </Box>
  )
}

const Message = {
  Content: React.memo(Content)
}
