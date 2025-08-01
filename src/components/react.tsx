import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction
} from 'react'
import { Center, Box as ChakraBox, type BoxProps } from '@chakra-ui/react'

import { ConfigCtx } from '@/providers/Config.provider'

type ReactCtxState = {
  triggerRef: RefObject<HTMLDivElement | null> | null
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  value: string | null
  setValue: Dispatch<SetStateAction<string | null>>
}

const ReactCtx = createContext<ReactCtxState>({
  triggerRef: null,
  // modal state (open/closed)
  open: false,
  setOpen: () => {},
  // value of the selected item
  value: null,
  setValue: () => {}
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace React {
  export const Root = ({
    children,
    ...props
  }: {
    onSelect?: (e: { value: string | null }) => void
    open?: boolean
    setOpen?: Dispatch<SetStateAction<boolean>>
    children: ReactNode
  }) => {
    const triggerRef = useRef<HTMLDivElement>(null)
    const [value, setValue] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
      props.onSelect?.({ value })
    }, [value])

    const memoizedValue = useMemo(
      () => ({
        triggerRef,
        open: props.open ?? open,
        setOpen: props.setOpen ?? setOpen,
        value,
        setValue
      }),
      [open, props.open, value, triggerRef]
    )

    return (
      <ReactCtx.Provider value={memoizedValue}>
        <ChakraBox as='section' {...props}>
          {children}
        </ChakraBox>
      </ReactCtx.Provider>
    )
  }

  export const Trigger = ({ children, ...props }: BoxProps) => {
    const { triggerRef, setOpen } = useContext(ReactCtx)

    const handleClick = () => {
      setOpen(!open)
    }

    return (
      <ChakraBox
        as='div'
        ref={triggerRef}
        onClick={handleClick}
        textAlign='left'
        {...props}
      >
        {children}
      </ChakraBox>
    )
  }

  export const Item = ({
    children,
    ...props
  }: { value: string } & BoxProps) => {
    const { setValue, setOpen } = useContext(ReactCtx)

    const handleClick = () => {
      setValue(props.value)
      setOpen(false)
    }

    return (
      <Center
        as='li'
        aspectRatio={1}
        rounded='full'
        h={8}
        onClick={handleClick}
        _hover={{ bgColor: 'whiteAlpha.100' }}
        {...props}
      >
        {children}
      </Center>
    )
  }

  export const List = ({ children, ...props }: BoxProps) => {
    return (
      <ChakraBox
        as='ul'
        display='flex'
        flexDirection='row'
        alignItems='center'
        listStyle='none'
        rounded='full'
        bgColor='gray.900'
        borderWidth={1}
        borderColor='gray.800'
        columnGap={1}
        p={1}
        {...props}
      >
        {children}
      </ChakraBox>
    )
  }

  export const Positioner = ({
    children,
    origin = 'mouse',
    ...props
  }: { origin?: 'mouse' | 'target' } & BoxProps) => {
    const { triggerRef, open } = useContext(ReactCtx)
    const { mouseX, mouseY } = useContext(ConfigCtx)

    const [coords, setCoords] = useState({ x: 0, y: 0 })

    useEffect(() => {
      let rect: { x: number; y: number } = { x: 0, y: 0 }

      if (origin === 'mouse') {
        rect = { x: mouseX - 25, y: mouseY}
      }

      if (origin === 'target') {
        if (!triggerRef?.current) return
        const { current: trigger } = triggerRef
        rect = trigger.getBoundingClientRect()
      }

      setCoords({ x: rect.x, y: rect.y - 55 })
    }, [open, origin, triggerRef])

    if (!open) return null

    return (
      <ChakraBox
        as='div'
        position='absolute'
        top={coords.y}
        left={coords.x}
        zIndex={1}
        {...props}
      >
        {children}
      </ChakraBox>
    )
  }
}

export default React
