type ID = number
type UUID = `${string}-${string}-${string}-${string}-${string}`
type Char = `${string & { length: 1 }}`;

type AxisCoords = { x: number; y: number }

namespace Color {
  export type Hex = `#${string}`
}
