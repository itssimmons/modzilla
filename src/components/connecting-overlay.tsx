import { Box, Center, Spinner, Text } from '@chakra-ui/react'

export default function ConnectingOverlay() {
  return (
    <Box layerStyle='overlay'>
      <Center w='vw' h='vh' flexDir='column' rowGap={2}>
        <Center
          backgroundColor='gray.900'
          p={4}
          flexDir='row'
          columnGap={3}
          borderRadius={6}
        >
          <Spinner />
          <Text fontSize='md' w='max'>
            Establishing connection... 🚀
          </Text>
        </Center>
      </Center>
    </Box>
  )
}
