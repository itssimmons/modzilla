import React, { useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Flex,
  HStack,
  Image,
  Menu,
  Portal,
  Show,
  Text,
  VStack
} from '@chakra-ui/react'

import useCountdown from '@/hooks/useCountdown'
import useHydratedEffect from '@/hooks/useHydratedEffect'
import { usePlayer } from '@/hooks/usePlayer'
import useRoom from '@/hooks/useRoom'
import useSession from '@/hooks/useSession'
import { Status } from '@/enums'
import channelNp from '@/socket'

import { toaster } from './ui/toaster'
import { Tooltip } from './ui/tooltip'

interface ChannelBoxProps {
  players: User[]
}

export default function ChannelBox({ players, ...props }: ChannelBoxProps) {
  const { room } = useRoom()

  const countdown = useCountdown()

  useHydratedEffect(() => {
    channelNp.on('channel:block', (data) => {
      console.debug('Blocked data=', data)

      toaster.create({
        description: `You have been blocked by @${data.from.username}`,
        type: 'info'
      })
      
      countdown.start()
      console.log(countdown.signal())
    })

    return () => {
      channelNp.off('channel:block')
    }
  }, [])

  return (
    <Flex
      data-role='channel'
      as='aside'
      gridRow='1/3'
      gridColumn='1/2'
      flexDir='column'
      borderRight='1px solid {colors.gray.800}'
      {...props}
    >
      <HStack
        rowGap={1}
        alignItems='flex-start'
        p={2}
        borderBottomWidth={1}
        borderBottomColor='gray.800'
        mb={2}
      >
        <Image
          src={room?.logo ?? undefined}
          alt={`Logo of ${room?.name}`}
          maxH={12}
          aspectRatio={1}
          rounded='lg'
          mt={1}
        />
        <VStack rowGap={0.5}>
          <Text
            as='strong'
            fontWeight={500}
            fontSize='sm'
            color='gray.50'
            w='full'
          >
            {room?.name}
          </Text>
          <Text fontSize='xs' color='gray.400'>
            {room?.description}
          </Text>
        </VStack>
      </HStack>
      <Flex flexDir='row' overflowY='auto'>
        <Flex flexDir='column' w='full'>
          {players.length > 0 &&
            players.map((p, i) => <Player.Content {...p} key={p.id} idx={i} />)}
        </Flex>
      </Flex>
    </Flex>
  )
}

const Content = (props: { idx: number } & User) => {
  const { session } = useSession()
  const { copyTag, block, whisper } = usePlayer()
  const { room } = useRoom()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [action, setAction] = useState<'whisper' | 'copy' | 'block' | null>(
    null
  )

  const whisperAllowed = useMemo(() => {
    return (
      props.status !== Status.Offline &&
      props.id !== session?.id &&
      props.username.toLowerCase() !== 'assistant'
    )
  }, [props.status, props.id, props.username, session])

  const blockAllowed = useMemo(() => {
    return (
      props.status !== Status.Offline &&
      props.id !== session?.id &&
      props.username.toLowerCase() !== 'assistant'
    )
  }, [props.id, session])

  const extraProps = useMemo(() => {
    const colors: { [key: string]: string } = {
      [Status.Online]: 'green.500',
      [Status.Offline]: 'gray.700',
      [Status.Typing]: 'green.500',
      [Status.Idle]: 'yellow.500',
      [Status.Blocked]: 'red.500'
    }

    const opacity: { [key: string]: number } = {
      [Status.Blocked]: 0.5
    }

    return {
      color: colors[props.status] || 'gray.500',
      opacity: opacity[props.status] || 1
    }
  }, [props.status])

  return (
    <Box
      display='flex'
      columnGap={3}
      alignItems='center'
      cursor='pointer'
      pl={2}
      opacity={extraProps.opacity}
      _hover={{ backgroundColor: 'gray.700' }}
    >
      <Menu.Root
        onSelect={(e) => {
          setAction(e.value as typeof action)

          console.debug('User props=', props)

          const caseHandlers: { [key: string]: () => void } = {
            copy: () => copyTag(props.username),
            block: () =>
              block({
                roomId: room!.id,
                to: {
                  id: props.id,
                  sid: props.sid
                },
                from: { username: session!.username }
              }),
            whisper: () =>
              whisper.to({
                id: props.id,
                username: props.username,
                sid: props.sid
              })
          }

          caseHandlers[e.value]?.()
        }}
      >
        <Menu.ContextTrigger width='full'>
          <Flex flexDir='row' alignItems='center' columnGap={1.5} py={1.5}>
            <Avatar.Root
              w={4.5}
              h={4.5}
              boxShadow={`0px 0px 0px 1px {colors.gray.800},
                      0px 0px 0px 3px {colors.${extraProps.color}}`}
            >
              <Avatar.Image src={props.avatar} />
            </Avatar.Root>
            <Text fontSize='small' fontWeight={500} color='gray.300'>
              {props.username} {props.id === session?.id && '(You)'}
            </Text>
          </Flex>
        </Menu.ContextTrigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <MenuItem
                value='whisper'
                disabled={!whisperAllowed}
                title={
                  !whisperAllowed ? 'You cannot whisper this user' : undefined
                }
              >
                Whisper
              </MenuItem>
              <MenuItem value='copy'>Copy tag</MenuItem>
              <MenuItem
                value='block'
                color='red.500'
                disabled={!blockAllowed}
                title={!blockAllowed ? 'You cannot block this user' : undefined}
              >
                Block
              </MenuItem>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}

const Player = {
  Content: React.memo(Content)
}

const MenuItem = (props: Menu.ItemProps) => {
  const { value, title, ...rest } = props
  return (
    <Show when={title} fallback={<Menu.Item value={value} {...rest} />}>
      <Tooltip
        ids={{ trigger: value }}
        openDelay={200}
        closeDelay={0}
        positioning={{ placement: 'right' }}
        content={title}
      >
        <Menu.Item value={value} {...rest} />
      </Tooltip>
    </Show>
  )
}
