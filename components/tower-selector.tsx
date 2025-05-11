"use client"

import { TowerType } from "@/lib/game-types"
import { TOWER_COSTS } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Crosshair, Target, Snowflake } from "lucide-react"

interface TowerSelectorProps {
  selectedTowerType: TowerType | null
  resources: number
  onSelectTowerType: (type: TowerType) => void
}

export default function TowerSelector({ selectedTowerType, resources, onSelectTowerType }: TowerSelectorProps) {
  const towers = [
    {
      type: TowerType.BASIC,
      name: "Basic",
      description: "Balanced tower with medium range and damage",
      icon: <Zap className="h-5 w-5" />,
      cost: TOWER_COSTS[TowerType.BASIC],
    },
    {
      type: TowerType.SNIPER,
      name: "Sniper",
      description: "Long range with high damage but slow attack speed",
      icon: <Crosshair className="h-5 w-5" />,
      cost: TOWER_COSTS[TowerType.SNIPER],
    },
    {
      type: TowerType.SPLASH,
      name: "Splash",
      description: "Area damage affecting multiple enemies",
      icon: <Target className="h-5 w-5" />,
      cost: TOWER_COSTS[TowerType.SPLASH],
    },
    {
      type: TowerType.FROST,
      name: "Frost",
      description: "Slows down enemies in range",
      icon: <Snowflake className="h-5 w-5" />,
      cost: TOWER_COSTS[TowerType.FROST],
    },
  ]

  return (
    <Card className="p-4">
      <h3 className="font-bold mb-2">Towers</h3>
      <div className="grid grid-cols-2 gap-2">
        {towers.map((tower) => (
          <Button
            key={tower.type}
            variant={selectedTowerType === tower.type ? "default" : "outline"}
            className="flex flex-col items-center p-2 h-auto"
            disabled={resources < tower.cost}
            onClick={() => onSelectTowerType(tower.type)}
          >
            <div className="flex items-center gap-1 mb-1">
              {tower.icon}
              <span>{tower.name}</span>
            </div>
            <span className="text-xs text-center">{tower.cost} coins</span>
          </Button>
        ))}
      </div>

      {selectedTowerType && (
        <div className="mt-3 text-sm text-center">Click on the map to place the selected tower</div>
      )}
    </Card>
  )
}
