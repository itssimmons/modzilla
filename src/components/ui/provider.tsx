'use client'

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defaultSystem,
  defineConfig,
  defineLayerStyles
} from '@chakra-ui/react'

import { ColorModeProvider, type ColorModeProviderProps } from './color-mode'

const layerStyles = defineLayerStyles({
  overlay: {
    description: 'overlay styles',
    value: {
      as: 'span',
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'var(--bg-color)',
      backdropFilter: 'blur(4px)',
      w: 'full',
      h: 'full',
      zIndex: 'overlay'
    }
  }
})

const config = defineConfig({
  theme: {
    layerStyles
  }
})

const system = createSystem(defaultConfig, config)

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
