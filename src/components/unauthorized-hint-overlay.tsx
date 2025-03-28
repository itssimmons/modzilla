import { Box, Center, Code, Text } from '@chakra-ui/react'

export default function UnauthorizedHintOverlay() {
  return (
    <Box layerStyle='overlay'>
      <Center w='vw' h='vh'>
        <Text fontSize='md' w='full' textAlign='center'>
          Please authenticate to start chatting by adding your&nbsp;
          <Code>username</Code> in the URL,&nbsp;e.g:&nbsp;
          <Code
            cursor='pointer'
            onClick={(e) => {
              e.preventDefault()
              const txt = (e.target as HTMLSpanElement).textContent!
              navigator.clipboard.writeText(txt)
            }}
          >
            http://localhost:3000?username=JohnDoe
          </Code>
        </Text>
      </Center>
    </Box>
  )
}
