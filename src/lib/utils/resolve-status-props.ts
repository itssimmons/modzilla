import { Status } from '@/enums'

const resolveStatusProps = (status: Status) => {
  const colors = {
    [Status.Online]: 'green.500',
    [Status.Offline]: 'gray.700',
    [Status.Typing]: 'green.500',
    [Status.Idle]: 'yellow.500'
  }

  return {
    color: colors[status]
  }
}

export default resolveStatusProps
