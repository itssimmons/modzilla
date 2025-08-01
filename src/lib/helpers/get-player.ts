const getPlayer = (id: number, players: User[]) =>
  players.find((p) => p.id == id)!
export default getPlayer
