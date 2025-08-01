import http from '@/lib/helpers/http'
import { Status } from '@/enums'
import { env } from '@/env'

import 'isomorphic-fetch'

class UserService {
  public static async register({
    username,
    ...payload
  }: {
    avatar: string
    username: string
    color: Color.Hex
    room: string
  }) {
    const params = {
      ...payload,
      status: Status.Online
    }

    const res = await http<{ user: User; is: 'new' | 'old' }>(
      `/players/register/${username}`,
      {
        params,
        method: 'GET',
        redirect: 'follow',
        baseUrl: env.VITE_BASE_URL
      }
    )

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const users = await res.json()

    return users
  }

  public static async all() {
    const res = await http<User[]>('/players', {
      method: 'GET',
      redirect: 'follow',
      baseUrl: env.VITE_BASE_URL
    })

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const users = await res.json()

    return users
  }

  public static async updateStatus({
    status,
    userID
  }: {
    status: Status
    userID: number
  }) {
    const res = await http<User>(`/players/${userID}`, {
      method: 'PATCH',
      redirect: 'follow',
      baseUrl: env.VITE_BASE_URL,
      body: { status },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error('Something went wrong 😔')
    }

    const users = await res.json()
    return users
  }
}

export default UserService
