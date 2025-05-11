import { type Enemy, EnemyType, type Position, type Wave } from "./game-types"

// Spawn enemies for a wave
export function spawnEnemies(wave: Wave, path: Position[]): Enemy[] {
  const enemies: Enemy[] = []
  let delay = 0

  for (const enemyType of wave.enemies) {
    for (let i = 0; i < enemyType.count; i++) {
      const enemy = createEnemy(enemyType.type, path, delay)
      enemies.push(enemy)
      delay += 0.5 // Stagger enemy spawns
    }
  }

  return enemies
}

// Create a single enemy
function createEnemy(type: EnemyType, path: Position[], delay: number): Enemy {
  const baseHealth = type === EnemyType.ARMORED ? 50 : 30
  const baseSpeed = type === EnemyType.FAST ? 2 : 1
  const baseDamage = 10
  const baseReward = 10

  // Scale based on type
  let health = baseHealth
  let speed = baseSpeed
  let damage = baseDamage
  let reward = baseReward

  switch (type) {
    case EnemyType.NORMAL:
      // Normal is baseline
      break
    case EnemyType.FAST:
      health *= 0.7
      speed *= 1.5
      reward *= 1.2
      break
    case EnemyType.ARMORED:
      health *= 2
      speed *= 0.7
      damage *= 1.5
      reward *= 1.5
      break
  }

  // Position enemy at start of path with offset based on delay
  const startPos = { ...path[0] }
  startPos.x -= delay * baseSpeed

  return {
    id: Date.now().toString() + Math.random().toString(),
    type,
    position: startPos,
    health,
    maxHealth: health,
    speed,
    damage,
    reward,
    pathIndex: 0,
    path,
  }
}
