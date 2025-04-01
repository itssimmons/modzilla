import { io } from 'socket.io-client'

const channelNp = io('/channel', {
  transports: ['websocket'],
  reconnection: false
})

export default channelNp
