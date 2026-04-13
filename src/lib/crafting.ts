export interface CraftIngredient {
  itemId: number
  quantity: number
}

export interface CraftRecipe {
  outputItemId: number
  outputQuantityAvg: number // průměr s Multicraft procem
  ingredients: CraftIngredient[]
}

// AH cut = 5 %
const AH_CUT = 0.05

export function calcCraftProfit(
  recipe: CraftRecipe,
  ahPrices: Map<number, number> // itemId → cena v copper
): number {
  const sellPrice   = (ahPrices.get(recipe.outputItemId) ?? 0) * recipe.outputQuantityAvg
  const materialCost = recipe.ingredients.reduce(
    (sum, ing) => sum + (ahPrices.get(ing.itemId) ?? 0) * ing.quantity,
    0
  )
  const ahCut = sellPrice * AH_CUT
  return sellPrice - materialCost - ahCut
}

export function copperToGoldString(copper: number): string {
  const gold   = Math.floor(Math.abs(copper) / 10000)
  const silver = Math.floor((Math.abs(copper) % 10000) / 100)
  const sign   = copper < 0 ? '-' : ''
  return `${sign}${gold}g ${silver.toString().padStart(2, '0')}s`
}

// Sestavení price mapy z AH Commodities API response
export function buildPriceMap(
  auctions: Array<{ item: { id: number }; unit_price: number }>
): Map<number, number> {
  const map = new Map<number, number>()
  for (const a of auctions) {
    const existing = map.get(a.item.id)
    if (existing === undefined || a.unit_price < existing) {
      map.set(a.item.id, a.unit_price)
    }
  }
  return map
}
