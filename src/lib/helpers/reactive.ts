export function signal<T>(value: T) {
  let _value = value
  const proxy = new Proxy(
    { value: _value },
    {
      get(target, name, receiver) {
        console.log(`Getting value: ${String(name)}`)
        console.log(target)
        console.log(receiver)
        return `[[${name.toString()}]]`
      }
    }
  )

  return {
    value: proxy.value
  }
}
