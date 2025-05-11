"use client"

import { useEffect, useState, useRef } from "react"
import GameMap from "./game-map"
import GameUI from "./game-ui"
import TowerSelector from "./tower-selector"
import {
  type Tower,
  type Enemy,
  type GameState,
  type Position,
  TowerType,
  EnemyType,
  type Wave,
} from "@/lib/game-types"
import { generatePath } from "@/lib/pathfinding"
import { spawnEnemies } from "@/lib/enemy-spawner"
import { calculateDamage } from "@/lib/combat"
import { INITIAL_RESOURCES, INITIAL_HEALTH, TOWER_COSTS, MAP_WIDTH, MAP_HEIGHT, CELL_SIZE } from "@/lib/constants"

export default function TowerDefenseGame() {
  const [gameState, setGameState] = useState<GameState>({
    health: INITIAL_HEALTH,
    resources: INITIAL_RESOURCES,
    wave: 1,
    towers: [],
    enemies: [],
    path: [],
    gameOver: false,
    paused: false,
    selectedTower: null,
    selectedTowerType: null,
    waveInProgress: false,
  })

  const gameLoopRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const mapRef = useRef<HTMLDivElement>(null)

  // Initialize game
  useEffect(() => {
    // Generate initial path
    const path = generatePath({ x: 0, y: 5 }, { x: MAP_WIDTH - 1, y: 5 }, gameState.towers)
    setGameState((prev) => ({ ...prev, path }))

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState.paused || gameState.gameOver) return

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastUpdateTimeRef.current

      if (deltaTime > 16) {
        // Cap at ~60fps
        lastUpdateTimeRef.current = timestamp
        updateGame(deltaTime / 1000) // Convert to seconds
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState.paused, gameState.gameOver])

  const updateGame = (deltaTime: number) => {
    setGameState((prevState) => {
      // Skip update if paused or game over
      if (prevState.paused || prevState.gameOver) return prevState

      const newState = { ...prevState }

      // Move enemies
      newState.enemies = moveEnemies(newState.enemies, newState.path, deltaTime)

      // Tower attacks
      const { enemies, resources: resourcesAfterKills } = processTowerAttacks(
        newState.towers,
        newState.enemies,
        deltaTime,
        newState.resources,
      )
      newState.enemies = enemies
      newState.resources = resourcesAfterKills

      // Check for enemies reaching the end
      const { enemies: remainingEnemies, health } = checkEnemiesReachedEnd(newState.enemies, newState.health)
      newState.enemies = remainingEnemies
      newState.health = health

      // Check if wave is complete
      if (newState.waveInProgress && newState.enemies.length === 0) {
        newState.waveInProgress = false
        newState.wave += 1
        newState.resources += 25 + newState.wave * 5 // Bonus resources for completing wave
      }

      // Check game over
      if (newState.health <= 0) {
        newState.gameOver = true
        newState.health = 0
      }

      return newState
    })
  }

  const moveEnemies = (enemies: Enemy[], path: Position[], deltaTime: number): Enemy[] => {
    return enemies.map((enemy) => {
      // If enemy has reached the end of the path
      if (enemy.pathIndex >= path.length - 1) {
        return enemy
      }

      const targetPos = path[enemy.pathIndex + 1]
      const dx = targetPos.x - enemy.position.x
      const dy = targetPos.y - enemy.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // If enemy is close enough to the next path point, move to the next one
      if (distance < 0.1) {
        return {
          ...enemy,
          pathIndex: enemy.pathIndex + 1,
          position: { ...path[enemy.pathIndex + 1] },
        }
      }

      // Otherwise, move towards the next path point
      const speed = enemy.speed * deltaTime
      const moveX = (dx / distance) * speed
      const moveY = (dy / distance) * speed

      return {
        ...enemy,
        position: {
          x: enemy.position.x + moveX,
          y: enemy.position.y + moveY,
        },
      }
    })
  }

  const processTowerAttacks = (
    towers: Tower[],
    enemies: Enemy[],
    deltaTime: number,
    resources: number,
  ): { enemies: Enemy[]; resources: number } => {
    let newResources = resources

    // Update tower cooldowns and attack
    const updatedTowers = towers.map((tower) => {
      let cooldown = tower.cooldown - deltaTime
      let hasAttacked = false

      if (cooldown <= 0 && enemies.length > 0) {
        // Find enemies in range
        const enemiesInRange = enemies.filter((enemy) => {
          const dx = enemy.position.x - tower.position.x
          const dy = enemy.position.y - tower.position.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          return distance <= tower.range
        })

        // Sort by progress along path (target furthest along)
        enemiesInRange.sort((a, b) => b.pathIndex - a.pathIndex)

        if (enemiesInRange.length > 0) {
          const targetEnemy = enemiesInRange[0]

          // Apply damage based on tower type and enemy type
          enemies = enemies.map((enemy) => {
            if (enemy.id === targetEnemy.id) {
              const damage = calculateDamage(tower.type, enemy.type, tower.damage)
              const newHealth = enemy.health - damage

              return {
                ...enemy,
                health: newHealth,
              }
            }
            return enemy
          })

          cooldown = tower.attackSpeed
          hasAttacked = true
        }
      }

      return {
        ...tower,
        cooldown: cooldown > 0 ? cooldown : 0,
      }
    })

    // Remove dead enemies and award resources
    const remainingEnemies: Enemy[] = []
    enemies.forEach((enemy) => {
      if (enemy.health <= 0) {
        newResources += enemy.reward
      } else {
        remainingEnemies.push(enemy)
      }
    })

    return { enemies: remainingEnemies, resources: newResources }
  }

  const checkEnemiesReachedEnd = (enemies: Enemy[], health: number): { enemies: Enemy[]; health: number } => {
    const remainingEnemies: Enemy[] = []
    let newHealth = health

    enemies.forEach((enemy) => {
      if (enemy.pathIndex >= enemy.path.length - 1) {
        newHealth -= enemy.damage
      } else {
        remainingEnemies.push(enemy)
      }
    })

    return { enemies: remainingEnemies, health: newHealth }
  }

  const handleStartWave = () => {
    if (gameState.waveInProgress) return

    const wave: Wave = {
      number: gameState.wave,
      enemies: [
        { type: EnemyType.NORMAL, count: Math.floor(gameState.wave * 1.5) },
        { type: EnemyType.FAST, count: Math.floor(gameState.wave * 0.5) },
        { type: EnemyType.ARMORED, count: Math.floor((gameState.wave - 1) * 0.3) },
      ],
    }

    const newEnemies = spawnEnemies(wave, gameState.path)

    setGameState((prev) => ({
      ...prev,
      enemies: [...prev.enemies, ...newEnemies],
      waveInProgress: true,
    }))
  }

  const handlePlaceTower = (position: Position) => {
    if (!gameState.selectedTowerType) return

    // Check if position is valid (not on path and not occupied by another tower)
    const isOnPath = gameState.path.some((p) => Math.abs(p.x - position.x) < 0.5 && Math.abs(p.y - position.y) < 0.5)

    const isOccupied = gameState.towers.some(
      (t) => Math.abs(t.position.x - position.x) < 0.5 && Math.abs(t.position.y - position.y) < 0.5,
    )

    if (isOnPath || isOccupied) return

    // Check if player has enough resources
    const towerCost = TOWER_COSTS[gameState.selectedTowerType]
    if (gameState.resources < towerCost) return

    // Create new tower
    const newTower: Tower = {
      id: Date.now().toString(),
      type: gameState.selectedTowerType,
      position,
      range: getTowerRange(gameState.selectedTowerType),
      damage: getTowerDamage(gameState.selectedTowerType),
      attackSpeed: getTowerAttackSpeed(gameState.selectedTowerType),
      cooldown: 0,
      level: 1,
    }

    // Update game state
    setGameState((prev) => {
      const newTowers = [...prev.towers, newTower]
      // Recalculate path when a new tower is placed
      const newPath = generatePath({ x: 0, y: 5 }, { x: MAP_WIDTH - 1, y: 5 }, newTowers)

      return {
        ...prev,
        towers: newTowers,
        resources: prev.resources - towerCost,
        path: newPath,
        selectedTowerType: null,
      }
    })
  }

  const handleSelectTower = (tower: Tower | null) => {
    setGameState((prev) => ({
      ...prev,
      selectedTower: tower,
      selectedTowerType: null,
    }))
  }

  const handleSelectTowerType = (type: TowerType) => {
    setGameState((prev) => ({
      ...prev,
      selectedTowerType: type,
      selectedTower: null,
    }))
  }

  const handleUpgradeTower = (towerId: string) => {
    const tower = gameState.towers.find((t) => t.id === towerId)
    if (!tower) return

    const upgradeCost = Math.floor(TOWER_COSTS[tower.type] * 0.7 * tower.level)
    if (gameState.resources < upgradeCost) return

    setGameState((prev) => {
      const updatedTowers = prev.towers.map((t) => {
        if (t.id === towerId) {
          return {
            ...t,
            level: t.level + 1,
            damage: t.damage * 1.3,
            range: t.range * 1.1,
            attackSpeed: t.attackSpeed * 0.9,
          }
        }
        return t
      })

      return {
        ...prev,
        towers: updatedTowers,
        resources: prev.resources - upgradeCost,
      }
    })
  }

  const handleSellTower = (towerId: string) => {
    const tower = gameState.towers.find((t) => t.id === towerId)
    if (!tower) return

    const sellValue = Math.floor(TOWER_COSTS[tower.type] * 0.5 * tower.level)

    setGameState((prev) => {
      const updatedTowers = prev.towers.filter((t) => t.id !== towerId)
      // Recalculate path when a tower is removed
      const newPath = generatePath({ x: 0, y: 5 }, { x: MAP_WIDTH - 1, y: 5 }, updatedTowers)

      return {
        ...prev,
        towers: updatedTowers,
        resources: prev.resources + sellValue,
        path: newPath,
        selectedTower: null,
      }
    })
  }

  const handleTogglePause = () => {
    setGameState((prev) => ({
      ...prev,
      paused: !prev.paused,
    }))
  }

  const handleRestartGame = () => {
    setGameState({
      health: INITIAL_HEALTH,
      resources: INITIAL_RESOURCES,
      wave: 1,
      towers: [],
      enemies: [],
      path: generatePath({ x: 0, y: 5 }, { x: MAP_WIDTH - 1, y: 5 }, []),
      gameOver: false,
      paused: false,
      selectedTower: null,
      selectedTowerType: null,
      waveInProgress: false,
    })
  }

  // Helper functions for tower properties
  const getTowerRange = (type: TowerType): number => {
    switch (type) {
      case TowerType.BASIC:
        return 2
      case TowerType.SNIPER:
        return 4
      case TowerType.SPLASH:
        return 1.5
      case TowerType.FROST:
        return 2
      default:
        return 2
    }
  }

  const getTowerDamage = (type: TowerType): number => {
    switch (type) {
      case TowerType.BASIC:
        return 10
      case TowerType.SNIPER:
        return 25
      case TowerType.SPLASH:
        return 8
      case TowerType.FROST:
        return 5
      default:
        return 10
    }
  }

  const getTowerAttackSpeed = (type: TowerType): number => {
    switch (type) {
      case TowerType.BASIC:
        return 1
      case TowerType.SNIPER:
        return 2
      case TowerType.SPLASH:
        return 1.5
      case TowerType.FROST:
        return 0.8
      default:
        return 1
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl">
      <div className="relative" ref={mapRef}>
        <GameMap
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          cellSize={CELL_SIZE}
          path={gameState.path}
          towers={gameState.towers}
          enemies={gameState.enemies}
          selectedTower={gameState.selectedTower}
          selectedTowerType={gameState.selectedTowerType}
          onPlaceTower={handlePlaceTower}
          onSelectTower={handleSelectTower}
        />
      </div>

      <div className="flex flex-col gap-4">
        <GameUI
          health={gameState.health}
          resources={gameState.resources}
          wave={gameState.wave}
          selectedTower={gameState.selectedTower}
          gameOver={gameState.gameOver}
          paused={gameState.paused}
          waveInProgress={gameState.waveInProgress}
          onStartWave={handleStartWave}
          onUpgradeTower={handleUpgradeTower}
          onSellTower={handleSellTower}
          onTogglePause={handleTogglePause}
          onRestartGame={handleRestartGame}
        />

        <TowerSelector
          selectedTowerType={gameState.selectedTowerType}
          resources={gameState.resources}
          onSelectTowerType={handleSelectTowerType}
        />
      </div>
    </div>
  )
}
