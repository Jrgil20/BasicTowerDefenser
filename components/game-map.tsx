"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { type Tower, type Enemy, type Position, TowerType } from "@/lib/game-types"

interface GameMapProps {
  width: number
  height: number
  cellSize: number
  path: Position[]
  towers: Tower[]
  enemies: Enemy[]
  selectedTower: Tower | null
  selectedTowerType: TowerType | null
  onPlaceTower: (position: Position) => void
  onSelectTower: (tower: Tower | null) => void
}

export default function GameMap({
  width,
  height,
  cellSize,
  path,
  towers,
  enemies,
  selectedTower,
  selectedTowerType,
  onPlaceTower,
  onSelectTower,
}: GameMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle canvas click for tower placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / cellSize)
    const y = Math.floor((e.clientY - rect.top) / cellSize)

    // If a tower type is selected, place a tower
    if (selectedTowerType) {
      onPlaceTower({ x, y })
    } else {
      // Otherwise, check if a tower was clicked
      const clickedTower = towers.find(
        (tower) => Math.abs(tower.position.x - x) < 0.5 && Math.abs(tower.position.y - y) < 0.5,
      )

      onSelectTower(clickedTower || null)
    }
  }

  // Draw game on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 0.5

    for (let x = 0; x <= width; x++) {
      ctx.beginPath()
      ctx.moveTo(x * cellSize, 0)
      ctx.lineTo(x * cellSize, height * cellSize)
      ctx.stroke()
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * cellSize)
      ctx.lineTo(width * cellSize, y * cellSize)
      ctx.stroke()
    }

    // Draw path
    if (path.length > 0) {
      ctx.strokeStyle = "#8B4513"
      ctx.lineWidth = cellSize * 0.8
      ctx.beginPath()
      ctx.moveTo(path[0].x * cellSize + cellSize / 2, path[0].y * cellSize + cellSize / 2)

      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x * cellSize + cellSize / 2, path[i].y * cellSize + cellSize / 2)
      }

      ctx.stroke()
    }

    // Draw towers
    towers.forEach((tower) => {
      const x = tower.position.x * cellSize + cellSize / 2
      const y = tower.position.y * cellSize + cellSize / 2

      // Draw tower base
      ctx.fillStyle = getTowerColor(tower.type)
      ctx.beginPath()
      ctx.arc(x, y, cellSize * 0.4, 0, Math.PI * 2)
      ctx.fill()

      // Draw tower level
      ctx.fillStyle = "white"
      ctx.font = `${cellSize * 0.3}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(tower.level.toString(), x, y)

      // Draw range circle for selected tower
      if (selectedTower && tower.id === selectedTower.id) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, tower.range * cellSize, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    // Draw enemies
    enemies.forEach((enemy) => {
      const x = enemy.position.x * cellSize + cellSize / 2
      const y = enemy.position.y * cellSize + cellSize / 2

      // Draw enemy
      ctx.fillStyle = getEnemyColor(enemy.type)
      ctx.beginPath()
      ctx.arc(x, y, cellSize * 0.3, 0, Math.PI * 2)
      ctx.fill()

      // Draw health bar
      const healthBarWidth = cellSize * 0.6
      const healthBarHeight = cellSize * 0.1
      const healthPercentage = enemy.health / enemy.maxHealth

      ctx.fillStyle = "red"
      ctx.fillRect(x - healthBarWidth / 2, y - cellSize * 0.5, healthBarWidth, healthBarHeight)

      ctx.fillStyle = "green"
      ctx.fillRect(x - healthBarWidth / 2, y - cellSize * 0.5, healthBarWidth * healthPercentage, healthBarHeight)
    })

    // Draw placement preview if a tower type is selected
    if (selectedTowerType) {
      canvas.style.cursor = "pointer"
    } else {
      canvas.style.cursor = "default"
    }
  }, [width, height, cellSize, path, towers, enemies, selectedTower, selectedTowerType])

  // Helper functions for colors
  const getTowerColor = (type: TowerType): string => {
    switch (type) {
      case TowerType.BASIC:
        return "#3498db"
      case TowerType.SNIPER:
        return "#e74c3c"
      case TowerType.SPLASH:
        return "#f39c12"
      case TowerType.FROST:
        return "#1abc9c"
      default:
        return "#3498db"
    }
  }

  const getEnemyColor = (type: string): string => {
    switch (type) {
      case "NORMAL":
        return "#7f8c8d"
      case "FAST":
        return "#2ecc71"
      case "ARMORED":
        return "#34495e"
      default:
        return "#7f8c8d"
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={width * cellSize}
      height={height * cellSize}
      onClick={handleCanvasClick}
      className="border border-gray-300 bg-gray-100"
    />
  )
}
