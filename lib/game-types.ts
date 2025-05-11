export interface Position {
  x: number
  y: number
}

export enum TowerType {
  BASIC = "BASIC",
  SNIPER = "SNIPER",
  SPLASH = "SPLASH",
  FROST = "FROST",
}

export enum EnemyType {
  NORMAL = "NORMAL",
  FAST = "FAST",
  ARMORED = "ARMORED",
}

export interface Tower {
  id: string
  type: TowerType
  position: Position
  range: number
  damage: number
  attackSpeed: number // Time between attacks in seconds
  cooldown: number // Current cooldown timer
  level: number
}

export interface Enemy {
  id: string
  type: EnemyType
  position: Position
  health: number
  maxHealth: number
  speed: number
  damage: number // Damage to player health when reaching the end
  reward: number // Resources gained when killed
  pathIndex: number // Current position in the path
  path: Position[] // Reference to the path this enemy follows
}

export interface Wave {
  number: number
  enemies: {
    type: EnemyType
    count: number
  }[]
}

export interface GameState {
  health: number
  resources: number
  wave: number
  towers: Tower[]
  enemies: Enemy[]
  path: Position[]
  gameOver: boolean
  paused: boolean
  selectedTower: Tower | null
  selectedTowerType: TowerType | null
  waveInProgress: boolean
}
