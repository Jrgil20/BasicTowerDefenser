import { TowerType } from "./game-types"

export const MAP_WIDTH = 15
export const MAP_HEIGHT = 10
export const CELL_SIZE = 40

export const INITIAL_HEALTH = 100
export const INITIAL_RESOURCES = 150

export const TOWER_COSTS: Record<TowerType, number> = {
  [TowerType.BASIC]: 50,
  [TowerType.SNIPER]: 100,
  [TowerType.SPLASH]: 150,
  [TowerType.FROST]: 75,
}
