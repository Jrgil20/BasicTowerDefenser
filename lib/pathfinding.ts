import type { Position, Tower } from "./game-types"

// A* pathfinding algorithm to find path from start to end
export function generatePath(start: Position, end: Position, towers: Tower[]): Position[] {
  const grid: number[][] = createGrid(towers)
  const openSet: Node[] = []
  const closedSet: Node[] = []
  const startNode = new Node(start.x, start.y)
  const endNode = new Node(end.x, end.y)

  openSet.push(startNode)

  while (openSet.length > 0) {
    // Find node with lowest f score
    let currentIndex = 0
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i
      }
    }

    const current = openSet[currentIndex]

    // If we reached the end
    if (current.x === endNode.x && current.y === endNode.y) {
      return reconstructPath(current)
    }

    // Move current from open to closed set
    openSet.splice(currentIndex, 1)
    closedSet.push(current)

    // Check neighbors
    const neighbors = getNeighbors(current, grid)

    for (const neighbor of neighbors) {
      // Skip if in closed set
      if (closedSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
        continue
      }

      // Calculate g score
      const tentativeG = current.g + 1

      // Check if neighbor is in open set
      const openNeighbor = openSet.find((node) => node.x === neighbor.x && node.y === neighbor.y)

      if (!openNeighbor) {
        // New node, add to open set
        neighbor.g = tentativeG
        neighbor.h = heuristic(neighbor, endNode)
        neighbor.f = neighbor.g + neighbor.h
        neighbor.parent = current
        openSet.push(neighbor)
      } else if (tentativeG < openNeighbor.g) {
        // Better path to existing node
        openNeighbor.g = tentativeG
        openNeighbor.f = openNeighbor.g + openNeighbor.h
        openNeighbor.parent = current
      }
    }
  }

  // No path found, return direct line
  return [start, end]
}

// Create grid with towers as obstacles
function createGrid(towers: Tower[]): number[][] {
  const grid: number[][] = []

  // Initialize grid
  for (let y = 0; y < 10; y++) {
    grid[y] = []
    for (let x = 0; x < 15; x++) {
      grid[y][x] = 0 // 0 = walkable
    }
  }

  // Mark towers as obstacles
  for (const tower of towers) {
    const x = Math.floor(tower.position.x)
    const y = Math.floor(tower.position.y)

    if (x >= 0 && x < 15 && y >= 0 && y < 10) {
      grid[y][x] = 1 // 1 = obstacle
    }
  }

  return grid
}

// Get valid neighbors for a node
function getNeighbors(node: Node, grid: number[][]): Node[] {
  const neighbors: Node[] = []
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 }, // Right
    { x: 0, y: 1 }, // Down
    { x: -1, y: 0 }, // Left
  ]

  for (const dir of directions) {
    const x = node.x + dir.x
    const y = node.y + dir.y

    // Check if in bounds
    if (x < 0 || x >= 15 || y < 0 || y >= 10) {
      continue
    }

    // Check if walkable
    if (grid[y][x] === 1) {
      continue
    }

    const neighbor = new Node(x, y)
    neighbors.push(neighbor)
  }

  return neighbors
}

// Manhattan distance heuristic
function heuristic(a: Node, b: Node): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

// Reconstruct path from end to start
function reconstructPath(endNode: Node): Position[] {
  const path: Position[] = []
  let current: Node | null = endNode

  while (current) {
    path.unshift({ x: current.x, y: current.y })
    current = current.parent
  }

  return path
}

// Node class for A* algorithm
class Node {
  x: number
  y: number
  g = 0 // Cost from start to current
  h = 0 // Heuristic (estimated cost to end)
  f = 0 // g + h
  parent: Node | null = null

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}
