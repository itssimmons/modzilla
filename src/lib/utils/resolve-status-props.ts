import { Status } from '@/enums'

const resolveStatusProps = (status: Status) => {
  const backgroundColors = {
    [Status.Online]: 'green.400',
    [Status.Offline]: 'gray.600',
    [Status.Writing]: 'yellow.400'
  }

  const borderColors = {
    [Status.Online]: 'green.500',
    [Status.Offline]: 'gray.700',
    [Status.Writing]: 'yellow.500'
  }

  return {
    borderColor: borderColors[status],
    backgroundColor: backgroundColors[status]
  }
}

export default resolveStatusProps
