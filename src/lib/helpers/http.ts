import 'isomorphic-fetch'

interface HttpOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>
  baseUrl?: string
  body?: Record<string, unknown>
}

interface HttpResponse<J> extends Response {
  json: () => Promise<J>
}

export default async function http<T>(
  url: string,
  options: HttpOptions = { method: 'GET', redirect: 'follow' }
): Promise<HttpResponse<T>> {
  const mutableOptions = { ...options } as RequestInit 

  mutableOptions.headers = new Headers(options.headers ?? {})
  let internalUrl = `${options.baseUrl ?? ''}${url}`

  if (options.params) {
    const queryParams = new URLSearchParams()
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        queryParams.append(key, value!.toString())
      }
    }
    internalUrl += `?${queryParams.toString()}`
  }

  if (options.body) {
    mutableOptions.headers.set('Content-Type', 'application/json')
    mutableOptions.body = JSON.stringify(options.body)
  }

  return fetch(internalUrl, mutableOptions)
}
