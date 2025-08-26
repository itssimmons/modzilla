import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction
} from 'react'
import { Center, Box as ChakraBox, type BoxProps } from '@chakra-ui/react'

import { ConfigCtx } from '@/providers/Config.provider'

type ReactCtxState = {
  triggerRef: RefObject<HTMLDivElement | null> | null
  parentRef: RefObject<HTMLDivElement | null> | null
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onSelect?: (e: { value: string | null }) => void
}

const ReactCtx = createContext<ReactCtxState>({
  triggerRef: null,
  parentRef: null,
  // modal state (open/closed)
  open: false,
  setOpen: () => {},
  onSelect: () => {}
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace React {
  interface RootProps extends Omit<BoxProps, 'onSelect'> {
    onSelect?: (e: { value: string | null }) => void
    open?: boolean
    setOpen?: Dispatch<SetStateAction<boolean>>
    children: ReactNode
  }

  export const Root = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    onSelect,
    ...props
  }: RootProps) => {
    const triggerRef = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)

    const memoizedValue = useMemo(
      () => ({
        triggerRef,
        parentRef,
        open: openProp ?? open,
        setOpen: setOpenProp ?? setOpen,
        onSelect
      }),
      [openProp, triggerRef, parentRef]
    )

    return (
      <ReactCtx.Provider value={memoizedValue}>
        <ChakraBox
          as='section'
          ref={parentRef}
          aria-selected={false}
          {...props}
        >
          {children}
        </ChakraBox>
      </ReactCtx.Provider>
    )
  }

  Root.displayName = 'ReactRoot'

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

  Trigger.displayName = 'ReactTrigger'

  export const Item = ({
    children,
    ...props
  }: { value: string } & BoxProps) => {
    const { setOpen, onSelect, parentRef } = useContext(ReactCtx)

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (onSelect) {
        onSelect({ value: props.value })
        parentRef?.current?.setAttribute('aria-selected', props.value)
      }

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

  Item.displayName = 'ReactItem'

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

  List.displayName = 'ReactList'

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
        rect = { x: mouseX - 25, y: mouseY }
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

  Positioner.displayName = 'ReactPositioner'
}

export default React
