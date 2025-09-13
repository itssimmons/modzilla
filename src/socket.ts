import { io } from 'socket.io-client'

const channelNp = io('ws://192.168.0.61:8000/channel', {
  transports: ['websocket'],
  reconnection: false,
  // host: '192.168.0.61',
  // port: 8000,
  path: '/socket.io',
})

export default channelNp
