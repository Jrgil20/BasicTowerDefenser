import { TowerType, EnemyType } from "./game-types"

// Calculate damage based on tower type and enemy type
export function calculateDamage(towerType: TowerType, enemyType: EnemyType, baseDamage: number): number {
  let damageMultiplier = 1.0

  // Apply type advantages/disadvantages
  switch (towerType) {
    case TowerType.BASIC:
      // Basic has no special advantages
      break
    case TowerType.SNIPER:
      // Sniper is effective against armored
      if (enemyType === EnemyType.ARMORED) {
        damageMultiplier = 1.5
      }
      break
    case TowerType.SPLASH:
      // Splash is effective against normal
      if (enemyType === EnemyType.NORMAL) {
        damageMultiplier = 1.3
      }
      break
    case TowerType.FROST:
      // Frost is effective against fast
      if (enemyType === EnemyType.FAST) {
        damageMultiplier = 1.4
      }
      break
  }

  // Apply enemy resistances
  if (enemyType === EnemyType.ARMORED && towerType !== TowerType.SNIPER) {
    damageMultiplier *= 0.7 // Armored enemies take less damage except from snipers
  }

  return baseDamage * damageMultiplier
}
