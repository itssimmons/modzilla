import { Box, Flex } from '@chakra-ui/react'

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

export default AnimatedDots
