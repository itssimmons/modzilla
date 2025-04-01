import { Avatar, Box, Flex, Image, Text } from '@chakra-ui/react'

import resolveStatusProps from '@/lib/utils/resolve-status-props'
import useSession from '@/hooks/useSession'

interface ChannelBoxProps {
  players: User[]
}

export default function ChannelBox({ players, ...props }: ChannelBoxProps) {
  const { session } = useSession()

  return (
    <Flex
      data-role='channel'
      as='aside'
      w='200px'
      gridRow='1/3'
      gridColumn='1/2'
      flexDir='column'
      borderRight='1px solid {colors.gray.800}'
      {...props}
    >
      <Text
        as='strong'
        py={1.5}
        fontWeight={500}
        fontSize='sm'
        textAlign='center'
        borderBottom='1px solid {colors.border}'
      >
        # Welcome Channel 👋
      </Text>
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
