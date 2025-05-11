"use client"

import type { Tower } from "@/lib/game-types"
import { TOWER_COSTS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Coins, Flag, ArrowUpCircle, DollarSign, Play, Pause, RotateCcw } from "lucide-react"

interface GameUIProps {
  health: number
  resources: number
  wave: number
  selectedTower: Tower | null
  gameOver: boolean
  paused: boolean
  waveInProgress: boolean
  onStartWave: () => void
  onUpgradeTower: (towerId: string) => void
  onSellTower: (towerId: string) => void
  onTogglePause: () => void
  onRestartGame: () => void
}

export default function GameUI({
  health,
  resources,
  wave,
  selectedTower,
  gameOver,
  paused,
  waveInProgress,
  onStartWave,
  onUpgradeTower,
  onSellTower,
  onTogglePause,
  onRestartGame,
}: GameUIProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Game stats */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500" />
            <span className="font-bold">{health}</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" />
            <span className="font-bold">{resources}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="text-green-500" />
            <span className="font-bold">Wave {wave}</span>
          </div>
        </div>
      </Card>

      {/* Game controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <Button onClick={onStartWave} disabled={waveInProgress || gameOver} className="w-full">
            {waveInProgress ? "Wave in progress..." : `Start Wave ${wave}`}
          </Button>

          <div className="flex gap-2">
            <Button onClick={onTogglePause} disabled={gameOver} variant="outline" className="flex-1">
              {paused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
              {paused ? "Resume" : "Pause"}
            </Button>

            <Button onClick={onRestartGame} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>
      </Card>

      {/* Selected tower info */}
      {selectedTower && (
        <Card className="p-4">
          <h3 className="font-bold mb-2">Tower Info</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>Type:</div>
            <div className="font-medium">{selectedTower.type}</div>

            <div>Level:</div>
            <div className="font-medium">{selectedTower.level}</div>

            <div>Damage:</div>
            <div className="font-medium">{selectedTower.damage.toFixed(1)}</div>

            <div>Range:</div>
            <div className="font-medium">{selectedTower.range.toFixed(1)}</div>

            <div>Attack Speed:</div>
            <div className="font-medium">{(1 / selectedTower.attackSpeed).toFixed(1)}/s</div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onUpgradeTower(selectedTower.id)}
              disabled={resources < Math.floor(TOWER_COSTS[selectedTower.type] * 0.7 * selectedTower.level)}
              className="flex-1"
            >
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Upgrade ({Math.floor(TOWER_COSTS[selectedTower.type] * 0.7 * selectedTower.level)})
            </Button>

            <Button onClick={() => onSellTower(selectedTower.id)} variant="destructive" className="flex-1">
              <DollarSign className="mr-2 h-4 w-4" />
              Sell ({Math.floor(TOWER_COSTS[selectedTower.type] * 0.5 * selectedTower.level)})
            </Button>
          </div>
        </Card>
      )}

      {/* Game over message */}
      {gameOver && (
        <Card className="p-4 bg-red-100 border-red-300">
          <h2 className="text-xl font-bold text-center mb-3">Game Over!</h2>
          <p className="text-center mb-3">You survived {wave - 1} waves</p>
          <Button onClick={onRestartGame} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </Card>
      )}
    </div>
  )
}
