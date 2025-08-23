import {
  Avatar,
  Box,
  Flex,
  HStack,
  Image,
  Text,
  VStack
} from '@chakra-ui/react'

import resolveStatusProps from '@/lib/helpers/resolve-status-props'
import useRoom from '@/hooks/useRoom'
import useSession from '@/hooks/useSession'

interface ChannelBoxProps {
  players: User[]
}

export default function ChannelBox({ players, ...props }: ChannelBoxProps) {
  const { session } = useSession()
  const { room } = useRoom()

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
            players.map((p) => {
              const r = resolveStatusProps(p.status)

              return (
                <Box
                  key={p.id}
                  display='flex'
                  columnGap={3}
                  alignItems='center'
                  cursor='pointer'
                  pl={2}
                  _hover={{ backgroundColor: 'gray.700' }}
                >
                  <Flex
                    flexDir='row'
                    alignItems='center'
                    columnGap={1.5}
                    py={1.5}
                  >
                    <Avatar.Root
                      w={4.5}
                      h={4.5}
                      boxShadow={`0px 0px 0px 1px {colors.gray.800},
                      0px 0px 0px 3px {colors.${r.color}}`}
                    >
                      <Avatar.Image src={p.avatar} />
                    </Avatar.Root>
                    <Text fontSize='small' fontWeight={500} color='gray.300'>
                      {p.username} {p.id === session?.id && '(You)'}
                    </Text>
                  </Flex>
                </Box>
              )
            })}
        </Flex>
      </Flex>
    </Flex>
  )
}
