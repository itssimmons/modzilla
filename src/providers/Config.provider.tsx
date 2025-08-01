import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react'

export const ConfigCtx = createContext<{
  mouseX: number
  mouseY: number
  setMouseX: Dispatch<SetStateAction<number>>
  setMouseY: Dispatch<SetStateAction<number>>
}>({
  mouseX: 0,
  mouseY: 0,
  setMouseX: () => {},
  setMouseY: () => {}
})

const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }

    window.addEventListener('mousemove', listener)

    return () => {
      window.removeEventListener('mousemove', listener)
    }
  }, [])

  const value = useMemo(
    () => ({ mouseX, setMouseX, mouseY, setMouseY }),
    [mouseX, mouseY]
  )

  return <ConfigCtx.Provider value={value}>{children}</ConfigCtx.Provider>
}

export default ConfigProvider
