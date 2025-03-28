class Hex {
  public static random() {
    let hex = ''
    const str = '123456789ABCDEF'

    while (hex.length < 6) {
      const idx = Math.floor(Math.random() * (15 - 0) + 0)
      hex += str[idx]
    }

    return hex
  }
}

export default Hex
