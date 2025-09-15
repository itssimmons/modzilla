export default function contrastRatio(
  foreground: Color.Hex,
  background: Color.Hex
) {
  const luminance = (hex: string) => {
    hex = hex.replace('#', '') // Remove '#' if present
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const textLuminance = luminance(foreground)
  const bgLuminance = luminance(background)
	
	const L1 = Math.max(textLuminance, bgLuminance)
	const L2 = Math.min(textLuminance, bgLuminance)

  return (L1 + 0.05) / (L2 + 0.05)
}
