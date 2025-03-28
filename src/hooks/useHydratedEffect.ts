import {
  useEffect,
  useState,
  type DependencyList,
  type EffectCallback
} from 'react'

export default (effect: EffectCallback, deps: DependencyList = []) => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)

    if (hydrated) {
      return effect()
    }
  }, [hydrated, ...deps])
}
